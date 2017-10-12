import {ICollection} from "./collection"

const sequelize = require('sequelize')

import {CollectionTrellis, DatabaseClient, TableClient, Property, Trellis} from './types'
import {to_lower} from "./utility";
import {QueryBuilder} from "./sql/query-builder";

// let BigNumber = null

export type ThenableCallback<N, O> = (result: O) => N | Promise<N>

export interface Query<T, O> {
  exec(): Promise<O>

  expand<T2, O2>(path: string): Query<T2, O2>

  filter(options: any): Query<T, T[]>

  first(options?: any): Query<T, T | undefined>

  join<T2, O2>(collection: ICollection): Query<T2, O2>

  range(start?: number, length?: number): Query<T, O>

  select<T2, O2>(options: any): Query<T2, O2>

  sort(args: string[]): Query<T, O>

  then<N>(callback: ThenableCallback<N, O>): Promise<N>
}

enum Reduce_Mode {
  none,
  first,
  single_value,
}

function processFields(result: any, trellis: Trellis) {
  if (trellis.oldTable.sequelize.getDialect() == 'mysql') {
    for (let i in trellis.properties) {
      const property = trellis.properties[i]
      if (property.type.name == 'json') {
        result[i] = JSON.parse(result[i])
      }
    }
  }

  for (let i in trellis.properties) {
    const property = trellis.properties[i]
    if (property.type.name == 'long') {
      result[i] = parseInt(result[i])
    }
    // else if (property.type.name == 'colossal') {
    //   result[i] = new BigNumber(result[i])
    // }
  }
  return result
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

export class Query_Implementation<T, O> implements Query<T, O> {
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
    // where[to_lower(reference.get_other_trellis().name)] =
    //   sequelize.col(reference.get_other_trellis().primary_key.name)

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

  private queryWithQueryBuilder() {
    const legacyClient = this.client.getLegacyClient()
    if (legacyClient)
      return legacyClient.findAll(this.table, this.options)

    const builder = new QueryBuilder(this.trellis)
    this.bundle = builder.build(this.options)
    return this.client.query<T>(this.bundle.sql, this.bundle.args)
      .then(result => result.rows)
  }

  exec(): Promise<O> {
    return this.queryWithQueryBuilder()
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

  expand<T2, O2>(path: string): Query<T2, O2> {
    if (!this.trellis.properties[path])
      throw new Error("No such property: " + this.trellis.name + '.' + path + '.')

    this.expansions[path] = null
    return this as any
  }

  filter(options: any): Query<T, T[]> {
    for (var i in options) {
      const option = options [i]
      if (option && option[this.trellis.primary_keys[0].name]) {
        options[i] = option[this.trellis.primary_keys[0].name]
      }
    }
    this.options.where = options
    return this as any
  }

  first(options?: any): Query<T, T | undefined> {
    this.set_reduce_mode(Reduce_Mode.first)
    return options
      ? this.filter(options) as any
      : this as any
  }

  join<T2, O2>(collection: ICollection): Query<T2, O2> {
    this.options.include = this.options.include || []
    // this.options.include.push(collection.get_sequelize())
    throw new Error("Not implemented.")
    // return this as any
  }

  range(start?: number, length?: number): Query<T, O> {
    if (start)
      this.options.offset = start

    if (length)
      this.options.limit = length

    return this
  }

  select<T2, O2>(options: any): Query<T2, O2> {
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

  sort(args: string[]): Query<T, O> {
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