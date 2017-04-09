require('source-map-support').install()
import {Schema} from 'vineyard-schema'
import * as Sequelize from 'sequelize'
import {Model} from '../../source'

const config = require('../config/config.json')
const game_schema = require('../schema/game.json')

const db = new Sequelize(config.database)
const schema = new Schema(game_schema)
const model = new Model(db, schema)
model.sync_database({force: true})
  .then(() => model.collections.World.create({}))
  .then((world) => model.collections.Creature.create({
    name: "ogre",
    world: world,
    health: 5
  }))
  .then((ogre) => model.collections.Creature.update({
    id: ogre.id,
    health: 10
  }))
