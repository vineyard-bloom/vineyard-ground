"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    function SequelizeClient(sequelize) {
        this.sequelize = sequelize;
        this.legacyClient = new SequelizeLegacyClient();
    }
    SequelizeClient.prototype.getLegacyClient = function () {
        return this.legacyClient;
    };
    SequelizeClient.prototype.query = function (sql, args) {
        return this.sequelize.query(sql, { replacements: args });
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
        return this.sequelizeModel.create(newSeed.dataValues);
    };
    SequelizeTableClient.prototype.upsert = function (newSeed) {
        return this.sequelizeModel.upsert(newSeed);
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