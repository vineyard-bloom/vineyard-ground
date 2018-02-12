"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_client_1 = require("./sequelize-client");
class PostgresClient {
    constructor(databaseConfig) {
        this.sequelizeClient = new sequelize_client_1.SequelizeClient(databaseConfig);
        const pg = require('pg');
        const pgConfig = Object.assign(databaseConfig, {
            user: databaseConfig.username
        });
        this.pgPool = new pg.Pool(pgConfig);
    }
    getLegacyClient() {
        return undefined;
    }
    getLegacyDatabaseInterface() {
        return this.sequelizeClient.getLegacyDatabaseInterface();
    }
    query(sql, args) {
        return this.pgPool.query(sql, args);
    }
    createTableInterface(trellis, sequelizeModel) {
        return this.sequelizeClient.createTableInterface(trellis, sequelizeModel);
    }
}
exports.PostgresClient = PostgresClient;
//# sourceMappingURL=postgres-client.js.map