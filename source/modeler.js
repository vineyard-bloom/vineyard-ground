"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vineyard_schema_1 = require("vineyard-schema");
var collection_1 = require("./collection");
var database_1 = require("./database");
function sync_collections(schema, collections, sequelize_models) {
    for (var name_1 in schema.trellises) {
        var trellis = schema.trellises[name_1];
        collections[name_1] = new collection_1.Collection(trellis, sequelize_models[name_1]);
    }
}
var Modeler = (function () {
    function Modeler(db, schema, devMode) {
        if (devMode === void 0) { devMode = false; }
        this.collections = {};
        this.devMode = false;
        this.schema = schema instanceof vineyard_schema_1.Schema
            ? schema
            : new vineyard_schema_1.Schema(schema);
        this.db = db;
        this.devMode = devMode;
        var sequelize_models = database_1.vineyard_to_sequelize(this.schema, db);
        sync_collections(this.schema, this.collections, sequelize_models);
    }
    Modeler.prototype.regenerate = function () {
        if (!this.devMode)
            throw new Error("regenerate() can only be run in dev mode. (In the database config set devMode to true).");
        if (this.db.config.host != 'localhost')
            throw new Error("To minimize accidental data loss, regenerate() can only be run on a local database.");
        return this.db.sync({ force: true });
    };
    Modeler.prototype.query = function (sql, replacements) {
        return this.db.query(sql, {
            replacements: replacements
        })
            .then(function (result) { return result[0]; });
    };
    Modeler.prototype.querySingle = function (sql, replacements) {
        return this.query(sql, replacements)
            .then(function (result) { return result[0]; });
    };
    return Modeler;
}());
exports.Modeler = Modeler;
//# sourceMappingURL=modeler.js.map