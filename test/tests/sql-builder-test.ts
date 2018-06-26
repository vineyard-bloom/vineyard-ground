import {generate, findChangedTrellises} from "../../migration";

require('source-map-support').install()
import {QueryGenerator} from "../../source/sql/query-generator";
import * as assert from 'assert'
import {DevModeler} from "../../source/modeler";
const Sequelize = require('sequelize')
import {checkDiff} from "../utility/diff";
import {Schema} from "../../source/schema";
import {SequelizeClient} from "../../source/clients/sequelize-client";
import { SqlSchemaBuilder } from "../../migration/sql-schema-builder";
import { ChangeType } from "../../migration/types";

const config = require('../config/config.json')
const schema = new Schema(require('../schema/game.json'))
const schema2 = new Schema(require('../schema/game-2.json'))
const client = new SequelizeClient(config.database)
const modeler = new DevModeler(schema, client)

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

  it('can generate sql diff to add a new table', async function () {
    await modeler.regenerate()
    await modeler.query(`DROP TABLE IF EXISTS characters CASCADE;`)

    const changes = findChangedTrellises(schema.trellises, schema2.trellises)
    assert.equal(changes.length, 1, "There should only be one change")
    assert.equal(changes[0].type, ChangeType.createTable, "The change should be to create a table")

    const builder = new SqlSchemaBuilder(schema)
    const sqlDiff = builder.build(changes)

    const expected = `CREATE SEQUENCE characters_id_seq;\nCREATE TABLE IF NOT EXISTS characters (\n  "id" INTEGER DEFAULT nextval('characters_id_seq') NOT NULL,\n  "name" CHARACTER VARYING(255) DEFAULT '' NOT NULL,\n  "profession" CHARACTER VARYING(255) DEFAULT '' NOT NULL,\n  "created" TIMESTAMPTZ NOT NULL,\n  "modified" TIMESTAMPTZ NOT NULL,\n  CONSTRAINT "characters_pkey" PRIMARY KEY ("id")\n);\nALTER SEQUENCE characters_id_seq OWNED BY characters."id";\n`
    assert.equal(sqlDiff, expected, "Should generate SQL to add a new table")

    await modeler.query(sqlDiff)
    const tableExists = await modeler.query(`SELECT to_regclass('characters');`)
    assert(tableExists[0].to_regclass, "The new table should exist in the DB")
  })

  it('can generate sql diff to delete a table', async function () {
    const modeler2 = new DevModeler(schema2, client)
    await modeler2.regenerate()

    const changes = findChangedTrellises(schema2.trellises, schema.trellises)
    assert.equal(changes.length, 1, "There should only be one change")
    assert.equal(changes[0].type, ChangeType.deleteTable, "The change should be to delete a table")

    const builder = new SqlSchemaBuilder(schema2)
    const sqlDiff = builder.build(changes)

    const expected = `DROP TABLE IF EXISTS characters CASCADE;`
    assert.equal(sqlDiff, expected, "Should generate SQL to delete an existing table")

    await modeler.query(sqlDiff)
    const tableExists = await modeler.query(`SELECT to_regclass('characters');`)
    assert.equal(tableExists[0].to_regclass, null, "The table should no longer exist in the DB")
  })

})