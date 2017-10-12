import {QueryBuilder, Query_Implementation} from './query'
import {CollectionTrellis, DatabaseClient, LegacyClient, TableClient, Trellis} from './types'
import {create, create_or_update, update} from './update'

export interface ICollection {
  getTrellis(): Trellis
}

export class Collection<T> implements ICollection {
  private table: TableClient<T>
  private client: DatabaseClient
  private trellis: CollectionTrellis<T>

  constructor(trellis: CollectionTrellis<T>, table: TableClient<T>, client: DatabaseClient) {
    this.trellis = trellis
    this.table = table
    this.client = client
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
    return create(seed, this.trellis, this.table)
  }

  create_or_update(seed: any): Promise<T> {
    return create_or_update(seed, this.trellis, this.table)
  }

  update(seed: any, changes?: any): Promise<T> {
    return update(seed, this.trellis, this.table, changes)
  }

  remove(seed: any): Promise<T> {
    return this.table.remove({
      where: {
        [this.trellis.primary_keys[0].name]: this.trellis.get_identity(seed)
      }
    })
  }

  all(): QueryBuilder<T, T[]> {
    return new Query_Implementation<T, T[]>(this.table, this.client, this.trellis)
  }

  filter(options: any): QueryBuilder<T, T[]> {
    return this.all().filter(options)
  }

  first(options?: any): QueryBuilder<T, T | undefined> {
    return this.all().first(options)
  }

  get(identity: any) {
    identity = this.trellis.get_identity(identity)
    const filter: { [key: string]: any } = {}
    filter[this.trellis.primary_keys[0].name] = identity

    return this.filter(filter).first()
  }

}
