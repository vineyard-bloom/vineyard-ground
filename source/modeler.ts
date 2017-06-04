import {Schema} from 'vineyard-schema'
import {Collection, ICollection} from "./collection";
import {vineyard_to_sequelize} from "./database";

export type Collection_Map = { [name: string]: ICollection }

function sync_collections(schema: Schema, collections: Collection_Map, keys, sequelize_models) {
  for (let name in keys) {
    const trellis = schema.trellises [name] as any
    collections [name] = new Collection(trellis, sequelize_models [name])
  }
}

function initializeTrellises(schema: Schema, collections: Collection_Map, keys, db) {
  const sequelize_models = vineyard_to_sequelize(schema, schema.trellises, db)
  sync_collections(schema, collections, schema.trellises, sequelize_models)
}

export class Modeler {
  private schema: Schema
  protected db
  collections: Collection_Map = {}

  constructor(db, schema: Schema | any) {
    this.schema = schema instanceof Schema
      ? schema
      : new Schema(schema)

    this.db = db
    // const sequelize_models = vineyard_to_sequelize(this.schema, this.schema.trellises, db)
    // sync_collections(this.schema, this.collections, this.schema.trellises, sequelize_models)
    initializeTrellises(this.schema, this.collections, this.schema.trellises, this.db)
  }

  query(sql, replacements?) {
    return this.db.query(sql, {
      replacements: replacements
    })
      .then(result => result [0])
  }

  querySingle(sql, replacements?) {
    return this.query(sql, replacements)
      .then(result => result [0])
  }

  addDefinitions(definitions: any) {
    this.schema.define(definitions)
    // const sequelize_models = vineyard_to_sequelize(this.schema, definitions, this.db)
    // sync_collections(this.schema, this.collections, definitions, sequelize_models)
    initializeTrellises(this.schema, this.collections, definitions, this.db)
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