"use strict";
require('source-map-support').install();
var vineyard_schema_1 = require('vineyard-schema');
var Sequelize = require('sequelize');
var source_1 = require('../../source');
var config = require('../config/config.json');
var game_schema = require('../schema/game.json');
describe('Model Test', function () {
    this.timeout(4000);
    it('sync_database', function () {
        var db = new Sequelize(config.database);
        var schema = new vineyard_schema_1.Schema(game_schema);
        var modeler = new source_1.Modeler(db, schema);
        var model = modeler.collections;
        return modeler.regenerate()
            .then(function () { return model.World.create({}); })
            .then(function (world) { return model.Creature.create({
            name: "ogre",
            world: world,
            health: 5
        }); })
            .then(function (ogre) { return model.Creature.update({
            id: ogre.id,
            health: 10
        }); });
    });
});
//# sourceMappingURL=model-test.js.map