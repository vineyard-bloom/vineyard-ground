"use strict";
require('source-map-support').install();
var vineyard_schema_1 = require('vineyard-schema');
var Sequelize = require('sequelize');
var source_1 = require('../../source');
var config = require('../config/config.json');
var game_schema = require('../schema/game.json');
var db = new Sequelize(config.database);
var schema = new vineyard_schema_1.Schema(game_schema);
var model = new source_1.Model(db, schema);
model.sync_database({ force: true })
    .then(function () { return model.collections.World.create({}); })
    .then(function (world) { return model.collections.Creature.create({
    name: "ogre",
    world: world,
    health: 5
}); })
    .then(function (ogre) { return model.collections.Creature.update({
    id: ogre.id,
    health: 10
}); });
//# sourceMappingURL=simple.js.map