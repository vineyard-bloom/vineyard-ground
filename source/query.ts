import {Trellis, Reference} from "vineyard-schema"
import {ICollection} from "./collection"
import * as sequelize from 'sequelize'
import {Collection_Trellis} from './types'

export interface Query<T> {
  then(any: any): Promise<any>
  exec(): Promise<any>
  expand<T2>(path: string): Query<T2>
  filter(options): Query<T>
  first(): Query<T>
  first_or_null(): Query<T>
  join<N>(collection: ICollection): Query<N>
  select<N>(options): Query<N>
}

enum Reduce_Mode {
  none,
  first,
    first_or_null,
  single_value,
}

export class Query_Implementation<T> implements Query<T> {
  private sequelize
  private trellis: Collection_Trellis<T>
  private options: any = {}
  private reduce_mode: Reduce_Mode = Reduce_Mode.none
  private expansions = {}

  private set_reduce_mode(value: Reduce_Mode) {
    if (this.reduce_mode == value)
      return

    if (this.reduce_mode != Reduce_Mode.none)
      throw new Error("Reduce mode already set.")

    this.reduce_mode = value
  }

  private get_other_collection(path: string) {
    const reference = this.trellis.properties[path] as Reference
    return reference.get_other_trellis()['collection']
  }

  private handle_expansions(results) {
    let promises = results.map(result => Promise.all(this.get_expansions()
      .map(path => this.get_other_collection(path).get(result.dataValues[path])
        .then(child => result.dataValues[path] = child)
      )
    ))

    return Promise.all(promises)
      .then(() => results) // Not needed but a nice touch.
  }

  private process_result(result) {
    if (this.reduce_mode == Reduce_Mode.first) {
      if (result.length == 0)
        throw Error("Query.first called on empty result set.")

      return result [0].dataValues
    }
    else if (this.reduce_mode == Reduce_Mode.first_or_null) {
      if (result.length == 0)
        return null

      return result [0].dataValues
    }
    else if (this.reduce_mode == Reduce_Mode.single_value) {
      return result[0].dataValues._value
    }

    return result.map(item => item.dataValues)
  }

  private process_result_with_expansions(result) {
    return this.handle_expansions(result)
      .then(result => this.process_result(result))
  }

  private get_expansions() {
    return Object.keys(this.expansions)
  }

  private has_expansions() {
    return this.get_expansions().length > 0
  }

  constructor(sequelize, trellis: Collection_Trellis<T>) {
    this.sequelize = sequelize
    this.trellis = trellis
  }

  exec(): Promise<any> {
    console.log(this.options)
    return this.sequelize.findAll(this.options)
      .then(result => this.has_expansions()
        ? this.process_result_with_expansions(result)
        : this.process_result(result)
      )
  }

  then(callback): Promise<any> {
    return this.exec()
      .then(callback)
  }

  filter(options): Query<T> {
    for (var i in options) {
      const option = options [i]
      if (option && option[this.trellis.primary_key.name]) {
        options[i] = option[this.trellis.primary_key.name]
      }
    }
    options.where = options
    return this
  }

  join(collection: ICollection): Query<T> {
    this.options.include = this.options.include || []
    this.options.include.push(collection.get_sequelize())
    return this
  }

  select<N>(options): Query<N> {
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

  first<N>(): Query<N> {
    this.set_reduce_mode(Reduce_Mode.first)
    return this
  }

  first_or_null<N>(): Query<N> {
    this.set_reduce_mode(Reduce_Mode.first_or_null)
    return this
  }

  expand<T2>(path: string): Query<T2> {
    if (!this.trellis.properties[path])
      throw new Error("No such property: " + this.trellis.name + '.' + path + '.')

    this.expansions[path] = null
    return this
  }
}

export function Path(path) {
  return sequelize.col(path)
}

export function Sum(path) {
  return sequelize.fn('SUM', sequelize.col(path))
}

export function Count(path) {
  return sequelize.fn('COUNT', sequelize.col(path))
}