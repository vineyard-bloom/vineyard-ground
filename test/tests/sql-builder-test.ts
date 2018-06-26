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

  it('can generate sql diff to add a new table', function () {
    const changes = findChangedTrellises(schema.trellises, schema2.trellises)
    console.log('changes', changes)

    assert.equal(changes.length, 1, "There should only be one change")

    const builder = new SqlSchemaBuilder(schema)
    const result = builder.build(changes)
    console.log('change result is', result)
  })

  // it.skip('generate', function () {
  //   const sql = generate(schema as any)
  //   checkDiff('test/resources/game.sql', sql, config.diffViewerPath)
  // })
})