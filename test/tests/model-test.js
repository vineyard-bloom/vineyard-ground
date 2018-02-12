"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("../../source/utility");
require('source-map-support').install();
const chai_1 = require("chai");
const schema_1 = require("../../source/schema");
const source_1 = require("../../source");
const bignumber_js_1 = require("bignumber.js");
const config = require('../config/config.json');
let mainWorld, dangerousTag, flyingTag;
const contexts = [
    {
        name: 'Sequelize',
        client: new source_1.SequelizeClient(config.database),
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
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                model = yield initializeModel(client, 'game');
            });
        });
        it('game', function () {
            return __awaiter(this, void 0, void 0, function* () {
                flyingTag = yield model.Tag.create({
                    name: "flying"
                });
                const heroicTag = yield model.Tag.create({
                    name: "heroic"
                });
                mainWorld = yield model.World.create({});
                const ogre = yield model.Creature.create({
                    name: "ogre",
                    world: mainWorld,
                    health: 5
                });
                dangerousTag = yield model.Tag.create({
                    name: "dangerous"
                });
                let creature = yield model.Creature.update(ogre, {
                    health: 10,
                    tags: source_1.Add(dangerousTag)
                });
                chai_1.assert.equal(creature.health, 10);
                creature = yield model.Creature.first().expand('tags');
                chai_1.assert(Array.isArray(creature.tags));
                chai_1.assert.equal(1, creature.tags.length);
                chai_1.assert.equal('dangerous', creature.tags[0].name);
                yield model.Creature.update(ogre, {
                    tags: source_1.Remove(dangerousTag)
                });
                creature = yield model.Creature.first().expand('tags');
                chai_1.assert(Array.isArray(creature.tags));
                chai_1.assert.equal(0, creature.tags.length);
                yield model.Creature.create({
                    name: "hero",
                    world: mainWorld,
                    health: 4,
                    tags: [source_1.Add(flyingTag), heroicTag]
                });
                const world = yield model.World.first().expand('creatures');
                chai_1.assert(Array.isArray(world.creatures));
                chai_1.assert.equal(2, world.creatures.length);
                const hero = yield model.Creature.first({ name: "hero" }).expand('tags');
                chai_1.assert.equal(hero.tags.length, 2);
                yield model.Creature.remove(hero);
                const hero2 = yield model.Creature.first({ name: "hero" });
                chai_1.assert.isNull(hero2);
                const rawHero = yield model.ground.querySingle(`SELECT * FROM creatures WHERE name = 'hero'`);
                chai_1.assert.equal(rawHero.name, 'hero');
                chai_1.assert(rawHero.deleted instanceof Date);
            });
        });
    });
    describe('Arbitrary Test', function () {
        let model;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                model = yield initializeModel(client, 'arbitrary');
            });
        });
        it('arbitrary general', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const original = yield model.OddRecord.create({
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
                yield model.OddRecord.create({
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
                const results = yield model.OddRecord.all();
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
                const records = yield model.ground.query(`SELECT * FROM odd_records`);
                chai_1.expect(records).lengthOf(2);
                yield model.OddRecord.update({
                    strange: 11,
                    unknown: "mist2"
                }, {
                    data: {
                        "something": "wow"
                    }
                });
                const record = yield model.ground.querySingle(`SELECT * FROM odd_records WHERE strange = 11`);
                chai_1.assert.deepEqual(record.data, {
                    "something": "wow"
                });
            });
        });
        it('Supports custom table names', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield model.RenamedRecord.create({
                    unknown: 16,
                });
                const record = yield model.ground.querySingle(`SELECT * FROM mysteries`);
                chai_1.expect(record.unknown).equal(16);
            });
        });
    });
});
describe('Simple unit tests', function () {
    it('camelCase to snake_case', function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(utility_1.to_lower_snake_case('first'), 'first');
            chai_1.assert.equal(utility_1.to_lower_snake_case('firstSecond'), 'first_second');
            chai_1.assert.equal(utility_1.to_lower_snake_case('firstIP'), 'first_ip');
            chai_1.assert.equal(utility_1.to_lower_snake_case('FirstSecond'), 'first_second');
        });
    });
});
// }
function initializeModel(client, schemaName) {
    return __awaiter(this, void 0, void 0, function* () {
        const schema = new schema_1.Schema(require('../schema/' + schemaName + '.json'));
        const modeler = new source_1.DevModeler(schema, client);
        const model = modeler.collections;
        model.ground = modeler;
        yield modeler.regenerate();
        return model;
    });
}
//# sourceMappingURL=model-test.js.map