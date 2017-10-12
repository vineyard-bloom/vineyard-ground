"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var vineyard_schema_1 = require("vineyard-schema");
var collection_1 = require("./collection");
var database_1 = require("./database");
var sequelize_client_1 = require("./clients/sequelize-client");
var pluralize = require('pluralize');
function sync_collections(schema, collections, keys, sequelize_models, client) {
    for (var name in keys) {
        var trellis = schema.trellises[name];
        collections[name] = new collection_1.Collection(trellis, sequelize_models[name], client);
        trellis.table = {
            name: pluralize(trellis.name).toLowerCase()
        };
    }
}
function initializeTrellises(schema, collections, keys, db, client) {
    var sequelize_models = database_1.vineyard_to_sequelize(schema, schema.trellises, db);
    sync_collections(schema, collections, schema.trellises, sequelize_models, client);
}
var Modeler = (function () {
    function Modeler(db, schema, client) {
        if (client === void 0) { client = new sequelize_client_1.SequelizeClient(db); }
        this.collections = {};
        this.schema = schema instanceof vineyard_schema_1.Schema
            ? schema
            : new vineyard_schema_1.Schema(schema);
        this.db = db;
        this.client = client;
        initializeTrellises(this.schema, this.collections, this.schema.trellises, this.db, this.client);
    }
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
    Modeler.prototype.addDefinitions = function (definitions) {
        this.schema.define(definitions);
        // const sequelize_models = vineyard_to_sequelize(this.schema, definitions, this.db)
        // sync_collections(this.schema, this.collections, definitions, sequelize_models)
        initializeTrellises(this.schema, this.collections, definitions, this.db, this.client);
    };
    return Modeler;
}());
exports.Modeler = Modeler;
var DevModeler = (function (_super) {
    __extends(DevModeler, _super);
    function DevModeler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DevModeler.prototype.regenerate = function () {
        // An extra safe guard
        if (this.db.config.host != 'localhost')
            throw new Error("To minimize accidental data loss, regenerate() can only be run on a local database.");
        return this.db.sync({ force: true });
    };
    return DevModeler;
}(Modeler));
exports.DevModeler = DevModeler;
//# sourceMappingURL=modeler.js.map