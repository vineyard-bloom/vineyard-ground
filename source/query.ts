import {Trellis} from "vineyard-schema"
import {ICollection} from "./collection"
import * as sequelize from 'sequelize'

export interface Query<T> {
  then(any: any): Promise<any>
  exec(): Promise<any>
  filter(options): Query<T>
  join<N>(collection: ICollection): Query<N>
  select<N>(options): Query<N>
}

enum Reduce_Mode {
  none,
  first,
    // first_or_null,
  single_value,
}

export class Query_Implementation<T> implements Query<T> {
  private sequelize
  private trellis: Trellis
  private options: any = {}
  private reduce_mode: Reduce_Mode = Reduce_Mode.none

  private set_reduce_mode(value: Reduce_Mode) {
    if (this.reduce_mode == value)
      return

    if (this.reduce_mode != Reduce_Mode.none)
      throw new Error("Reduce mode already set.")

    this.reduce_mode = value
  }

  constructor(sequelize, trellis: Trellis) {
    this.sequelize = sequelize
    this.trellis = trellis
  }

  exec(): Promise<any> {
    console.log(this.options)
    return this.sequelize.findAll(this.options)
      .then(result => {
        if (this.reduce_mode == Reduce_Mode.first) {
          if (result.length == 0)
            throw Error("Query.first called on empty result set.")

          return result [0].dataValues
        }
        else if (this.reduce_mode == Reduce_Mode.single_value) {
          return result[0].dataValues._value
        }

        // if (!Array.isArray(result))
        //   return result.dataValues

        return result.map(item => item.dataValues)
      })
  }

  then(callback): Promise<any> {
    return this.exec()
      .then(callback)
  }

  filter(options): Query<T> {
    for (var i in options) {
      const option = options [i]
      if(option && option.id) {
        options[i] = option.id
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