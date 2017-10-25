require('source-map-support').install()
import {assert, expect} from 'chai'
import {Schema} from '../../source/schema'
import {DevModeler, Add, Remove, DatabaseClient, PostgresClient, SequelizeClient} from '../../source'
import {BigNumber} from 'bignumber.js'

const config = require('../config/config.json')
let mainWorld: any,
  dangerousTag: any,
  flyingTag: any

const contexts = [
  {
    name: 'Sequelize',
    client: new SequelizeClient(config.database),
  }
]

// createSuite('Sequelize', new SequelizeClient(config.database))
// createSuite('Postgres', new PostgresClient(config.database))

// for (let i = 0; i < contexts.length; ++i) {
const {name, client} = contexts[0]

describe('Sequelize Test', function () {
  this.timeout(5000)
  describe('Game Test', function () {
    let model: any

    before(async function () {
      model = await initializeModel(client, 'game')
    })

    it('game', async function () {

      flyingTag = await model.Tag.create({
        name: "flying"
      })

      mainWorld = await model.World.create({})

      const ogre = await model.Creature.create({
        name: "ogre",
        world: mainWorld,
        health: 5
      })

      dangerousTag = await model.Tag.create({
        name: "dangerous"
      })

      let creature = await model.Creature.update(ogre, {
        health: 10,
        tags: Add(dangerousTag)
      })

      assert.equal(creature.health, 10)
      creature = await model.Creature.first().expand('tags')
      assert(Array.isArray(creature.tags))
      assert.equal(1, creature.tags.length)
      assert.equal('dangerous', creature.tags[0].name)

      await model.Creature.update(ogre, {
        tags: Remove(dangerousTag)
      })

      creature = await model.Creature.first().expand('tags')
      assert(Array.isArray(creature.tags))
      assert.equal(0, creature.tags.length)

      await model.Creature.create({
        name: "hero",
        world: mainWorld,
        health: 4,
        tags: Add(flyingTag)
      })

      const world = await model.World.first().expand('creatures')
      assert(Array.isArray(world.creatures))
      assert.equal(2, world.creatures.length)
    })
  })

  describe('Arbitrary Test', function () {
    let model: any

    before(async function () {
      model = await initializeModel(client, 'arbitrary')
    })

    it('arbitrary general', async function () {
      await model.OddRecord.create({
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

      await model.OddRecord.create({
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

      const results = await model.OddRecord.all()
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

      const records = await model.ground.query(`SELECT * FROM odd_records`)
      expect(records).lengthOf(2)
    })

    it('Supports custom table names', async function () {
      await model.RenamedRecord.create({
        unknown: 16,
      })

      const record = await model.ground.querySingle(`SELECT * FROM mysteries`)
      expect(record.unknown).equal(16)
    })
  })
})

// }

async function initializeModel(client: DatabaseClient, schemaName: string) {
  const schema = new Schema(require('../schema/' + schemaName + '.json'))
  const modeler = new DevModeler(schema, client)
  const model: any = modeler.collections
  model.ground = modeler

  await modeler.regenerate()
  return model
}
