import {DevModeler} from "../../source/modeler";

require('source-map-support').install()
import * as assert from 'assert'
import {Schema} from 'vineyard-schema'
import * as Sequelize from 'sequelize'
import {Modeler, Add, Remove} from '../../source'
import {usePostgres} from "../../source/database";

const config = require('../config/config.json')
let mainWorld,
  dangerousTag,
  flyingTag

describe('Game', function () {
  this.timeout(5000)
  it('sync_database', function () {
    const db = new Sequelize(config.database)
    usePostgres(db, config.database)
    const schema = new Schema(require('../schema/game.json'))
    const modeler = new DevModeler(db, schema)
    const model: any = modeler.collections
    return modeler.regenerate()
      .then(() => model.Tag.create({
          name: "flying"
        })
          .then(tag => flyingTag = tag)
          .then(() => model.World.create({}))
          .then(world => mainWorld = world)
          .then(() => model.Creature.create({
            name: "ogre",
            world: mainWorld,
            health: 5
          }))
          .then(ogre => model.Tag.create({
              name: "dangerous"
            })
              .then(tag => dangerousTag = tag)
              .then(() => model.Creature.update(ogre, {
                  health: 10,
                  tags: Add(dangerousTag)
                })
                  .then(creature => {
                    assert.equal(creature.health, 10)
                    return model.Creature.first().expand('tags')
                  })
                  .then(creature => {
                    assert(Array.isArray(creature.tags))
                    assert.equal(1, creature.tags.length)
                    assert.equal('dangerous', creature.tags[0].name)
                  })
                  .then(() => model.Creature.update(ogre, {
                      tags: Remove(dangerousTag)
                    })
                  )
              )
          )
      )
      .then(() => model.Creature.first().expand('tags'))
      .then(creature => {
        assert(Array.isArray(creature.tags))
        assert.equal(0, creature.tags.length)
      })
      .then(() => model.Creature.create({
        name: "hero",
        world: mainWorld,
        health: 4,
        tags: Add(flyingTag)
      }))
      .then(() => model.World.first().expand('creatures'))
      .then(world => {
        assert(Array.isArray(world.creatures))
        assert.equal(2, world.creatures.length)
      })
  })
})

describe('Arbitrary', function () {
  this.timeout(4000)
  it('sync_database', function () {
    const db = new Sequelize(config.database)
    const schema = new Schema(require('../schema/arbitrary.json'))
    const modeler = new DevModeler(db, schema)
    const model: any = modeler.collections
    const BigNumber = require('bignumber.js')
    return modeler.regenerate()
      .then(() => model.Odd.create({
          strange: 10,
          unknown: "mist",
          vast: "1000000000000000000000000000021"
        })
      )
      .then(() => model.Odd.create({
          strange: 11,
          unknown: "mist2",
          vast: new BigNumber("1000000000000000000000000000021")
        })
      )
      .then(() => model.Odd.all())
      .then(results => {
        console.log('result', results)
        assert(new BigNumber(results[0].vast).equals(results[1].vast))
      })
  })
})