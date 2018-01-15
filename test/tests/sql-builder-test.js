"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const query_generator_1 = require("../../source/sql/query-generator");
const assert = require("assert");
const modeler_1 = require("../../source/modeler");
const Sequelize = require('sequelize');
const schema_1 = require("../../source/schema");
const sequelize_client_1 = require("../../source/clients/sequelize-client");
const config = require('../config/config.json');
const schema = new schema_1.Schema(require('../schema/game.json'));
const client = new sequelize_client_1.SequelizeClient(config.database);
const modeler = new modeler_1.DevModeler(schema, client);
describe('sql-builder-test', function () {
    this.timeout(5000);
    it('selection', function () {
        const builder = new query_generator_1.QueryGenerator(modeler.collections.Creature.getTrellis());
        const bundle = builder.generate({ where: { name: "ogre" } });
        assert.equal(bundle.sql, `SELECT * FROM "creatures" WHERE "name" = $1`);
        assert.equal(bundle.args.length, 1);
        assert.equal(bundle.args[0], 'ogre');
    });
    it('advanced', function () {
        const builder = new query_generator_1.QueryGenerator(modeler.collections.Creature.getTrellis());
        const bundle = builder.generate({
            order: ['name', 'health', 'desc'],
            limit: 5,
        });
        assert.equal(bundle.sql, `SELECT * FROM "creatures" ORDER BY "name", "health" DESC LIMIT 5`);
        assert.equal(bundle.args.length, 0);
    });
    // it.skip('generate', function () {
    //   const sql = generate(schema as any)
    //   checkDiff('test/resources/game.sql', sql, config.diffViewerPath)
    // })
});
//# sourceMappingURL=sql-builder-test.js.map