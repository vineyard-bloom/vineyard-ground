import {Query, Query_Implementation} from './query'
import {Collection_Trellis} from './types'
import {create, create_or_update, update} from './update'

export interface ICollection {
  get_sequelize(): any
}

export class Collection<T> implements ICollection {
  private sequelize: any
  private trellis: Collection_Trellis<T>

  constructor(trellis: Collection_Trellis<T>, sequelize_model: any) {
    this.trellis = trellis
    this.sequelize = sequelize_model
    trellis.collection = this
  }

  create(seed: any): Promise<T> {
    return create(seed, this.trellis, this.sequelize)
  }

  create_or_update(seed: any): Promise<T> {
    return create_or_update(seed, this.trellis, this.sequelize)
  }

  update(seed: any, changes?: any): Promise<T> {
    return update(seed, this.trellis, this.sequelize, changes)
  }

  remove(seed: any): Promise<T> {
    return this.sequelize.destroy({
      where: {
        [this.trellis.primary_keys[0].name]: this.trellis.get_identity(seed)
      }
    })
  }

  all(): Query<T, T[]> {
    return new Query_Implementation<T, T[]>(this.sequelize, this.trellis)
  }

  filter(options: any): Query<T, T[]> {
    return this.all().filter(options)
  }

  first(options?: any): Query<T, T | undefined> {
    return this.all().first(options)
  }

  first_or_null(options?: any): Query<T, T | undefined> {
    return this.all().first_or_null(options)
  }

  firstOrNull(options?: any): Query<T, T | undefined> {
    return this.all().first_or_null(options)
  }

  get_sequelize() {
    return this.sequelize
  }

  get(identity: any) {
    identity = this.trellis.get_identity(identity)
    const filter: { [key: string]: any } = {}
    filter[this.trellis.primary_keys[0].name] = identity

    return this.filter(filter).first()
  }

}
