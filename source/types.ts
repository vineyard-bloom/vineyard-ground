import * as vineyardSchema from './schema'
import { Collection } from "./collection";
import { SequelizeModel } from "./clients/sequelize-client";

export interface Table {
  name: string
  isCross?: boolean
}

export interface SequelizeTable extends Table {
  sequelize: any

  getTableName(): string

  belongsToMany(table: Table, options: any): any

  hasMany(table: Table, options: any): void

  create(fields: any): any

  destroy(fields: any): any

  findAll(options: any): any
}

export interface Property {
  name: string
  type: vineyardSchema.Type
  trellis: Trellis
  is_nullable: boolean
  "default": any
  is_unique: boolean
  other_property: Property
  cross_table?: SequelizeTable
  autoIncrement?: boolean
  length?: number

  is_reference(): boolean

  is_list(): boolean

  get_other_trellis(): Trellis

  get_path(): string
}

export interface Trellis {
  oldTable: SequelizeTable
  table: Table
  name: string
  properties: { [name: string]: Property }
  primary_keys: Property[]
  additional: any
  collection: any
  parent?: Trellis
  softDelete?: boolean

  get_identity(input: any): any

  get_lists(): any
}

export interface Table_Trellis extends Trellis {
  oldTable: SequelizeTable;
}

export interface CollectionTrellis<T> extends Trellis {
  oldTable: SequelizeTable
  collection: Collection<T>
}

export type Collection_Trellis<T> = CollectionTrellis<T>

export type TrellisMap = { [name: string]: Trellis }

export interface Schema {
  trellises: TrellisMap
  library: vineyardSchema.Library
}

export type Trellis_Map = { [name: string]: Trellis }

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

export interface DatabaseConfig {
  host: string
  username: string
  password: string
  database: string
}

export interface GeneralDatabaseConfig extends DatabaseConfig {
  dialect: string
  logging?: boolean
}