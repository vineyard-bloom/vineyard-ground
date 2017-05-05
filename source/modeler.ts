import {Schema} from 'vineyard-schema'
import {Collection, ICollection} from "./collection";
import {vineyard_to_sequelize} from "./database";

export type Collection_Map = { [name: string]: ICollection }

function sync_collections(schema: Schema, collections: Collection_Map, sequelize_models) {
  for (let name in schema.trellises) {
    const trellis = schema.trellises [name]
    collections [name] = new Collection(trellis, sequelize_models [name])
  }
}

export class Modeler {
  private schema: Schema
  private db
  collections: Collection_Map = {}

  constructor(db, schema: Schema | any) {
    this.schema = schema instanceof Schema
      ? schema
      : new Schema(schema)

    this.db = db
    const sequelize_models = vineyard_to_sequelize(this.schema, db)
    sync_collections(this.schema, this.collections, sequelize_models)
  }

  sync_database(options?) {
    return this.db.sync(options)
  }

  regenerate() {
    return this.db.sync({force: true})
  }
}