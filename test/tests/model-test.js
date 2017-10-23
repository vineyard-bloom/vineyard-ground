"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
var assert = require("assert");
var schema_1 = require("../../source/schema");
var Sequelize = require('sequelize');
var source_1 = require("../../source");
var source_2 = require("../../source");
var source_3 = require("../../source");
var config = require('../config/config.json');
var mainWorld, dangerousTag, flyingTag;
describe('Sequelize Test', function () {
    this.timeout(5000);
    var client = new source_3.SequelizeClient(config.database);
    it('game', function () {
        return gameTest(client);
    });
    it('arbitrary', function () {
        return arbitraryTest(client);
    });
});
describe('Postgres Test', function () {
    this.timeout(5000);
    var client = new source_2.PostgresClient(config.database);
    it('game', function () {
        return gameTest(client);
    });
    it('arbitrary', function () {
        return arbitraryTest(client);
    });
});
function gameTest(client) {
    var schema = new schema_1.Schema(require('../schema/game.json'));
    var modeler = new source_1.DevModeler(schema, client);
    var model = modeler.collections;
    return modeler.regenerate()
        .then(function () { return model.Tag.create({
        name: "flying"
    })
        .then(function (tag) { return flyingTag = tag; })
        .then(function () { return model.World.create({}); })
        .then(function (world) { return mainWorld = world; })
        .then(function () { return model.Creature.create({
        name: "ogre",
        world: mainWorld,
        health: 5
    }); })
        .then(function (ogre) { return model.Tag.create({
        name: "dangerous"
    })
        .then(function (tag) { return dangerousTag = tag; })
        .then(function () { return model.Creature.update(ogre, {
        health: 10,
        tags: source_1.Add(dangerousTag)
    })
        .then(function (creature) {
        assert.equal(creature.health, 10);
        return model.Creature.first().expand('tags');
    })
        .then(function (creature) {
        assert(Array.isArray(creature.tags));
        assert.equal(1, creature.tags.length);
        assert.equal('dangerous', creature.tags[0].name);
    })
        .then(function () { return model.Creature.update(ogre, {
        tags: source_1.Remove(dangerousTag)
    }); }); }); }); })
        .then(function () { return model.Creature.first().expand('tags'); })
        .then(function (creature) {
        assert(Array.isArray(creature.tags));
        assert.equal(0, creature.tags.length);
    })
        .then(function () { return model.Creature.create({
        name: "hero",
        world: mainWorld,
        health: 4,
        tags: source_1.Add(flyingTag)
    }); })
        .then(function () { return model.World.first().expand('creatures'); })
        .then(function (world) {
        assert(Array.isArray(world.creatures));
        assert.equal(2, world.creatures.length);
    });
}
function arbitraryTest(client) {
    var schema = new schema_1.Schema(require('../schema/arbitrary.json'));
    var modeler = new source_1.DevModeler(schema, client);
    var model = modeler.collections;
    var BigNumber = require('bignumber.js');
    return modeler.regenerate()
        .then(function () { return model.Odd.create({
        strange: 10,
        unknown: "mist",
        vast: "1000000000000000000000000000021",
        sampleDate: new Date("June 15, 2016"),
        sampleDatetime: new Date("2017-10-23T18:24:05.026Z"),
        veryBig: new BigNumber("1023.1334"),
        data: {
            frogs: [
                { name: "Froggy" },
                { name: "Pac Frog" }
            ]
        }
    }); })
        .then(function () { return model.Odd.create({
        strange: 11,
        unknown: "mist2",
        vast: new BigNumber("1000000000000000000000000000021"),
        sampleDate: new Date("August 3, 2002"),
        sampleDatetime: new Date("2017-10-23T18:24:05.026Z"),
        veryBig: "819715.15157",
        data: {
            "nothing": null
        }
    }); })
        .then(function () { return model.Odd.all(); })
        .then(function (results) {
        console.log('result', results);
        assert(new BigNumber(results[0].vast).equals(results[1].vast));
        assert(results[0].sampleDate instanceof Date);
        assert.equal(results[0].data.frogs.length, 2);
        assert(results[0].sampleDatetime instanceof Date);
        assert.equal(results[0].sampleDatetime.toISOString(), "2017-10-23T18:24:05.026Z");
        assert(results[0].veryBig instanceof BigNumber);
        assert(results[1].veryBig instanceof BigNumber);
        assert(results[0].veryBig.equals("1023.1334"));
        assert(results[1].veryBig.equals("819715.15157"));
    });
}
//# sourceMappingURL=model-test.js.map