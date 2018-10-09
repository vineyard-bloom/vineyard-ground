"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scheming_1 = require("../../src/scheming");
require('source-map-support').install();
const utility_1 = require("../../src/utility");
const chai_1 = require("chai");
const src_1 = require("../../src");
const bignumber_js_1 = require("bignumber.js");
const config = require('../config/config.json');
let mainWorld, dangerousTag, flyingTag;
const contexts = [
    {
        name: 'Sequelize',
        client: new src_1.SequelizeClient(config.database),
    }
];
// createSuite('Sequelize', new SequelizeClient(config.database))
// createSuite('Postgres', new PostgresClient(config.database))
// for (let i = 0; i < contexts.length; ++i) {
const { name, client } = contexts[0];
describe('Sequelize Test', function () {
    this.timeout(5000);
    describe('Game Test', function () {
        let model;
        before(async function () {
            model = await initializeModel(client, 'game');
        });
        it('game', async function () {
            flyingTag = await model.Tag.create({
                name: "flying"
            });
            const heroicTag = await model.Tag.create({
                name: "heroic"
            });
            mainWorld = await model.World.create({});
            const ogre = await model.Creature.create({
                name: "ogre",
                world: mainWorld,
                health: 5
            });
            dangerousTag = await model.Tag.create({
                name: "dangerous"
            });
            let creature = await model.Creature.update(ogre, {
                health: 10,
                tags: src_1.Add(dangerousTag)
            });
            chai_1.assert.equal(creature.health, 10);
            creature = await model.Creature.first().expand('tags');
            chai_1.assert(Array.isArray(creature.tags));
            chai_1.assert.equal(1, creature.tags.length);
            chai_1.assert.equal('dangerous', creature.tags[0].name);
            await model.Creature.update(ogre, {
                tags: src_1.Remove(dangerousTag)
            });
            creature = await model.Creature.first().expand('tags');
            chai_1.assert(Array.isArray(creature.tags));
            chai_1.assert.equal(0, creature.tags.length);
            await model.Creature.create({
                name: "hero",
                world: mainWorld,
                health: 4,
                tags: [src_1.Add(flyingTag), heroicTag]
            });
            const world = await model.World.first().expand('creatures');
            chai_1.assert(Array.isArray(world.creatures));
            chai_1.assert.equal(2, world.creatures.length);
            const hero = await model.Creature.first({ name: "hero" }).expand('tags');
            chai_1.assert.equal(hero.tags.length, 2);
            await model.Creature.remove(hero);
            const hero2 = await model.Creature.first({ name: "hero" });
            chai_1.assert.isNull(hero2);
            const rawHero = await model.ground.querySingle(`SELECT * FROM creatures WHERE name = 'hero'`);
            chai_1.assert.equal(rawHero.name, 'hero');
            chai_1.assert(rawHero.deleted instanceof Date);
        });
    });
    describe('Arbitrary Test', function () {
        let model;
        before(async function () {
            model = await initializeModel(client, 'arbitrary');
        });
        it('arbitrary general', async function () {
            const original = await model.OddRecord.create({
                strange: 10,
                unknown: "mist",
                vast: "1000000000000000000000000000021",
                sampleDate: new Date("June 15, 2016"),
                sampleDatetime: new Date("2017-10-23T18:24:05.026Z"),
                veryBig: new bignumber_js_1.BigNumber("1023.1334"),
                nullableDatetime: new Date("2017-10-23T18:24:05.026Z"),
                data: {
                    frogs: [
                        { name: "Froggy" },
                        { name: "Pac Frog" }
                    ]
                }
            });
            await model.OddRecord.create({
                strange: 11,
                unknown: "mist2",
                vast: new bignumber_js_1.BigNumber("1000000000000000000000000000021"),
                sampleDate: new Date("August 3, 2002"),
                sampleDatetime: new Date("2017-10-23T18:24:05.026Z"),
                veryBig: "819715.15157",
                data: {
                    "nothing": null
                }
            });
            chai_1.assert(original.vast.isBigNumber);
            const results = await model.OddRecord.all();
            console.log('result', results);
            chai_1.assert(new bignumber_js_1.BigNumber(results[0].vast).equals(results[1].vast));
            chai_1.assert(results[0].sampleDate instanceof Date);
            chai_1.assert.equal(results[0].data.frogs.length, 2);
            chai_1.assert(results[0].sampleDatetime instanceof Date);
            chai_1.assert.equal(results[0].sampleDatetime.toISOString(), "2017-10-23T18:24:05.026Z");
            chai_1.assert(results[0].veryBig instanceof bignumber_js_1.BigNumber);
            chai_1.assert(results[1].veryBig instanceof bignumber_js_1.BigNumber);
            chai_1.assert(results[0].veryBig.equals("1023.1334"));
            chai_1.assert(results[1].veryBig.equals("819715.15157"));
            chai_1.assert.equal(results[0].nullableDatetime.toString(), new Date("2017-10-23T18:24:05.026Z").toString());
            chai_1.assert.isNull(results[1].nullableDatetime);
            const records = await model.ground.query(`SELECT * FROM odd_records`);
            chai_1.expect(records).lengthOf(2);
            await model.OddRecord.update({
                strange: 11,
                unknown: "mist2"
            }, {
                data: {
                    "something": "wow"
                }
            });
            const record = await model.ground.querySingle(`SELECT * FROM odd_records WHERE strange = 11`);
            chai_1.assert.deepEqual(record.data, {
                "something": "wow"
            });
        });
        it('Supports custom table names', async function () {
            await model.RenamedRecord.create({
                unknown: 16,
            });
            const record = await model.ground.querySingle(`SELECT * FROM mysteries`);
            chai_1.expect(record.unknown).equal(16);
        });
        it('Creates trellis indexes', async function () {
            // Example of manual index creation
            // await model.ground.query(`CREATE INDEX odd_records_vast ON public.odd_records (vast);`)
            const record = await model.ground.query(`SELECT * FROM pg_indexes WHERE tablename = 'odd_records';`);
            const actual = [record[0].indexdef, record[1].indexdef];
            const expected = [
                'CREATE UNIQUE INDEX odd_records_pkey ON public.odd_records USING btree (strange, unknown)',
                'CREATE INDEX odd_records_vast ON public.odd_records USING btree (vast)',
            ];
            chai_1.assert.deepEqual(expected, actual);
        });
    });
    describe('Indexless Test', function () {
        let model;
        before(async function () {
            model = await initializeModel(client, 'indexless');
        });
        it('indexless', async function () {
            chai_1.assert(true);
        });
    });
});
describe('Simple unit tests', function () {
    it('camelCase to snake_case', async function () {
        chai_1.assert.equal(utility_1.to_lower_snake_case('first'), 'first');
        chai_1.assert.equal(utility_1.to_lower_snake_case('firstSecond'), 'first_second');
        chai_1.assert.equal(utility_1.to_lower_snake_case('firstIP'), 'first_ip');
        chai_1.assert.equal(utility_1.to_lower_snake_case('FirstSecond'), 'first_second');
    });
});
// }
async function initializeModel(client, schemaName) {
    const schema = new scheming_1.SchemaClass(require('../schema/' + schemaName + '.json'));
    const modeler = new src_1.DevModeler(schema, client);
    const model = modeler.collections;
    model.ground = modeler;
    await modeler.regenerate();
    return model;
}
//# sourceMappingURL=model-test.js.map