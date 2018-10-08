"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const migration_1 = require("../../migration");
require('source-map-support').install();
const query_generator_1 = require("../../source/sql/query-generator");
const assert = require("assert");
const modeler_1 = require("../../source/modeler");
const Sequelize = require('sequelize');
const diff_1 = require("../utility/diff");
const schema_1 = require("../../source/schema");
const sequelize_client_1 = require("../../source/clients/sequelize-client");
const sql_schema_builder_1 = require("../../migration/sql-schema-builder");
const types_1 = require("../../migration/types");
const config = require('../config/config.json');
const schema = new schema_1.Schema(require('../schema/game.json'));
const schema2 = new schema_1.Schema(require('../schema/game-2.json'));
const schema3 = new schema_1.Schema(require('../schema/game-3.json'));
const schema4 = new schema_1.Schema(require('../schema/game-4.json'));
const schema5 = new schema_1.Schema(require('../schema/game-5.json'));
const schema6 = new schema_1.Schema(require('../schema/game-6.json'));
const schema7 = new schema_1.Schema(require('../schema/game-7.json'));
const schema8 = new schema_1.Schema(require('../schema/game-8.json'));
const client = new sequelize_client_1.SequelizeClient(config.database);
const modeler = new modeler_1.DevModeler(schema, client);
const schemaBuilder = new sql_schema_builder_1.SqlSchemaBuilder(schema);
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
    it.skip('generate', function () {
        const sql = migration_1.generateInitializationSql(schema);
        diff_1.checkDiff('test/resources/game.sql', sql, config.diffViewerPath);
    });
    it('can create a table by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield modeler.regenerate();
            yield modeler.query(`DROP TABLE IF EXISTS characters CASCADE;`);
            const changes = migration_1.findChangedTrellises(schema.trellises, schema2.trellises);
            assert.equal(changes.length, 1, 'There should be one change');
            assert.equal(changes[0].type, types_1.ChangeType.createTable, 'The change should be to create a table');
            const sqlDiff = schemaBuilder.build(changes);
            const expected = `CREATE SEQUENCE characters_id_seq;\nCREATE TABLE IF NOT EXISTS characters (\n  "id" INTEGER DEFAULT nextval('characters_id_seq') NOT NULL,\n  "name" CHARACTER VARYING(255) DEFAULT '' NOT NULL,\n  "profession" CHARACTER VARYING(255) DEFAULT '' NOT NULL,\n  "created" TIMESTAMPTZ NOT NULL,\n  "modified" TIMESTAMPTZ NOT NULL,\n  CONSTRAINT "characters_pkey" PRIMARY KEY ("id")\n);\nALTER SEQUENCE characters_id_seq OWNED BY characters."id";`;
            assert.equal(sqlDiff, expected, 'Should generate SQL to add a new table');
            yield modeler.query(sqlDiff);
            const tableExists = yield modeler.query(`SELECT to_regclass('characters');`);
            assert(tableExists[0].to_regclass, 'The new table should exist in the DB');
        });
    });
    it('can delete a table by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield modeler.regenerate();
            const changes = migration_1.findChangedTrellises(schema2.trellises, schema.trellises);
            assert.equal(changes.length, 1, 'There should be one change');
            assert.equal(changes[0].type, types_1.ChangeType.deleteTable, 'The change should be to delete a table');
            const sqlDiff = schemaBuilder.build(changes);
            const expected = `DROP TABLE IF EXISTS "characters" CASCADE;`;
            assert.equal(sqlDiff, expected, 'Should generate SQL to delete an existing table');
            yield modeler.query(sqlDiff);
            const tableExists = yield modeler.query(`SELECT to_regclass('characters');`);
            assert.equal(tableExists[0].to_regclass, null, 'The table should no longer exist in the DB');
        });
    });
    it('can create a field by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield modeler.regenerate();
            const changes = migration_1.findChangedTrellises(schema.trellises, schema3.trellises);
            assert.equal(changes.length, 1, 'There should be one change');
            assert.equal(changes[0].type, types_1.ChangeType.createField, 'The change should be to create a field');
            const sqlDiff = schemaBuilder.build(changes);
            const expected = `ALTER TABLE "creatures"\n  ADD "isFuzzy" BOOLEAN DEFAULT false NOT NULL;`;
            assert.equal(sqlDiff, expected, 'Should generate SQL to create a new field on an existing table');
            yield modeler.query(sqlDiff);
            try {
                var fieldExists = yield modeler.query(`SELECT "isFuzzy"\nFROM creatures`);
            }
            catch (error) {
                console.log('SQL Database Error:', error.message);
            }
            assert(fieldExists, 'The new field should exist on the table');
        });
    });
    it('can delete a field by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const modeler = new modeler_1.DevModeler(schema3, client);
            yield modeler.regenerate();
            const changes = migration_1.findChangedTrellises(schema3.trellises, schema.trellises);
            assert.equal(changes.length, 1, 'There should be one change');
            assert.equal(changes[0].type, types_1.ChangeType.deleteField, 'The change should be to delete a field');
            const sqlDiff = schemaBuilder.build(changes);
            const expected = `ALTER TABLE "creatures"\n  DROP COLUMN "isFuzzy";`;
            assert.equal(sqlDiff, expected, 'Should generate SQL to delete a field from an existing table');
            yield modeler.query(sqlDiff);
            try {
                var fieldExists = yield modeler.query(`SELECT "isFuzzy"\nFROM creatures`);
            }
            catch (error) {
                console.log('SQL Database Error:', error.message);
            }
            assert.equal(fieldExists, undefined, 'The field should have been deleted from the table');
        });
    });
    it('can change a field type by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield modeler.regenerate();
            const changes = migration_1.findChangedTrellises(schema.trellises, schema4.trellises);
            assert.equal(changes.length, 1, 'There should be one change');
            assert.equal(changes[0].type, types_1.ChangeType.changeFieldType, 'The change should be the field type');
            const sqlDiff = schemaBuilder.build(changes);
            const expected = `ALTER TABLE "creatures"\n  ALTER COLUMN "health" TYPE CHARACTER VARYING(255);`;
            assert.equal(sqlDiff, expected, 'Should generate SQL to change the field type');
            yield modeler.query(sqlDiff);
            try {
                var fieldType = yield modeler.query(`SELECT DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE 
           TABLE_NAME = 'creatures' AND 
           COLUMN_NAME = 'health'`);
            }
            catch (error) {
                console.log('SQL Database Error:', error.message);
            }
            assert.equal(fieldType[0].data_type, 'character varying', 'The field type should be "character varying"');
        });
    });
    it('can change a field to nullable by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield modeler.regenerate();
            const changes = migration_1.findChangedTrellises(schema.trellises, schema5.trellises);
            assert.equal(changes.length, 1, 'There should be one change');
            assert.equal(changes[0].type, types_1.ChangeType.changeFieldNullable, 'The change should be field nullability');
            const sqlDiff = schemaBuilder.build(changes);
            const expected = `ALTER TABLE "tags"\n  ALTER COLUMN "name" DROP NOT NULL;`;
            assert.equal(sqlDiff, expected, 'Should generate SQL to change the field to nullable');
            yield modeler.query(sqlDiff);
            try {
                var fieldType = yield modeler.query(`SELECT IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE 
           TABLE_NAME = 'tags' AND 
           COLUMN_NAME = 'name'`);
            }
            catch (error) {
                console.log('SQL Database Error:', error.message);
            }
            assert.equal(fieldType[0].is_nullable, 'YES', 'The field should be nullable');
        });
    });
    it('can change a field to not nullable by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield modeler.regenerate();
            const changes = migration_1.findChangedTrellises(schema5.trellises, schema.trellises);
            assert.equal(changes.length, 1, 'There should be one change');
            assert.equal(changes[0].type, types_1.ChangeType.changeFieldNullable, 'The change should be field nullability');
            const sqlDiff = schemaBuilder.build(changes);
            const expected = `ALTER TABLE "tags"\n  ALTER COLUMN "name" SET NOT NULL;`;
            assert.equal(sqlDiff, expected, 'Should generate SQL to change the field to not nullable');
            yield modeler.query(sqlDiff);
            try {
                var fieldType = yield modeler.query(`SELECT IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE 
           TABLE_NAME = 'tags' AND 
           COLUMN_NAME = 'name'`);
            }
            catch (error) {
                console.log('SQL Database Error:', error.message);
            }
            assert.equal(fieldType[0].is_nullable, 'NO', 'The field should not be nullable');
        });
    });
    it('can make multiple changes by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield modeler.regenerate();
            yield modeler.query(`DROP TABLE IF EXISTS characters CASCADE;`);
            yield modeler.query(`DROP TABLE IF EXISTS weapons CASCADE;`);
            const changes = migration_1.findChangedTrellises(schema.trellises, schema6.trellises);
            assert.equal(changes.length, 6, 'There should be 6 changes');
            const sqlDiff = schemaBuilder.build(changes);
            yield modeler.query(sqlDiff);
            try {
                var tableAdded = yield modeler.query(`SELECT to_regclass('weapons');`);
                var tableDeleted = yield modeler.query(`SELECT to_regclass('worlds');`);
                var fieldAdded = yield modeler.query(`SELECT "isFluffy"\nFROM creatures;`);
                var fieldChanged = yield modeler.query(`SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'creatures' AND COLUMN_NAME = 'world';`);
                var fieldNullable = yield modeler.query(`SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'creatures' AND COLUMN_NAME = 'world';`);
                var fieldDeleted = yield modeler.query(`SELECT "health"\nFROM creatures;`);
            }
            catch (error) {
                console.log('SQL Database Error:', error.message);
            }
            assert(tableAdded[0].to_regclass, 'A new table should exist in the DB');
            assert.equal(tableDeleted[0].to_regclass, null, 'An old table should no longer exist in the DB');
            assert(fieldAdded, 'A new field should exist on an existing table');
            assert.equal(fieldDeleted, undefined, 'An old field should have been deleted from an existing table');
            assert.equal(fieldChanged[0].data_type, 'character varying', 'The field type should be "character varying"');
            assert.equal(fieldNullable[0].is_nullable, 'YES', 'The field should be nullable');
        });
    });
    it('can add a cross table by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield modeler.regenerate();
            yield modeler.query(`DROP TABLE IF EXISTS characters CASCADE;`);
            yield modeler.query(`DROP TABLE IF EXISTS weapons CASCADE;`);
            yield modeler.query(`DROP TABLE IF EXISTS tags CASCADE;`);
            const changes = migration_1.findChangedTrellises(schema7.trellises, schema.trellises);
            console.log('changes are', changes);
            assert.equal(changes.length, 2, 'There should be 2 changes');
            assert.equal(changes[1].type, types_1.ChangeType.createTable, 'The second change should be a createTable');
            const sqlDiff = schemaBuilder.build(changes);
            yield modeler.query(sqlDiff);
            const crossTableExists = yield modeler.query(`SELECT to_regclass('creatures_tags');`);
            assert(crossTableExists[0].to_regclass, 'The cross table should exist in the DB');
        });
    });
    it('can create an index by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield modeler.regenerate();
            const changes = migration_1.findChangedTrellises(schema.trellises, schema8.trellises);
            assert.equal(changes.length, 2, 'There should be two changes');
            assert.equal(changes[0].type, types_1.ChangeType.createIndex, 'The first change should be to create an index');
            assert.equal(changes[1].type, types_1.ChangeType.createIndex, 'The second change should be to create an index');
            const sqlDiff = schemaBuilder.build(changes);
            const expected = 'CREATE INDEX "creatures_health" ON "creatures" ("health");\nCREATE INDEX "tags_name" ON "tags" ("name");';
            assert.equal(sqlDiff, expected, 'Should generate SQL to create a new index on an existing table');
            yield modeler.query(sqlDiff);
            try {
                var indexes = yield modeler.query(`
        SELECT ic.relname AS index_name
        FROM pg_class bc,
            pg_class ic,
            pg_index i,
            pg_attribute a,
            pg_opclass oc,
            pg_namespace n
        WHERE i.indrelid = bc.oid AND
              i.indexrelid = ic.oid AND
              i.indkey[0] = a.attnum AND
              i.indclass[0] = oc.oid AND
              a.attrelid = bc.oid AND
              n.oid = bc.relnamespace AND
              bc.relname = 'tags' AND
              a.attname = 'name';
            `);
            }
            catch (error) {
                console.log('SQL Database Error:', error.message);
            }
            assert.equal(indexes.length, 1, 'The new tags_name index should exist on the table');
        });
    });
    it('can delete an index by generating sql diff', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const modeler = new modeler_1.DevModeler(schema8, client);
            yield modeler.regenerate();
            const changes = migration_1.findChangedTrellises(schema8.trellises, schema.trellises);
            assert.equal(changes.length, 2, 'There should be two changes');
            assert.equal(changes[0].type, types_1.ChangeType.deleteIndex, 'The first change should be to delete an index');
            assert.equal(changes[1].type, types_1.ChangeType.deleteIndex, 'The second change should be to delete an index');
            const sqlDiff = schemaBuilder.build(changes);
            const expected = 'DROP INDEX "creatures_health";\nDROP INDEX "tags_name";';
            assert.equal(sqlDiff, expected, 'Should generate SQL to delete an index from an existing table');
            yield modeler.query(sqlDiff);
            try {
                var indexes = yield modeler.query(`
        SELECT ic.relname AS index_name
        FROM pg_class bc,
            pg_class ic,
            pg_index i,
            pg_attribute a,
            pg_opclass oc,
            pg_namespace n
        WHERE i.indrelid = bc.oid AND
              i.indexrelid = ic.oid AND
              i.indkey[0] = a.attnum AND
              i.indclass[0] = oc.oid AND
              a.attrelid = bc.oid AND
              n.oid = bc.relnamespace AND
              bc.relname = 'tags' AND
              a.attname = 'name';
            `);
            }
            catch (error) {
                console.log('SQL Database Error:', error.message);
            }
            assert.equal(indexes.length, 0, 'The index tags_name should have been deleted from the table');
        });
    });
});
//# sourceMappingURL=sql-builder-test.js.map