"use strict";
var Collection_1 = require("./Collection");
var database_1 = require("./database");
function sync_collections(schema, collections, sequelize_models) {
    for (var name_1 in schema.trellises) {
        var trellis = schema.trellises[name_1];
        collections[name_1] = new Collection_1.Collection(trellis, sequelize_models[name_1]);
    }
}
var Model = (function () {
    function Model(db, schema) {
        this.collections = {};
        this.schema = schema;
        this.db = db;
        var sequelize_models = database_1.vineyard_to_sequelize(schema, db);
        sync_collections(schema, this.collections, sequelize_models);
    }
    Model.prototype.sync_database = function (options) {
        return this.db.sync(options);
    };
    return Model;
}());
exports.Model = Model;
//# sourceMappingURL=model.js.map