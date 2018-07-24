"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize = require("sequelize");
var SequelizeLegacyClient = (function () {
    function SequelizeLegacyClient() {
    }
    SequelizeLegacyClient.prototype.findAll = function (table, options) {
        return table.getSequelizeModel().findAll(options);
    };
    return SequelizeLegacyClient;
}());
exports.SequelizeLegacyClient = SequelizeLegacyClient;
var SequelizeClient = (function () {
    function SequelizeClient(databaseConfig) {
        this.sequelize = new sequelize(databaseConfig);
        this.legacyClient = new SequelizeLegacyClient();
    }
    SequelizeClient.prototype.getLegacyClient = function () {
        return this.legacyClient;
    };
    SequelizeClient.prototype.getLegacyDatabaseInterface = function () {
        return this.sequelize;
    };
    SequelizeClient.prototype.query = function (sql, args) {
        return this.sequelize.query(sql, { replacements: args });
    };
    SequelizeClient.prototype.createTableInterface = function (trellis, sequelizeModel) {
        return new SequelizeTableClient(this, sequelizeModel);
    };
    return SequelizeClient;
}());
exports.SequelizeClient = SequelizeClient;
var SequelizeTableClient = (function () {
    function SequelizeTableClient(client, sequelizeModel) {
        this.client = client;
        this.sequelizeModel = sequelizeModel;
    }
    SequelizeTableClient.prototype.getClient = function () {
        return this.client;
    };
    SequelizeTableClient.prototype.create = function (newSeed) {
        return this.sequelizeModel.create(newSeed);
    };
    SequelizeTableClient.prototype.upsert = function (newSeed) {
        return this.sequelizeModel.upsert(newSeed);
    };
    SequelizeTableClient.prototype.update = function (seed, filter) {
        return this.sequelizeModel.update(seed, {
            where: filter,
            returning: true
        });
    };
    SequelizeTableClient.prototype.remove = function (options) {
        return this.sequelizeModel.destroy(options);
    };
    SequelizeTableClient.prototype.getSequelizeModel = function () {
        return this.sequelizeModel;
    };
    return SequelizeTableClient;
}());
exports.SequelizeTableClient = SequelizeTableClient;
//# sourceMappingURL=sequelize-client.js.map