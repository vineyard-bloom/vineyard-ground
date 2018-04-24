"use strict";
exports.__esModule = true;
var sequelize_client_1 = require("./sequelize-client");
var PostgresClient = /** @class */ (function () {
    function PostgresClient(databaseConfig) {
        this.sequelizeClient = new sequelize_client_1.SequelizeClient(databaseConfig);
        var pg = require('pg');
        var pgConfig = Object.assign(databaseConfig, {
            user: databaseConfig.username
        });
        this.pgPool = new pg.Pool(pgConfig);
    }
    PostgresClient.prototype.getLegacyClient = function () {
        return undefined;
    };
    PostgresClient.prototype.getLegacyDatabaseInterface = function () {
        return this.sequelizeClient.getLegacyDatabaseInterface();
    };
    PostgresClient.prototype.query = function (sql, args) {
        return this.pgPool.query(sql, args);
    };
    PostgresClient.prototype.createTableInterface = function (trellis, sequelizeModel) {
        return this.sequelizeClient.createTableInterface(trellis, sequelizeModel);
    };
    return PostgresClient;
}());
exports.PostgresClient = PostgresClient;
