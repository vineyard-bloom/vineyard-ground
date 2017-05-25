"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var modeler_1 = require("../../source/modeler");
require('source-map-support').install();
var assert = require("assert");
var vineyard_schema_1 = require("vineyard-schema");
var Sequelize = require("sequelize");
var source_1 = require("../../source");
var config = require('../config/config.json');
describe('Game', function () {
    this.timeout(4000);
    it('sync_database', function () {
        var db = new Sequelize(config.database);
        var schema = new vineyard_schema_1.Schema(require('../schema/game.json'));
        var modeler = new modeler_1.DevModeler(db, schema);
        var model = modeler.collections;
        return modeler.regenerate()
            .then(function () { return model.Tag.create({
            name: "flying"
        })
            .then(function () { return model.World.create({}); })
            .then(function (world) { return model.Creature.create({
            name: "ogre",
            world: world,
            health: 5
        }); })
            .then(function (ogre) { return model.Tag.create({
            name: "dangerous"
        })
            .then(function (tag) { return model.Creature.update(ogre, {
            health: 10,
            tags: source_1.Add(tag)
        })
            .then(function () { return model.Creature.first().expand('tags'); })
            .then(function (creature) {
            assert(Array.isArray(creature.tags));
            assert.equal(1, creature.tags.length);
            assert.equal('dangerous', creature.tags[0].name);
        })
            .then(function () { return model.Creature.update(ogre, {
            tags: source_1.Remove(tag)
        }); })
            .then(function () { return model.Creature.first().expand('tags'); })
            .then(function (creature) {
            assert(Array.isArray(creature.tags));
            assert.equal(0, creature.tags.length);
        }); }); }); });
    });
});
describe('Arbitrary', function () {
    this.timeout(4000);
    it('sync_database', function () {
        var db = new Sequelize(config.database);
        var schema = new vineyard_schema_1.Schema(require('../schema/arbitrary.json'));
        var modeler = new modeler_1.DevModeler(db, schema);
        var model = modeler.collections;
        return modeler.regenerate()
            .then(function () { return model.Odd.create({
            strange: 10,
            unknown: "mist"
        }); });
    });
});
//# sourceMappingURL=model-test.js.map