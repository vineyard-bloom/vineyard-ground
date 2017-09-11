"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
var query_builder_1 = require("../../source/sql/query-builder");
var assert = require("assert");
var modeler_1 = require("../../source/modeler");
var vineyard_schema_1 = require("vineyard-schema");
var Sequelize = require("sequelize");
var config = require('../config/config.json');
var db = new Sequelize(config.database);
var schema = new vineyard_schema_1.Schema(require('../schema/game.json'));
var modeler = new modeler_1.DevModeler(db, schema);
describe('query-builder-test', function () {
    this.timeout(5000);
    it('selection', function () {
        var builder = new query_builder_1.QueryBuilder(modeler.collections.Creature['trellis']);
        var bundle = builder.build({ where: { name: "ogre" } });
        assert.equal(bundle.sql, "SELECT * FROM \"creatures\" WHERE \"name\" = $1");
        assert.equal(bundle.args.length, 1);
        assert.equal(bundle.args[0], 'ogre');
    });
    it('advanced', function () {
        var builder = new query_builder_1.QueryBuilder(modeler.collections.Creature['trellis']);
        var bundle = builder.build({
            order: ['name', 'health', 'desc'],
            limit: 5,
        });
        assert.equal(bundle.sql, "SELECT * FROM \"creatures\" ORDER BY \"name\", \"health\" DESC LIMIT 5");
        assert.equal(bundle.args.length, 0);
    });
});
//# sourceMappingURL=sql-builder-test.js.map