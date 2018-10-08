import {Collection, ICollection} from "./collection";
import {vineyard_to_sequelize} from "./database";
import {SequelizeClient, SequelizeModelMap} from "./clients/sequelize-client";
import {DatabaseClient, DatabaseConfig} from "./types";
import {BigNumber} from "bignumber.js"
import {SchemaClass} from './scheming'

export type Collection_Map = { [name: string]: ICollection }

function sync_collections(schema: SchemaClass, collections: Collection_Map, keys: any, sequelize_models: SequelizeModelMap,
                          client: DatabaseClient) {
  for (let name in keys) {
    const trellis = schema.trellises [name] as any
    const table = client.createTableInterface(trellis, sequelize_models [name])
    collections [name] = new Collection(schema.tables, trellis, table as any, client)
  }
}

function initializeTrellises(schema: SchemaClass, collections: Collection_Map, keys: any, db: any, client: DatabaseClient) {
  const sequelize_models = vineyard_to_sequelize(schema as any, schema.trellises, db)
  sync_collections(schema, collections, keys, sequelize_models, client)
}

export class Modeler {
  private schema: SchemaClass
  protected db: any
  collections: Collection_Map = {}
  private client: DatabaseClient

  constructor(schema: SchemaClass | any, client: DatabaseClient) {
    this.schema = schema
    this.db = client.getLegacyDatabaseInterface()
    this.client = client
    initializeTrellises(this.schema, this.collections, this.schema.trellises, this.db, this.client)
  }

  query(sql: string, replacements?: any) {
    if (replacements) {
      for (let i in replacements) {
        const replacement = replacements[i]
        if (replacement && replacement.isBigNumber)
          replacements[i] = replacement.toString()
      }
    }
    return this.db.query(sql, {
      replacements: replacements
    })
      .then((result: any[]) => result [0])
  }

  querySingle(sql: string, replacements?: any) {
    return this.query(sql, replacements)
      .then((result: any []) => result [0])
  }

  addDefinitions(definitions: any) {
    this.schema.define(definitions)
    // const sequelize_models = vineyard_to_sequelize(this.schema, definitions, this.db)
    // sync_collections(this.schema, this.collections, definitions, sequelize_models)
    initializeTrellises(this.schema, this.collections, definitions, this.db, this.client)
  }

  getLegacyDatabaseInterface(): any {
    return this.db
  }
}

export class DevModeler extends Modeler {

  regenerate() {
    // An extra safe guard
    if (this.db.config.host != 'localhost')
      throw new Error("To minimize accidental data loss, regenerate() can only be run on a local database.")

    return this.db.sync({force: true})
  }

}