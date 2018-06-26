"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var migration_1 = require("../../migration");
require('source-map-support').install();
var query_generator_1 = require("../../source/sql/query-generator");
var assert = require("assert");
var modeler_1 = require("../../source/modeler");
var Sequelize = require('sequelize');
var diff_1 = require("../utility/diff");
var schema_1 = require("../../source/schema");
var sequelize_client_1 = require("../../source/clients/sequelize-client");
var sql_schema_builder_1 = require("../../migration/sql-schema-builder");
var types_1 = require("../../migration/types");
var config = require('../config/config.json');
var schema = new schema_1.Schema(require('../schema/game.json'));
var schema2 = new schema_1.Schema(require('../schema/game-2.json'));
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
    it.skip('generate', function () {
        var sql = migration_1.generate(schema);
        diff_1.checkDiff('test/resources/game.sql', sql, config.diffViewerPath);
    });
    it('can generate sql diff to add a new table', function () {
        return __awaiter(this, void 0, void 0, function () {
            var changes, builder, sqlDiff, expected, tableExists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, modeler.regenerate()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, modeler.query("DROP TABLE IF EXISTS characters CASCADE;")];
                    case 2:
                        _a.sent();
                        changes = migration_1.findChangedTrellises(schema.trellises, schema2.trellises);
                        assert.equal(changes.length, 1, "There should only be one change");
                        assert.equal(changes[0].type, types_1.ChangeType.createTable, "The change should be to create a table");
                        builder = new sql_schema_builder_1.SqlSchemaBuilder(schema);
                        sqlDiff = builder.build(changes);
                        expected = "CREATE SEQUENCE characters_id_seq;\nCREATE TABLE characters (\n  \"id\" INTEGER DEFAULT nextval('characters_id_seq') NOT NULL,\n  \"name\" CHARACTER VARYING(255) DEFAULT '' NOT NULL,\n  \"profession\" CHARACTER VARYING(255) DEFAULT '' NOT NULL,\n  \"created\" TIMESTAMPTZ NOT NULL,\n  \"modified\" TIMESTAMPTZ NOT NULL,\n  CONSTRAINT \"characters_pkey\" PRIMARY KEY (\"id\")\n);\nALTER SEQUENCE characters_id_seq OWNED BY characters.\"id\";\n";
                        assert.equal(sqlDiff, expected, "Should generate SQL to add a new table");
                        return [4 /*yield*/, modeler.query(sqlDiff)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, modeler.query("SELECT to_regclass('characters');")];
                    case 4:
                        tableExists = _a.sent();
                        assert(tableExists[0].to_regclass, "The new table should exist in the DB");
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=sql-builder-test.js.map