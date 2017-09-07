require('source-map-support').install()
import {QueryBuilder} from "../../source/sql/query-builder";
import * as assert from 'assert'
import {DevModeler} from "../../source/modeler";
import {Schema} from "vineyard-schema"
import * as Sequelize from 'sequelize'

const config = require('../config/config.json')
const db = new Sequelize(config.database)
const schema = new Schema(require('../schema/game.json'))
const modeler = new DevModeler(db, schema)

describe('query-builder-test', function () {
  this.timeout(5000)

  it('selection', function () {
    const builder = new QueryBuilder(modeler.collections.Creature['trellis'])
    const sql = builder.build({where: {name: "ogre"}})
    assert.equal(sql, `SELECT * FROM "creatures" WHERE "name" = 'ogre'`)

  })
})