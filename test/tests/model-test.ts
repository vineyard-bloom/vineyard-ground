
require('source-map-support').install()
import * as assert from 'assert'
import {Schema} from '../../source/schema'
import {DevModeler, Add, Remove, DatabaseClient, PostgresClient, SequelizeClient} from '../../source'

const config = require('../config/config.json')
let mainWorld: any,
  dangerousTag: any,
  flyingTag: any

describe('Sequelize Test', function () {
  this.timeout(5000)
  const client = new SequelizeClient(config.database)
  it('game', function () {
    return gameTest(client)
  })

  it('arbitrary', function () {
    return arbitraryTest(client)
  })
})

describe('Postgres Test', function () {
  this.timeout(5000)
  const client = new PostgresClient(config.database)
  it('game', function () {
    return gameTest(client)
  })

  it('arbitrary', function () {
    return arbitraryTest(client)
  })
})

function gameTest(client: DatabaseClient) {
  const schema = new Schema(require('../schema/game.json'))
  const modeler = new DevModeler(schema, client)
  const model: any = modeler.collections

  return modeler.regenerate()
    .then(() => model.Tag.create({
        name: "flying"
      })
        .then((tag: any) => flyingTag = tag)
        .then(() => model.World.create({}))
        .then((world: any) => mainWorld = world)
        .then(() => model.Creature.create({
          name: "ogre",
          world: mainWorld,
          health: 5
        }))
        .then((ogre: any) => model.Tag.create({
            name: "dangerous"
          })
            .then((tag: any) => dangerousTag = tag)
            .then(() => model.Creature.update(ogre, {
                health: 10,
                tags: Add(dangerousTag)
              })
                .then((creature: any) => {
                  assert.equal(creature.health, 10)
                  return model.Creature.first().expand('tags')
                })
                .then((creature: any) => {
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
    .then((creature: any) => {
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
    .then((world: any) => {
      assert(Array.isArray(world.creatures))
      assert.equal(2, world.creatures.length)
    })
}

function arbitraryTest(client: DatabaseClient) {
  const schema = new Schema(require('../schema/arbitrary.json'))
  const modeler = new DevModeler(schema, client)
  const model: any = modeler.collections

  const BigNumber = require('bignumber.js')
  return modeler.regenerate()
    .then(() => model.OddRecord.create({
        strange: 10,
        unknown: "mist",
        vast: "1000000000000000000000000000021",
        sampleDate: new Date("June 15, 2016"),
        sampleDatetime: new Date("2017-10-23T18:24:05.026Z"),
        veryBig: new BigNumber("1023.1334"),
        data: {
          frogs: [
            {name: "Froggy"},
            {name: "Pac Frog"}
          ]
        }
      })
    )
    .then(() => model.OddRecord.create({
        strange: 11,
        unknown: "mist2",
        vast: new BigNumber("1000000000000000000000000000021"),
        sampleDate: new Date("August 3, 2002"),
        sampleDatetime: new Date("2017-10-23T18:24:05.026Z"),
        veryBig: "819715.15157",
        data: {
          "nothing": null
        }
      })
    )
    .then(() => model.OddRecord.all())
    .then((results: any) => {
      console.log('result', results)
      assert(new BigNumber(results[0].vast).equals(results[1].vast))
      assert(results[0].sampleDate instanceof Date)
      assert.equal(results[0].data.frogs.length, 2)
      assert(results[0].sampleDatetime instanceof Date)
      assert.equal(results[0].sampleDatetime.toISOString(), "2017-10-23T18:24:05.026Z")
      assert(results[0].veryBig instanceof BigNumber)
      assert(results[1].veryBig instanceof BigNumber)
      assert(results[0].veryBig.equals("1023.1334"))
      assert(results[1].veryBig.equals("819715.15157"))
    })
}
