"use strict";
var query_1 = require('./query');
var update_1 = require('./update');
var Collection = (function () {
    function Collection(trellis, sequelize_model) {
        this.trellis = trellis;
        this.sequelize = sequelize_model;
        this.primary_key = this.trellis.primary_key.name;
        trellis.collection = this;
    }
    Collection.prototype.create = function (seed) {
        return update_1.create(seed, this.trellis, this.sequelize);
    };
    Collection.prototype.create_or_update = function (seed) {
        return update_1.create_or_update(seed, this.trellis, this.sequelize);
    };
    Collection.prototype.update = function (seed, changes) {
        return update_1.update(seed, this.trellis, this.sequelize, changes);
    };
    Collection.prototype.all = function () {
        return new query_1.Query_Implementation(this.sequelize, this.trellis);
    };
    Collection.prototype.filter = function (options) {
        return this.all().filter(options);
    };
    Collection.prototype.first = function () {
        return this.all().first();
    };
    Collection.prototype.first_or_null = function () {
        return this.all().first_or_null();
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