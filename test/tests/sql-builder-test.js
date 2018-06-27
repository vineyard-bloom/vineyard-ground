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
var schema3 = new schema_1.Schema(require('../schema/game-3.json'));
var schema4 = new schema_1.Schema(require('../schema/game-4.json'));
var schema5 = new schema_1.Schema(require('../schema/game-5.json'));
var schema6 = new schema_1.Schema(require('../schema/game-6.json'));
var schema7 = new schema_1.Schema(require('../schema/game-7.json'));
var client = new sequelize_client_1.SequelizeClient(config.database);
var modeler = new modeler_1.DevModeler(schema, client);
var schemaBuilder = new sql_schema_builder_1.SqlSchemaBuilder(schema);
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
    it('can create a table by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function () {
            var changes, sqlDiff, expected, tableExists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, modeler.regenerate()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, modeler.query("DROP TABLE IF EXISTS characters CASCADE;")];
                    case 2:
                        _a.sent();
                        changes = migration_1.findChangedTrellises(schema.trellises, schema2.trellises);
                        assert.equal(changes.length, 1, 'There should only be one change');
                        assert.equal(changes[0].type, types_1.ChangeType.createTable, 'The change should be to create a table');
                        sqlDiff = schemaBuilder.build(changes);
                        expected = "CREATE SEQUENCE characters_id_seq;\nCREATE TABLE IF NOT EXISTS characters (\n  \"id\" INTEGER DEFAULT nextval('characters_id_seq') NOT NULL,\n  \"name\" CHARACTER VARYING(255) DEFAULT '' NOT NULL,\n  \"profession\" CHARACTER VARYING(255) DEFAULT '' NOT NULL,\n  \"created\" TIMESTAMPTZ NOT NULL,\n  \"modified\" TIMESTAMPTZ NOT NULL,\n  CONSTRAINT \"characters_pkey\" PRIMARY KEY (\"id\")\n);\nALTER SEQUENCE characters_id_seq OWNED BY characters.\"id\";";
                        assert.equal(sqlDiff, expected, 'Should generate SQL to add a new table');
                        return [4 /*yield*/, modeler.query(sqlDiff)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, modeler.query("SELECT to_regclass('characters');")];
                    case 4:
                        tableExists = _a.sent();
                        assert(tableExists[0].to_regclass, 'The new table should exist in the DB');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('can delete a table by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function () {
            var changes, sqlDiff, expected, tableExists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, modeler.regenerate()];
                    case 1:
                        _a.sent();
                        changes = migration_1.findChangedTrellises(schema2.trellises, schema.trellises);
                        assert.equal(changes.length, 1, 'There should only be one change');
                        assert.equal(changes[0].type, types_1.ChangeType.deleteTable, 'The change should be to delete a table');
                        sqlDiff = schemaBuilder.build(changes);
                        expected = "DROP TABLE IF EXISTS \"characters\" CASCADE;";
                        assert.equal(sqlDiff, expected, 'Should generate SQL to delete an existing table');
                        return [4 /*yield*/, modeler.query(sqlDiff)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, modeler.query("SELECT to_regclass('characters');")];
                    case 3:
                        tableExists = _a.sent();
                        assert.equal(tableExists[0].to_regclass, null, 'The table should no longer exist in the DB');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('can create a field by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function () {
            var changes, sqlDiff, expected, fieldExists, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, modeler.regenerate()];
                    case 1:
                        _a.sent();
                        changes = migration_1.findChangedTrellises(schema.trellises, schema3.trellises);
                        assert.equal(changes.length, 1, 'There should only be one change');
                        assert.equal(changes[0].type, types_1.ChangeType.createField, 'The change should be to create a field');
                        sqlDiff = schemaBuilder.build(changes);
                        expected = "ALTER TABLE \"creatures\"\n  ADD \"isFuzzy\" BOOLEAN DEFAULT false NOT NULL;";
                        assert.equal(sqlDiff, expected, 'Should generate SQL to create a new field on an existing table');
                        return [4 /*yield*/, modeler.query(sqlDiff)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, modeler.query("SELECT \"isFuzzy\"\nFROM creatures")];
                    case 4:
                        fieldExists = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.log('SQL Database Error:', error_1.message);
                        return [3 /*break*/, 6];
                    case 6:
                        assert(fieldExists, 'The new field should exist on the table');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('can delete a field by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function () {
            var modeler, changes, sqlDiff, expected, fieldExists, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modeler = new modeler_1.DevModeler(schema3, client);
                        return [4 /*yield*/, modeler.regenerate()];
                    case 1:
                        _a.sent();
                        changes = migration_1.findChangedTrellises(schema3.trellises, schema.trellises);
                        assert.equal(changes.length, 1, 'There should only be one change');
                        assert.equal(changes[0].type, types_1.ChangeType.deleteField, 'The change should be to delete a field');
                        sqlDiff = schemaBuilder.build(changes);
                        expected = "ALTER TABLE \"creatures\"\n  DROP COLUMN \"isFuzzy\";";
                        assert.equal(sqlDiff, expected, 'Should generate SQL to delete a field from an existing table');
                        return [4 /*yield*/, modeler.query(sqlDiff)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, modeler.query("SELECT \"isFuzzy\"\nFROM creatures")];
                    case 4:
                        fieldExists = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        console.log('SQL Database Error:', error_2.message);
                        return [3 /*break*/, 6];
                    case 6:
                        assert.equal(fieldExists, undefined, 'The field should have been deleted from the table');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('can change a field type by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function () {
            var changes, sqlDiff, expected, fieldType, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, modeler.regenerate()];
                    case 1:
                        _a.sent();
                        changes = migration_1.findChangedTrellises(schema.trellises, schema4.trellises);
                        assert.equal(changes.length, 1, 'There should only be one change');
                        assert.equal(changes[0].type, types_1.ChangeType.changeFieldType, 'The change should be the field type');
                        sqlDiff = schemaBuilder.build(changes);
                        expected = "ALTER TABLE \"creatures\"\n  ALTER COLUMN \"health\" TYPE CHARACTER VARYING(255);";
                        assert.equal(sqlDiff, expected, 'Should generate SQL to change the field type');
                        return [4 /*yield*/, modeler.query(sqlDiff)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, modeler.query("SELECT DATA_TYPE \n      FROM INFORMATION_SCHEMA.COLUMNS\n      WHERE \n           TABLE_NAME = 'creatures' AND \n           COLUMN_NAME = 'health'")];
                    case 4:
                        fieldType = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        console.log('SQL Database Error:', error_3.message);
                        return [3 /*break*/, 6];
                    case 6:
                        assert.equal(fieldType[0].data_type, 'character varying', 'The field type should be "character varying"');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('can change a field to nullable by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function () {
            var changes, sqlDiff, expected, fieldType, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, modeler.regenerate()];
                    case 1:
                        _a.sent();
                        changes = migration_1.findChangedTrellises(schema.trellises, schema5.trellises);
                        assert.equal(changes.length, 1, 'There should only be one change');
                        assert.equal(changes[0].type, types_1.ChangeType.changeFieldNullable, 'The change should be field nullability');
                        sqlDiff = schemaBuilder.build(changes);
                        expected = "ALTER TABLE \"tags\"\n  ALTER COLUMN \"name\" DROP NOT NULL;";
                        assert.equal(sqlDiff, expected, 'Should generate SQL to change the field to nullable');
                        return [4 /*yield*/, modeler.query(sqlDiff)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, modeler.query("SELECT IS_NULLABLE \n      FROM INFORMATION_SCHEMA.COLUMNS\n      WHERE \n           TABLE_NAME = 'tags' AND \n           COLUMN_NAME = 'name'")];
                    case 4:
                        fieldType = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        console.log('SQL Database Error:', error_4.message);
                        return [3 /*break*/, 6];
                    case 6:
                        assert.equal(fieldType[0].is_nullable, 'YES', 'The field should be nullable');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('can change a field to not nullable by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function () {
            var changes, sqlDiff, expected, fieldType, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, modeler.regenerate()];
                    case 1:
                        _a.sent();
                        changes = migration_1.findChangedTrellises(schema5.trellises, schema.trellises);
                        assert.equal(changes.length, 1, 'There should only be one change');
                        assert.equal(changes[0].type, types_1.ChangeType.changeFieldNullable, 'The change should be field nullability');
                        sqlDiff = schemaBuilder.build(changes);
                        expected = "ALTER TABLE \"tags\"\n  ALTER COLUMN \"name\" SET NOT NULL;";
                        assert.equal(sqlDiff, expected, 'Should generate SQL to change the field to not nullable');
                        return [4 /*yield*/, modeler.query(sqlDiff)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, modeler.query("SELECT IS_NULLABLE \n      FROM INFORMATION_SCHEMA.COLUMNS\n      WHERE \n           TABLE_NAME = 'tags' AND \n           COLUMN_NAME = 'name'")];
                    case 4:
                        fieldType = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_5 = _a.sent();
                        console.log('SQL Database Error:', error_5.message);
                        return [3 /*break*/, 6];
                    case 6:
                        assert.equal(fieldType[0].is_nullable, 'NO', 'The field should not be nullable');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('can make multiple changes by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function () {
            var changes, sqlDiff, tableAdded, tableDeleted, fieldAdded, fieldChanged, fieldNullable, fieldDeleted, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, modeler.regenerate()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, modeler.query("DROP TABLE IF EXISTS characters CASCADE;")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, modeler.query("DROP TABLE IF EXISTS weapons CASCADE;")];
                    case 3:
                        _a.sent();
                        changes = migration_1.findChangedTrellises(schema.trellises, schema6.trellises);
                        assert.equal(changes.length, 6, 'There should be 6 changes');
                        sqlDiff = schemaBuilder.build(changes);
                        return [4 /*yield*/, modeler.query(sqlDiff)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 12, , 13]);
                        return [4 /*yield*/, modeler.query("SELECT to_regclass('weapons');")];
                    case 6:
                        tableAdded = _a.sent();
                        return [4 /*yield*/, modeler.query("SELECT to_regclass('worlds');")];
                    case 7:
                        tableDeleted = _a.sent();
                        return [4 /*yield*/, modeler.query("SELECT \"isFluffy\"\nFROM creatures;")];
                    case 8:
                        fieldAdded = _a.sent();
                        return [4 /*yield*/, modeler.query("SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'creatures' AND COLUMN_NAME = 'world';")];
                    case 9:
                        fieldChanged = _a.sent();
                        return [4 /*yield*/, modeler.query("SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'creatures' AND COLUMN_NAME = 'world';")];
                    case 10:
                        fieldNullable = _a.sent();
                        return [4 /*yield*/, modeler.query("SELECT \"health\"\nFROM creatures;")];
                    case 11:
                        fieldDeleted = _a.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        error_6 = _a.sent();
                        console.log('SQL Database Error:', error_6.message);
                        return [3 /*break*/, 13];
                    case 13:
                        assert(tableAdded[0].to_regclass, 'A new table should exist in the DB');
                        assert.equal(tableDeleted[0].to_regclass, null, 'An old table should no longer exist in the DB');
                        assert(fieldAdded, 'A new field should exist on an existing table');
                        assert.equal(fieldDeleted, undefined, 'An old field should have been deleted from an existing table');
                        assert.equal(fieldChanged[0].data_type, 'character varying', 'The field type should be "character varying"');
                        assert.equal(fieldNullable[0].is_nullable, 'YES', 'The field should be nullable');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('can add a cross table by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function () {
            var changes, sqlDiff, crossTableExists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, modeler.regenerate()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, modeler.query("DROP TABLE IF EXISTS characters CASCADE;")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, modeler.query("DROP TABLE IF EXISTS weapons CASCADE;")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, modeler.query("DROP TABLE IF EXISTS tags CASCADE;")];
                    case 4:
                        _a.sent();
                        changes = migration_1.findChangedTrellises(schema7.trellises, schema.trellises);
                        console.log('changes are', changes);
                        assert.equal(changes.length, 2, 'There should be 2 changes');
                        assert.equal(changes[1].type, types_1.ChangeType.createTable, 'The second change should be a createTable');
                        sqlDiff = schemaBuilder.build(changes);
                        return [4 /*yield*/, modeler.query(sqlDiff)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, modeler.query("SELECT to_regclass('creatures_tags');")];
                    case 6:
                        crossTableExists = _a.sent();
                        assert(crossTableExists[0].to_regclass, 'The cross table should exist in the DB');
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=sql-builder-test.js.map