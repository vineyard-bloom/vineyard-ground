import {generate, findChangedTrellises} from '../../migration'

require('source-map-support').install()
import {QueryGenerator} from '../../source/sql/query-generator'
import * as assert from 'assert'
import {DevModeler} from '../../source/modeler'
const Sequelize = require('sequelize')
import {checkDiff} from '../utility/diff'
import {Schema} from '../../source/schema'
import {SequelizeClient} from '../../source/clients/sequelize-client'
import { SqlSchemaBuilder } from '../../migration/sql-schema-builder'
import { ChangeType } from '../../migration/types'

const config = require('../config/config.json')
const schema = new Schema(require('../schema/game.json'))
const schema2 = new Schema(require('../schema/game-2.json'))
const schema3 = new Schema(require('../schema/game-3.json'))
const schema4 = new Schema(require('../schema/game-4.json'))
const schema5 = new Schema(require('../schema/game-5.json'))
const schema6 = new Schema(require('../schema/game-6.json'))
const schema7 = new Schema(require('../schema/game-7.json'))
const client = new SequelizeClient(config.database)
const modeler = new DevModeler(schema, client)

const schemaBuilder = new SqlSchemaBuilder(schema)

describe('sql-builder-test', function () {
  this.timeout(5000)

  it('selection', function () {
    const builder = new QueryGenerator(modeler.collections.Creature.getTrellis())
    const bundle = builder.generate({where: {name: "ogre"}})
    assert.equal(bundle.sql, `SELECT * FROM "creatures" WHERE "name" = $1`)
    assert.equal(bundle.args.length, 1)
    assert.equal(bundle.args[0], 'ogre')
  })

  it('advanced', function () {
    const builder = new QueryGenerator(modeler.collections.Creature.getTrellis())
    const bundle = builder.generate({
      order: ['name', 'health', 'desc'],
      limit: 5,
    })
    assert.equal(bundle.sql, `SELECT * FROM "creatures" ORDER BY "name", "health" DESC LIMIT 5`)
    assert.equal(bundle.args.length, 0)
  })

  it.skip('generate', function () {
    const sql = generate(schema as any)
    checkDiff('test/resources/game.sql', sql, config.diffViewerPath)
  })

  it('can create a table by generating sql diff', async function () {
    await modeler.regenerate()
    await modeler.query(`DROP TABLE IF EXISTS characters CASCADE;`)

    const changes = findChangedTrellises(schema.trellises, schema2.trellises)
    assert.equal(changes.length, 1, 'There should only be one change')
    assert.equal(changes[0].type, ChangeType.createTable, 'The change should be to create a table')

    const sqlDiff = schemaBuilder.build(changes)

    const expected = `CREATE SEQUENCE characters_id_seq;\nCREATE TABLE IF NOT EXISTS characters (\n  "id" INTEGER DEFAULT nextval('characters_id_seq') NOT NULL,\n  "name" CHARACTER VARYING(255) DEFAULT '' NOT NULL,\n  "profession" CHARACTER VARYING(255) DEFAULT '' NOT NULL,\n  "created" TIMESTAMPTZ NOT NULL,\n  "modified" TIMESTAMPTZ NOT NULL,\n  CONSTRAINT "characters_pkey" PRIMARY KEY ("id")\n);\nALTER SEQUENCE characters_id_seq OWNED BY characters."id";`
    assert.equal(sqlDiff, expected, 'Should generate SQL to add a new table')

    await modeler.query(sqlDiff)
    const tableExists = await modeler.query(`SELECT to_regclass('characters');`)
    assert(tableExists[0].to_regclass, 'The new table should exist in the DB')
  })

  it('can delete a table by generating sql diff', async function () {
    await modeler.regenerate()

    const changes = findChangedTrellises(schema2.trellises, schema.trellises)
    assert.equal(changes.length, 1, 'There should only be one change')
    assert.equal(changes[0].type, ChangeType.deleteTable, 'The change should be to delete a table')

    const sqlDiff = schemaBuilder.build(changes)

    const expected = `DROP TABLE IF EXISTS "characters" CASCADE;`
    assert.equal(sqlDiff, expected, 'Should generate SQL to delete an existing table')

    await modeler.query(sqlDiff)
    const tableExists = await modeler.query(`SELECT to_regclass('characters');`)
    assert.equal(tableExists[0].to_regclass, null, 'The table should no longer exist in the DB')
  })

  it('can create a field by generating sql diff', async function () {
    await modeler.regenerate()

    const changes = findChangedTrellises(schema.trellises, schema3.trellises)
    assert.equal(changes.length, 1, 'There should only be one change')
    assert.equal(changes[0].type, ChangeType.createField, 'The change should be to create a field')

    const sqlDiff = schemaBuilder.build(changes)

    const expected = `ALTER TABLE "creatures"\n  ADD "isFuzzy" BOOLEAN DEFAULT false NOT NULL;`
    assert.equal(sqlDiff, expected, 'Should generate SQL to create a new field on an existing table')

    await modeler.query(sqlDiff)

    try {
      var fieldExists = await modeler.query(`SELECT "isFuzzy"\nFROM creatures`)
    } catch (error) {
      console.log('SQL Database Error:', error.message)
    }
    assert(fieldExists, 'The new field should exist on the table')
  })

  it('can delete a field by generating sql diff', async function () {
    const modeler = new DevModeler(schema3, client)
    await modeler.regenerate()

    const changes = findChangedTrellises(schema3.trellises, schema.trellises)
    assert.equal(changes.length, 1, 'There should only be one change')
    assert.equal(changes[0].type, ChangeType.deleteField, 'The change should be to delete a field')

    const sqlDiff = schemaBuilder.build(changes)

    const expected = `ALTER TABLE "creatures"\n  DROP COLUMN "isFuzzy";`
    assert.equal(sqlDiff, expected, 'Should generate SQL to delete a field from an existing table')

    await modeler.query(sqlDiff)

    try {
      var fieldExists = await modeler.query(`SELECT "isFuzzy"\nFROM creatures`)
    } catch (error) {
      console.log('SQL Database Error:', error.message)
    }
    assert.equal(fieldExists, undefined, 'The field should have been deleted from the table')
  })

  it('can change a field type by generating sql diff', async function () {
    await modeler.regenerate()

    const changes = findChangedTrellises(schema.trellises, schema4.trellises)
    assert.equal(changes.length, 1, 'There should only be one change')
    assert.equal(changes[0].type, ChangeType.changeFieldType, 'The change should be the field type')

    const sqlDiff = schemaBuilder.build(changes)

    const expected = `ALTER TABLE "creatures"\n  ALTER COLUMN "health" TYPE CHARACTER VARYING(255);`
    assert.equal(sqlDiff, expected, 'Should generate SQL to change the field type')

    await modeler.query(sqlDiff)

    try {
      var fieldType = await modeler.query(`SELECT DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE 
           TABLE_NAME = 'creatures' AND 
           COLUMN_NAME = 'health'`)
    } catch (error) {
      console.log('SQL Database Error:', error.message)
    }
    assert.equal(fieldType[0].data_type, 'character varying', 'The field type should be "character varying"')
  })

  it('can change a field to nullable by generating sql diff', async function () {
    await modeler.regenerate()

    const changes = findChangedTrellises(schema.trellises, schema5.trellises)
    assert.equal(changes.length, 1, 'There should only be one change')
    assert.equal(changes[0].type, ChangeType.changeFieldNullable, 'The change should be field nullability')

    const sqlDiff = schemaBuilder.build(changes)

    const expected = `ALTER TABLE "tags"\n  ALTER COLUMN "name" DROP NOT NULL;`
    assert.equal(sqlDiff, expected, 'Should generate SQL to change the field to nullable')

    await modeler.query(sqlDiff)

    try {
      var fieldType = await modeler.query(`SELECT IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE 
           TABLE_NAME = 'tags' AND 
           COLUMN_NAME = 'name'`)
    } catch (error) {
      console.log('SQL Database Error:', error.message)
    }
    assert.equal(fieldType[0].is_nullable, 'YES', 'The field should be nullable')
  })

  it('can change a field to not nullable by generating sql diff', async function () {
    await modeler.regenerate()

    const changes = findChangedTrellises(schema5.trellises, schema.trellises)
    assert.equal(changes.length, 1, 'There should only be one change')
    assert.equal(changes[0].type, ChangeType.changeFieldNullable, 'The change should be field nullability')

    const sqlDiff = schemaBuilder.build(changes)

    const expected = `ALTER TABLE "tags"\n  ALTER COLUMN "name" SET NOT NULL;`
    assert.equal(sqlDiff, expected, 'Should generate SQL to change the field to not nullable')

    await modeler.query(sqlDiff)

    try {
      var fieldType = await modeler.query(`SELECT IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE 
           TABLE_NAME = 'tags' AND 
           COLUMN_NAME = 'name'`)
    } catch (error) {
      console.log('SQL Database Error:', error.message)
    }
    assert.equal(fieldType[0].is_nullable, 'NO', 'The field should not be nullable')
  })

  it('can make multiple changes by generating sql diff', async function () {
    await modeler.regenerate()
    await modeler.query(`DROP TABLE IF EXISTS characters CASCADE;`)
    await modeler.query(`DROP TABLE IF EXISTS weapons CASCADE;`)

    const changes = findChangedTrellises(schema.trellises, schema6.trellises)
    assert.equal(changes.length, 6, 'There should be 6 changes')

    const sqlDiff = schemaBuilder.build(changes)
    await modeler.query(sqlDiff)

    try {
      var tableAdded = await modeler.query(`SELECT to_regclass('weapons');`)
      var tableDeleted = await modeler.query(`SELECT to_regclass('worlds');`)
      var fieldAdded = await modeler.query(`SELECT "isFluffy"\nFROM creatures;`)
      var fieldChanged = await modeler.query(`SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'creatures' AND COLUMN_NAME = 'world';`)
      var fieldNullable = await modeler.query(`SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'creatures' AND COLUMN_NAME = 'world';`)
      var fieldDeleted = await modeler.query(`SELECT "health"\nFROM creatures;`)
    } catch (error) {
      console.log('SQL Database Error:', error.message)
    }

    assert(tableAdded[0].to_regclass, 'A new table should exist in the DB')
    assert.equal(tableDeleted[0].to_regclass, null, 'An old table should no longer exist in the DB')
    assert(fieldAdded, 'A new field should exist on an existing table')
    assert.equal(fieldDeleted, undefined, 'An old field should have been deleted from an existing table')
    assert.equal(fieldChanged[0].data_type, 'character varying', 'The field type should be "character varying"')
    assert.equal(fieldNullable[0].is_nullable, 'YES', 'The field should be nullable')
  })

  it('can add a cross table by generating sql diff', async function () {
    await modeler.regenerate()
    await modeler.query(`DROP TABLE IF EXISTS characters CASCADE;`)
    await modeler.query(`DROP TABLE IF EXISTS weapons CASCADE;`)
    await modeler.query(`DROP TABLE IF EXISTS tags CASCADE;`)

    const changes = findChangedTrellises(schema7.trellises, schema.trellises)
    console.log('changes are', changes)
    assert.equal(changes.length, 2, 'There should be 2 changes')
    assert.equal(changes[1].type, ChangeType.createTable, 'The second change should be a createTable')

    const sqlDiff = schemaBuilder.build(changes)
    await modeler.query(sqlDiff)

    const crossTableExists = await modeler.query(`SELECT to_regclass('creatures_tags');`)
    assert(crossTableExists[0].to_regclass, 'The cross table should exist in the DB')
  })

})