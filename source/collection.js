"use strict";
var query_1 = require('./query');
function prepare_seed(seed) {
    var new_seed = Object.assign({}, seed);
    for (var i in new_seed) {
        var value = new_seed[i];
        if (typeof value === 'object' && value.id) {
            new_seed[i] = value.id;
        }
    }
    return new_seed;
}
var Collection = (function () {
    function Collection(trellis, sequelize_model) {
        this.trellis = trellis;
        this.sequelize = sequelize_model;
    }
    Collection.prototype.create = function (seed) {
        var new_seed = prepare_seed(seed);
        return this.sequelize.create(new_seed)
            .then(function (result) { return result.dataValues; });
    };
    Collection.prototype.update = function (seed, changes) {
        var id = seed.id || seed;
        var new_seed = prepare_seed(changes || seed);
        return this.sequelize.update(changes, {
            where: {
                id: id
            }
        })
            .then(function (result) { return result.dataValues; });
    };
    Collection.prototype.all = function () {
        return new query_1.Query_Implementation(this.sequelize, this.trellis);
    };
    Collection.prototype.filter = function (options) {
        return this.all().filter(options);
    };
    Collection.prototype.get_sequelize = function () {
        return this.sequelize;
    };
    Collection.prototype.get = function (identity) {
        return this.filter({ id: identity }).first();
    };
    return Collection;
}());
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map