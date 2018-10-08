import {Collection} from './collection';
import {SequelizeModel} from './clients/sequelize-client';
import {Table, Trellis} from 'vineyard-schema'

export interface SequelizeTable extends Table {
  sequelize: any

  getTableName(): string

  belongsToMany(table: Table, options: any): any

  hasMany(table: Table, options: any): void

  create(fields: any): any

  destroy(fields: any): any

  findAll(options: any): any
}

export type SequelizeTables = { [key: string]: SequelizeTable }

export interface CollectionTrellis<T> extends Trellis {
  oldTable: SequelizeTable
  collection: Collection<T>
}

export type Collection_Trellis<T> = CollectionTrellis<T>

export interface QueryResult<T> {
  rows: T[]
}

export interface LegacyClient {
  findAll(table: ITableClient, options: any): any
}

export interface LegacyDatabaseInterface {

}

export interface DatabaseClient {
  getLegacyClient(): LegacyClient | undefined

  getLegacyDatabaseInterface(): LegacyDatabaseInterface

  query<T>(sql: string, args?: { [key: string]: any }): PromiseLike<QueryResult<T>>

  createTableInterface(trellis: Trellis, sequelizeModel: SequelizeModel): ITableClient
}

export interface ITableClient {
  // getClient(): DatabaseClient

}

export interface RemoveOptions {
  where: any
}

export interface TableClient<T> extends ITableClient {
  create(newSeed: Partial<T>): Promise<T>

  update(seed: Partial<T>, filter: Partial<T>): Promise<T>

  upsert(newSeed: Partial<T>): Promise<T>

  remove(options: RemoveOptions): Promise<any>
}

export interface CommonDatabaseConfig {
  dialect: string
  logging?: boolean
}

export interface DatabaseFileConfig extends CommonDatabaseConfig {

}

export interface DatabaseServiceConfig extends CommonDatabaseConfig {
  host: string
  username: string
  password: string
  database: string
}

export type DatabaseConfig = DatabaseFileConfig | DatabaseServiceConfig
