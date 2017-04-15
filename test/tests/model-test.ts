require('source-map-support').install()
import {Schema} from 'vineyard-schema'
import * as Sequelize from 'sequelize'
import {Modeler} from '../../source'

const config = require('../config/config.json')
const game_schema = require('../schema/game.json')

describe('Model Test', function () {
  this.timeout(4000)
  it('sync_database', function () {
    const db = new Sequelize(config.database)
    const schema = new Schema(game_schema)
    const modeler = new Modeler(db, schema)
    const model:any = modeler.collections
    return modeler.regenerate()
      .then(() => model.World.create({}))
      .then((world) => model.Creature.create({
        name: "ogre",
        world: world,
        health: 5
      }))
      .then((ogre) => model.Creature.update({
        id: ogre.id,
        health: 10
      }))
  })
})