"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        this.schema = schema;
        this.db = db;
        var sequelize_models = database_1.vineyard_to_sequelize(schema, db);
        sync_collections(schema, this.collections, sequelize_models);
    }
    Modeler.prototype.sync_database = function (options) {
        return this.db.sync(options);
    };
    Modeler.prototype.regenerate = function () {
        return this.db.sync({ force: true });
    };
    return Modeler;
}());
exports.Modeler = Modeler;
//# sourceMappingURL=modeler.js.map