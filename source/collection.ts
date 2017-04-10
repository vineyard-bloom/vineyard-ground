import {Trellis, Reference} from 'vineyard-schema'
import {Query, Query_Implementation} from './query'
import {Collection_Trellis} from './types'

export interface ICollection {
  get_sequelize(): any
}

function prepare_seed(seed, trellis: Trellis) {
  const new_seed = {}
  for (let i in seed) {
    const property = trellis.properties[i]
    if (property) {
      const value = seed[i]
      if (property.is_reference()) {
        const reference = property as Reference
        const other_primary_key = reference.get_other_trellis().primary_key.name
        if (typeof value === 'object' && value[other_primary_key]) {
          new_seed [i] = value[other_primary_key]
        }
        else {
          new_seed [i] = value
        }
      }
      else {
        new_seed [i] = value
      }
    }
  }

  return new_seed
}

export class Collection<T> implements ICollection {
  private sequelize
  private trellis: Collection_Trellis<T>
  private primary_key: string

  constructor(trellis: Collection_Trellis<T>, sequelize_model) {
    this.trellis = trellis
    this.sequelize = sequelize_model
    this.primary_key = this.trellis.primary_key.name
    trellis.collection = this
  }

  create(seed): Promise<T> {
    const new_seed = prepare_seed(seed, this.trellis)

    return this.sequelize.create(new_seed)
      .then(result => result.dataValues)
  }

  update(seed, changes?): Promise<T> {
    const identity = seed[this.primary_key] || seed
    const new_seed = prepare_seed(changes || seed, this.trellis)

    const filter = {}
    filter[this.primary_key] = identity

    return this.sequelize.update(changes, {
      where: filter
    })
      .then(result => result.dataValues)
  }

  all(): Query<T> {
    return new Query_Implementation<T>(this.sequelize, this.trellis)
  }

  filter(options): Query<T> {
    return this.all().filter(options)
  }

  get_sequelize() {
    return this.sequelize
  }

  get(identity) {
    if (!identity)
      throw new Error("Cannot get empty identity of type " + this.trellis.name + '.')

    const filter = {}
    filter[this.primary_key] = identity

    return this.filter(filter).first()
  }
}
