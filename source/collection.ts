import {Trellis} from 'vineyard-schema'
import {Query, Query_Implementation} from './query'

export interface ICollection {
  get_sequelize(): any
}

function prepare_seed(seed) {
  const new_seed = Object.assign({}, seed)
  for (let i in new_seed) {
    const value = new_seed[i]
    if (typeof value === 'object' && value.id) {
      new_seed [i] = value.id
    }
  }

  return new_seed
}

export class Collection<T> implements ICollection {
  private sequelize
  private trellis: Trellis

  constructor(trellis: Trellis, sequelize_model) {
    this.trellis = trellis
    this.sequelize = sequelize_model
  }

  create(seed): Promise<T> {
    const new_seed = prepare_seed(seed)

    return this.sequelize.create(new_seed)
      .then(result => result.dataValues)
  }

  update(seed, changes?): Promise<T> {
    const id = seed.id || seed
    const new_seed = prepare_seed(changes || seed)

    return this.sequelize.update(changes, {
      where: {
        id: id
      }
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
}
