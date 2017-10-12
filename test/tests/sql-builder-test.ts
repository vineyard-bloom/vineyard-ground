import {generate} from "../../migration";

require('source-map-support').install()
import {QueryGenerator} from "../../source/sql/query-generator";
import * as assert from 'assert'
import {DevModeler} from "../../source/modeler";
import {Schema} from "vineyard-schema"
const Sequelize = require('sequelize')
import {checkDiff} from "../utility/diff";

const config = require('../config/config.json')
const db = new Sequelize(config.database)
const schema = new Schema(require('../schema/game.json'))
const modeler = new DevModeler(db, schema)

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

  it('generate', function () {
    const sql = generate(schema as any)
    checkDiff('test/resources/game.sql', sql, config.diffViewerPath)
  })
})