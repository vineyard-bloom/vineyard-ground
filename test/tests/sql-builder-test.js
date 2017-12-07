"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
var query_generator_1 = require("../../source/sql/query-generator");
var assert = require("assert");
var modeler_1 = require("../../source/modeler");
var Sequelize = require('sequelize');
var schema_1 = require("../../source/schema");
var sequelize_client_1 = require("../../source/clients/sequelize-client");
var config = require('../config/config.json');
var schema = new schema_1.Schema(require('../schema/game.json'));
var client = new sequelize_client_1.SequelizeClient(config.database);
var modeler = new modeler_1.DevModeler(schema, client);
describe('sql-builder-test', function () {
    this.timeout(5000);
    it('selection', function () {
        var builder = new query_generator_1.QueryGenerator(modeler.collections.Creature.getTrellis());
        var bundle = builder.generate({ where: { name: "ogre" } });
        assert.equal(bundle.sql, "SELECT * FROM \"creatures\" WHERE \"name\" = $1");
        assert.equal(bundle.args.length, 1);
        assert.equal(bundle.args[0], 'ogre');
    });
    it('advanced', function () {
        var builder = new query_generator_1.QueryGenerator(modeler.collections.Creature.getTrellis());
        var bundle = builder.generate({
            order: ['name', 'health', 'desc'],
            limit: 5,
        });
        assert.equal(bundle.sql, "SELECT * FROM \"creatures\" ORDER BY \"name\", \"health\" DESC LIMIT 5");
        assert.equal(bundle.args.length, 0);
    });
    // it.skip('generate', function () {
    //   const sql = generate(schema as any)
    //   checkDiff('test/resources/game.sql', sql, config.diffViewerPath)
    // })
});
//# sourceMappingURL=sql-builder-test.js.map