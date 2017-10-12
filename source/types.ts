import * as vineyardSchema from 'vineyard-schema'
import {Collection} from "./collection";

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
