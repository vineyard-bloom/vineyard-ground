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
    function Modeler(db, schema) {
        this.collections = {};
        this.schema = schema instanceof vineyard_schema_1.Schema
            ? schema
            : new vineyard_schema_1.Schema(schema);
        this.db = db;
        var sequelize_models = database_1.vineyard_to_sequelize(this.schema, db);
        sync_collections(this.schema, this.collections, sequelize_models);
    }
    Modeler.prototype.sync_database = function (options) {
        return this.db.sync(options);
    };
    Modeler.prototype.regenerate = function () {
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