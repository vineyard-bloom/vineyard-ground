import {Trellis, Reference} from "vineyard-schema"
import {ICollection} from "./collection"
import * as sequelize from 'sequelize'
import {Collection_Trellis} from './types'
import {to_lower} from "./utility";

export interface Query<T> {
  then(any: any): Promise<any>
  exec(): Promise<any>
  expand<T2>(path: string): Query<T2>
  filter(options): Query<T>
  first(options?): Query<T>
  first_or_null(options?): Query<T>
  join<N>(collection: ICollection): Query<N>
  select<N>(options): Query<N>
}

enum Reduce_Mode {
  none,
  first,
  single_value,
}

export class Query_Implementation<T> implements Query<T> {
  private sequelize
  private trellis: Collection_Trellis<T>
  private options: any = {}
  private reduce_mode: Reduce_Mode = Reduce_Mode.none
  private expansions = {}
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
    const reference = this.trellis.properties[path] as Reference
    return reference.get_other_trellis()['collection']
  }

  private expand_cross_table(reference: Reference, identity) {
    const where = {}
    where[to_lower(reference.trellis.name)] = identity
    // where[to_lower(reference.get_other_trellis().name)] =
    //   sequelize.col(reference.get_other_trellis().primary_key.name)

    return reference.other_property.trellis['table'].findAll({
      include: {
        model: reference.trellis['table'],
        through: {where: where},
        as: reference.other_property.name,
        required: true
      }
    })
      .then(result => result.map(r => r.dataValues))
  }

  private perform_expansion(path: string, data) {
    const property = this.trellis.properties[path]
    return property.is_list()
      ? this.expand_cross_table(property as Reference, this.trellis.get_identity(data))
      : this.get_other_collection(path).get(data[path])
  }

  private handle_expansions(results) {
    let promises = results.map(result => Promise.all(this.get_expansions()
      .map(path => this.perform_expansion(path, result.dataValues)
        .then(child => result.dataValues[path] = child)
      )
    ))

    return Promise.all(promises)
      .then(() => results) // Not needed but a nice touch.
  }

  private process_result(result) {
    if (this.reduce_mode == Reduce_Mode.first) {
      if (result.length == 0) {
        if (this.allow_null)
          return null

        throw Error("Query.first called on empty result set.")
      }

      return result [0].dataValues
    }
    else if (this.reduce_mode == Reduce_Mode.single_value) {
      if (result.length == 0) {
        if (this.allow_null)
          return null

        throw Error("Query.select single value called on empty result set.")
      }

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
    this.options.where = options
    return this
  }

  join(collection: ICollection): Query<T> {
    this.options.include = this.options.include || []
    this.options.include.push(collection.get_sequelize())
    return this
  }

  select<N>(options): Query<N> {
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

  first<N>(options?): Query<N> {
    this.set_reduce_mode(Reduce_Mode.first)
    return options
      ? this.filter(options)
      : this
  }

  first_or_null<N>(options?): Query<N> {
    this.set_reduce_mode(Reduce_Mode.first)
    this.allow_null = true
    return options
      ? this.filter(options)
      : this
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