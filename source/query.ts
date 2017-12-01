import {ICollection} from "./collection"

const sequelize = require('sequelize')

import {CollectionTrellis, DatabaseClient, TableClient, Property, Trellis} from './types'
import {processFields, to_lower} from "./utility";
import {QueryGenerator} from "./sql/query-generator";

const BigNumber = require("bignumber.js")

// let BigNumber = null

export type ThenableCallback<N, O> = (result: O) => N | Promise<N>

export interface QueryBuilder<T, O> {

  /**
   * Executes the query.  This is only needed when `then` may not be called.
   */
  exec(): Promise<O>

  /**
   * Changes a returned foreign key field to be returned as an object instead of a scalar key value.
   *
   *
   * @param path   Path to the foreign key field to be expanded into an object
   */
  expand<T2, O2>(path: string): QueryBuilder<T2, O2>

  /**
   * Filters a result set using a dictionary of key value pairs.
   * Maps to a SQL `WHERE` clause.
   * Currently this function only uses AND logic and does not support OR logic.
   * It also does not support null checks such as `WHERE field IS NULL`
   *
   * @param filters   Dictionary of key/value pairs
   */
  filter(options: any): QueryBuilder<T, T[]>

  /**
   * Returns the first record in a result set
   *
   * @param filters   A dictionary of key/value pairs to filter the result set by
   */
  first(options?: any): QueryBuilder<T, T | undefined>

  /**
   * Truncates a result set.
   * Maps to a SQL `LIMIT` clause.
   *
   * @param start   The offset of the truncation.
   *
   * @param length   The maximum number or records to return
   *
   */
  range(start?: number, length?: number): QueryBuilder<T, O>

  select<T2, O2>(options: any): QueryBuilder<T2, O2>

  /**
   * Sorts a result set.
   * Maps to a SQL `ORDER BY` clause
   *
   * Examples:
   *
   * Ship.all().sort(['speed'])
   *
   * Monster.all().sort(['height', 'desc', 'scariness'])
   *
   * @param args   An array of field names and optional 'asc' or 'desc' modifiers
   *
   *
   */
  sort(args: string[]): QueryBuilder<T, O>

  /**
   * Executes the query and attaches a handler to the promise resolution.
   */
  then<N>(callback: ThenableCallback<N, O>): Promise<N>

  // This function never fully worked right and is complicated to fully support.
  // It is up in the air whether open-ended joins will be supported in the future.
  //
  // join<T2, O2>(collection: ICollection): QueryBuilder<T2, O2>
}

enum Reduce_Mode {
  none,
  first,
  single_value,
}

interface QueryOptions {
  where?: any
  include?: any []
  offset?: number
  limit?: number
  attributes?: any []
  order?: string []
}

function getData(row: any) {
  return row.dataValues || row
}

export class Query_Implementation<T, O> implements QueryBuilder<T, O> {
  private table: TableClient<T>
  private client: DatabaseClient
  private trellis: CollectionTrellis<T>
  private options: QueryOptions = {}
  private reduce_mode: Reduce_Mode = Reduce_Mode.none
  private expansions: any = {}
  private allow_null: boolean = true
  private bundle: any

  constructor(table: TableClient<T>, client: DatabaseClient, trellis: CollectionTrellis<T>) {
    this.table = table
    this.trellis = trellis
    this.client = client

    // Monkey patch for soft backwards compatibility
    const self = this as any
    self.firstOrNull = this.first
    self.first_or_null = this.first
  }

  private set_reduce_mode(value: Reduce_Mode) {
    if (this.reduce_mode == value)
      return

    if (this.reduce_mode != Reduce_Mode.none && value != Reduce_Mode.single_value) {
      throw new Error("Reduce mode already set.")
    }

    this.reduce_mode = value
  }

  private get_other_collection(path: string) {
    const reference = this.trellis.properties[path] as Property
    return reference.get_other_trellis().collection
  }

  private expand_cross_table(reference: Property, identity: any) {
    const where: any = {}
    where[to_lower(reference.trellis.name)] = identity

    return reference.other_property.trellis.oldTable.findAll({
      include: {
        model: reference.trellis.oldTable,
        through: {where: where},
        as: reference.other_property.name,
        required: true
      }
    })
      .then((result: any) => result.map((r: any) => processFields(getData(r), reference.other_property.trellis)))
  }

  private perform_expansion(path: string, data: any) {
    const property = this.trellis.properties[path]
    if (property.is_list()) {
      return property.other_property.is_list()
        ? this.expand_cross_table(property, this.trellis.get_identity(data))
        : this.get_other_collection(path).filter({[property.other_property.name]: data})
    }
    else {
      return this.get_other_collection(path).get(data[path])
    }
  }

  private handle_expansions(results: any) {
    let promises = results.map((result: any) => Promise.all(this.get_expansions()
      .map(path => this.perform_expansion(path, getData(result))
        .then((child: any) => getData(result)[path] = child)
      )
    ))

    return Promise.all(promises)
      .then(() => results) // Not needed but a nice touch.
  }

  private process_result(result: any) {
    if (this.reduce_mode == Reduce_Mode.first) {
      if (result.length == 0) {
        if (this.allow_null)
          return null

        throw Error("Query.first called on empty result set.")
      }

      return processFields(getData(result [0]), this.trellis)
    }
    else if (this.reduce_mode == Reduce_Mode.single_value) {
      if (result.length == 0) {
        if (this.allow_null)
          return null

        throw Error("Query.select single value called on empty result set.")
      }

      return getData(result[0])._value
    }

    return result.map((item: any) => processFields(getData(item), this.trellis))
  }

  private process_result_with_expansions(result: any) {
    return this.handle_expansions(result)
      .then(result => this.process_result(result))
  }

  private get_expansions() {
    return Object.keys(this.expansions)
  }

  private has_expansions() {
    return this.get_expansions().length > 0
  }

  private queryWithQueryGenerator() {
    const legacyClient = this.client.getLegacyClient()
    if (legacyClient)
      return legacyClient.findAll(this.table, this.options)

    const generator = new QueryGenerator(this.trellis)
    this.bundle = generator.generate(this.options)
    return this.client.query<T>(this.bundle.sql, this.bundle.args)
      .then(result => result.rows)
  }

  exec(): Promise<O> {
    return this.queryWithQueryGenerator()
      .then((result: any) => this.has_expansions()
        ? this.process_result_with_expansions(result)
        : this.process_result(result)
      )
      .catch((error: Error) => {
        if (this.bundle)
          console.error(this.bundle)
        else
          console.error(this.options)
        throw error
      })
  }

  expand<T2, O2>(path: string): QueryBuilder<T2, O2> {
    if (!this.trellis.properties[path])
      throw new Error("No such property: " + this.trellis.name + '.' + path + '.')

    this.expansions[path] = null
    return this as any
  }

  filter(filters: any): QueryBuilder<T, T[]> {
    for (var i in filters) {
      const option = filters [i]
      if (option && option[this.trellis.primary_keys[0].name]) {
        filters[i] = option[this.trellis.primary_keys[0].name]
      }
    }
    this.options.where = filters
    return this as any
  }

  first(filters?: any): QueryBuilder<T, T | undefined> {
    this.set_reduce_mode(Reduce_Mode.first)
    return filters
      ? this.filter(filters) as any
      : this as any
  }

  // join<T2, O2>(collection: ICollection): QueryBuilder<T2, O2> {
  //   this.options.include = this.options.include || []
  //   // this.options.include.push(collection.get_sequelize())
  //   throw new Error("Not implemented.")
  //   // return this as any
  // }

  range(start?: number, length?: number): QueryBuilder<T, O> {
    if (start)
      this.options.offset = start

    if (length)
      this.options.limit = length

    return this
  }

  select<T2, O2>(options: any): QueryBuilder<T2, O2> {
    if (typeof options === 'string')
      options = [options]

    if (options.length == 1) {
      const entry = options[0]
      options = Array.isArray(entry)
        ? [[entry[0], '_value']]
        : [[entry, '_value']]
      this.set_reduce_mode(Reduce_Mode.single_value)
    }
    this.options.attributes = options
    return this as any
  }

  sort(args: string[]): QueryBuilder<T, O> {
    this.options.order = args
    return this
  }

  then<N>(callback: ThenableCallback<N, O>): Promise<N> {
    return this.exec()
      .then(callback)
  }
}

export function Path(path: string) {
  return sequelize.col(path)
}

export function Sum(path: string) {
  return sequelize.fn('SUM', sequelize.col(path))
}

export function Count(path: string) {
  return sequelize.fn('COUNT', sequelize.col(path))
}