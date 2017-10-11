import {ICollection} from "./collection"

const sequelize = require('sequelize')

import {Collection_Trellis, Property, Trellis} from './types'
import {to_lower} from "./utility";

// let BigNumber = null

export interface Query<T> {
  then(any: any): Promise<any>

  exec(): Promise<any>

  expand<T2>(path: string): Query<T2>

  filter(options: any): Query<T>

  first(options?: any): Query<T>

  first_or_null(options?: any): Query<T>

  firstOrNull(options?: any): Query<T>

  join<N>(collection: ICollection): Query<N>

  select<N>(options: any): Query<N>

  range(start?: number, length?: number): Query<T>

  sort(args: string[]): Query<T>
}

enum Reduce_Mode {
  none,
  first,
  single_value,
}

function processFields(result: any, trellis: Trellis) {
  if (trellis.table.sequelize.getDialect() == 'mysql') {
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

export class Query_Implementation<T> implements Query<T> {
  private sequelize: any
  private trellis: Collection_Trellis<T>
  private options: QueryOptions = {}
  private reduce_mode: Reduce_Mode = Reduce_Mode.none
  private expansions:any  = {}
  private allow_null: boolean = true

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

    return reference.other_property.trellis.table.findAll({
      include: {
        model: reference.trellis['table'],
        through: {where: where},
        as: reference.other_property.name,
        required: true
      }
    })
      .then((result: any) => result.map((r: any) => processFields(r.dataValues, reference.other_property.trellis)))
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
      .map(path => this.perform_expansion(path, result.dataValues)
        .then((child: any) => result.dataValues[path] = child)
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

      return processFields(result [0].dataValues, this.trellis)
    }
    else if (this.reduce_mode == Reduce_Mode.single_value) {
      if (result.length == 0) {
        if (this.allow_null)
          return null

        throw Error("Query.select single value called on empty result set.")
      }

      return result.map((item: any) => item.dataValues._value);
    }

    return result.map((item: any) => processFields(item.dataValues, this.trellis))
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

  constructor(sequelize: any, trellis: Collection_Trellis<T>) {
    this.sequelize = sequelize
    this.trellis = trellis
  }

  exec(): Promise<any> {
    return this.sequelize.findAll(this.options)
      .then((result: any) => this.has_expansions()
        ? this.process_result_with_expansions(result)
        : this.process_result(result)
      )
      .catch((error: Error) => {
        console.error(this.options)
        throw error
      })
  }

  then(callback: any): Promise<any> {
    return this.exec()
      .then(callback)
  }

  filter(options: any): Query<T> {
    for (var i in options) {
      const option = options [i]
      if (option && option[this.trellis.primary_keys[0].name]) {
        options[i] = option[this.trellis.primary_keys[0].name]
      }
    }
    this.options.where = options
    return this
  }

  join(collection: ICollection): Query<T> {
    this.options.include = this.options.include || []
    this.options.include.push(collection.get_sequelize())
    return this
  }

  select<N>(options: any): Query<N> {
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
    return this
  }

  first<N>(options?: any): Query<N> {
    this.set_reduce_mode(Reduce_Mode.first)
    return options
      ? this.filter(options)
      : this
  }

  first_or_null<N>(options?: any): Query<N> {
    return this.firstOrNull(options)
  }

  firstOrNull<N>(options?: any): Query<N> {
    this.set_reduce_mode(Reduce_Mode.first)
    this.allow_null = true
    return options
      ? this.filter(options)
      : this
  }

  range(start?: number, length?: number): Query<T> {
    if (start)
      this.options.offset = start

    if (length)
      this.options.limit = length

    return this
  }

  sort(args: string[]): Query<T> {
    this.options.order = args
    return this
  }

  expand<T2>(path: string): Query<T2> {
    if (!this.trellis.properties[path])
      throw new Error("No such property: " + this.trellis.name + '.' + path + '.')

    this.expansions[path] = null
    return this
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