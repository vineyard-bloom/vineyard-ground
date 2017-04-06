import {Schema} from 'vineyard-schema'
import {Collection} from "./Collection";
import {vineyard_to_sequelize} from "./database";

export type Collection_Map = {[name: string]: Collection}

function sync_collections(schema: Schema, collections: Collection_Map, sequelize_models) {
  for (let name in schema.trellises) {
    const trellis = schema.trellises [name]
    collections [name] = new Collection(trellis, sequelize_models [name])
  }
}

export class Model {
  private schema: Schema
  private db
  collections: Collection_Map = {}

  constructor(db, schema: Schema) {
    this.schema = schema
    this.db = db
    const sequelize_models = vineyard_to_sequelize(schema, db)
    sync_collections(schema, this.collections, sequelize_models)
  }

  sync_database(options?) {
    return this.db.sync(options)
  }

}