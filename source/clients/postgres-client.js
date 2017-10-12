"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PostgresClient = (function () {
    function PostgresClient(databaseConfig) {
        var pg = require('pg');
        var pgConfig = Object.assign(databaseConfig, {
            user: databaseConfig.username
        });
        this.pgPool = new pg.Pool(pgConfig);
    }
    PostgresClient.prototype.getLegacyClient = function () {
        return undefined;
    };
    PostgresClient.prototype.query = function (sql, args) {
        return this.pgPool.query(sql, args);
    };
    return PostgresClient;
}());
exports.PostgresClient = PostgresClient;
//# sourceMappingURL=postgres-client.js.map