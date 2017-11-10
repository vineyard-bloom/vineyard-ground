"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("./schema");
const collection_1 = require("./collection");
const database_1 = require("./database");
const pluralize = require('pluralize');
function sync_collections(schema, collections, keys, sequelize_models, client) {
    for (let name in keys) {
        const trellis = schema.trellises[name];
        const table = client.createTableInterface(trellis, sequelize_models[name]);
        collections[name] = new collection_1.Collection(trellis, table, client);
    }
}
function initializeTrellises(schema, collections, keys, db, client) {
    const sequelize_models = database_1.vineyard_to_sequelize(schema, schema.trellises, db);
    sync_collections(schema, collections, keys, sequelize_models, client);
}
class Modeler {
    constructor(schema, client) {
        this.collections = {};
        this.schema = schema instanceof schema_1.Schema
            ? schema
            : new schema_1.Schema(schema);
        this.db = client.getLegacyDatabaseInterface();
        this.client = client;
        initializeTrellises(this.schema, this.collections, this.schema.trellises, this.db, this.client);
    }
    query(sql, replacements) {
        if (replacements) {
            for (let i in replacements) {
                const replacement = replacements[i];
                if (replacement && replacement.isBigNumber)
                    replacements[i] = replacement.toString();
            }
        }
        return this.db.query(sql, {
            replacements: replacements
        })
            .then((result) => result[0]);
    }
    querySingle(sql, replacements) {
        return this.query(sql, replacements)
            .then((result) => result[0]);
    }
    addDefinitions(definitions) {
        this.schema.define(definitions);
        // const sequelize_models = vineyard_to_sequelize(this.schema, definitions, this.db)
        // sync_collections(this.schema, this.collections, definitions, sequelize_models)
        initializeTrellises(this.schema, this.collections, definitions, this.db, this.client);
    }
    getLegacyDatabaseInterface() {
        return this.db;
    }
}
exports.Modeler = Modeler;
class DevModeler extends Modeler {
    regenerate() {
        // An extra safe guard
        if (this.db.config.host != 'localhost')
            throw new Error("To minimize accidental data loss, regenerate() can only be run on a local database.");
        return this.db.sync({ force: true });
    }
}
exports.DevModeler = DevModeler;
//# sourceMappingURL=modeler.js.map