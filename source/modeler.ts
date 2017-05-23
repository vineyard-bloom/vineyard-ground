import {Schema} from 'vineyard-schema'
import {Collection, ICollection} from "./collection";
import {vineyard_to_sequelize} from "./database";

export type Collection_Map = { [name: string]: ICollection }

function sync_collections(schema: Schema, collections: Collection_Map, sequelize_models) {
  for (let name in schema.trellises) {
    const trellis = schema.trellises [name] as any
    collections [name] = new Collection(trellis, sequelize_models [name])
  }
}

export class Modeler {
  private schema: Schema
  private db
  collections: Collection_Map = {}
  devMode:boolean = false

  constructor(db, schema: Schema | any, devMode = false) {
    this.schema = schema instanceof Schema
      ? schema
      : new Schema(schema)

    this.db = db
    this.devMode = devMode
    const sequelize_models = vineyard_to_sequelize(this.schema, db)
    sync_collections(this.schema, this.collections, sequelize_models)
  }

  regenerate() {
    if (!this.devMode)
      throw new Error("regenerate() can only be run in dev mode. (In the database config set devMode to true).")

    if (this.db.config.host != 'localhost')
      throw new Error("To minimize accidental data loss, regenerate() can only be run on a local database.")

    return this.db.sync({force: true})
  }

  query(sql, replacements?) {
    return this.db.query(sql, {
      replacements: replacements
    })
      .then(result => result [0])
  }

  querySingle(sql, replacements?){
    return this.query(sql, replacements)
      .then(result => result [0])
  }
}