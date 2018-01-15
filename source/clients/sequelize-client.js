"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize = require("sequelize");
class SequelizeLegacyClient {
    findAll(table, options) {
        return table.getSequelizeModel().findAll(options);
    }
}
exports.SequelizeLegacyClient = SequelizeLegacyClient;
class SequelizeClient {
    constructor(databaseConfig) {
        this.sequelize = new sequelize(databaseConfig);
        this.legacyClient = new SequelizeLegacyClient();
    }
    getLegacyClient() {
        return this.legacyClient;
    }
    getLegacyDatabaseInterface() {
        return this.sequelize;
    }
    query(sql, args) {
        return this.sequelize.query(sql, { replacements: args });
    }
    createTableInterface(trellis, sequelizeModel) {
        return new SequelizeTableClient(this, sequelizeModel);
    }
}
exports.SequelizeClient = SequelizeClient;
class SequelizeTableClient {
    constructor(client, sequelizeModel) {
        this.client = client;
        this.sequelizeModel = sequelizeModel;
    }
    getClient() {
        return this.client;
    }
    create(newSeed) {
        return this.sequelizeModel.create(newSeed);
    }
    upsert(newSeed) {
        return this.sequelizeModel.upsert(newSeed);
    }
    update(seed, filter) {
        return this.sequelizeModel.update(seed, {
            where: filter,
            returning: true
        });
    }
    remove(options) {
        return this.sequelizeModel.destroy(options);
    }
    getSequelizeModel() {
        return this.sequelizeModel;
    }
}
exports.SequelizeTableClient = SequelizeTableClient;
//# sourceMappingURL=sequelize-client.js.map