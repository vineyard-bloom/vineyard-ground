"use strict";
var query_1 = require('./query');
function prepare_seed(seed, trellis) {
    var new_seed = {};
    for (var i in seed) {
        var property = trellis.properties[i];
        if (property) {
            var value = seed[i];
            if (property.is_reference()) {
                var reference = property;
                var other_primary_key = reference.get_other_trellis().primary_key.name;
                if (typeof value === 'object') {
                    if (value[other_primary_key])
                        new_seed[i] = value[other_primary_key];
                    else
                        throw new Error(trellis.name + "." + i + 'cannot be an object');
                }
                else {
                    new_seed[i] = value;
                }
            }
            else {
                if (typeof value === 'object' && property.type.name != 'json' && property.type.name != 'jsonb')
                    throw new Error(trellis.name + "." + i + 'cannot be an object');
                new_seed[i] = value;
            }
        }
        else {
            throw new Error("Invalid property: " + trellis.name + "." + i + '.');
        }
    }
    return new_seed;
}
var Collection = (function () {
    function Collection(trellis, sequelize_model) {
        this.trellis = trellis;
        this.sequelize = sequelize_model;
        this.primary_key = this.trellis.primary_key.name;
        trellis.collection = this;
    }
    Collection.prototype.create = function (seed) {
        var new_seed = prepare_seed(seed, this.trellis);
        return this.sequelize.create(new_seed)
            .then(function (result) { return result.dataValues; });
    };
    Collection.prototype.update = function (seed, changes) {
        var identity = seed[this.primary_key] || seed;
        var new_seed = prepare_seed(changes || seed, this.trellis);
        var filter = {};
        filter[this.primary_key] = identity;
        return this.sequelize.update(new_seed, {
            where: filter
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
        if (!identity)
            throw new Error("Cannot get empty identity of type " + this.trellis.name + '.');
        var filter = {};
        filter[this.primary_key] = identity;
        return this.filter(filter).first();
    };
    return Collection;
}());
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map