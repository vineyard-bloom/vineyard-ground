import {Query, Query_Implementation} from './query'
import {CollectionTrellis, Trellis} from './types'
import {create, create_or_update, update} from './update'

export interface ICollection {
  get_sequelize(): any
  getTrellis(): Trellis
}

export class Collection<T> implements ICollection {
  private sequelize: any
  private trellis: CollectionTrellis<T>

  constructor(trellis: CollectionTrellis<T>, sequelize_model: any) {
    this.trellis = trellis
    this.sequelize = sequelize_model
    trellis.collection = this

    // Monkey patch for soft backwards compatibility
    const self = this as any
    self.firstOrNull = this.first
    self.first_or_null = this.first
  }

  getTrellis(): CollectionTrellis<T> {
    return this.trellis
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
