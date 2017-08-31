import {DevModeler} from "../../source/modeler";
require('source-map-support').install()
import * as assert from 'assert'
import {Schema} from 'vineyard-schema'
import * as Sequelize from 'sequelize'
import {Modeler, Add, Remove} from '../../source'

const config = require('../config/config.json')

describe('Game', function () {
  this.timeout(4000)
  it('sync_database', function () {
    const db = new Sequelize(config.database)
    const schema = new Schema(require('../schema/game.json'))
    const modeler = new DevModeler(db, schema)
    const model: any = modeler.collections
    return modeler.regenerate()
      .then(() => model.Tag.create({
          name: "flying"
        })
          .then(() => model.World.create({}))
          .then(world => model.Creature.create({
            name: "ogre",
            world: world,
            health: 5
          }))
          .then(ogre => model.Tag.create({
              name: "dangerous"
            })
              .then(tag => model.Creature.update(ogre, {
                  health: 10,
                  tags: Add(tag)
                })
                  .then(creature => {
                    assert.equal(creature.health,10)
                    return model.Creature.first().expand('tags')
                  })
                  .then(creature => {
                    assert(Array.isArray(creature.tags))
                    assert.equal(1, creature.tags.length)
                    assert.equal('dangerous', creature.tags[0].name)
                  })
                  .then(() => model.Creature.update(ogre, {
                      tags: Remove(tag)
                    })
                  )
                  .then(() => model.Creature.first().expand('tags'))
                  .then(creature => {
                    assert(Array.isArray(creature.tags))
                    assert.equal(0, creature.tags.length)
                  })
              )
          )
      )
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