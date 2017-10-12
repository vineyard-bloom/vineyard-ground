"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var query_1 = require("./query");
var update_1 = require("./update");
var Collection = (function () {
    function Collection(trellis, sequelize_model) {
        this.trellis = trellis;
        this.sequelize = sequelize_model;
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
    Collection.prototype.remove = function (seed) {
        return this.sequelize.destroy({
            where: (_a = {},
                _a[this.trellis.primary_keys[0].name] = this.trellis.get_identity(seed),
                _a)
        });
        var _a;
    };
    Collection.prototype.all = function () {
        return new query_1.Query_Implementation(this.sequelize, this.trellis);
    };
    Collection.prototype.filter = function (options) {
        return this.all().filter(options);
    };
    Collection.prototype.first = function (options) {
        return this.all().first(options);
    };
    Collection.prototype.first_or_null = function (options) {
        return this.all().first_or_null(options);
    };
    Collection.prototype.firstOrNull = function (options) {
        return this.all().first_or_null(options);
    };
    Collection.prototype.get_sequelize = function () {
        return this.sequelize;
    };
    Collection.prototype.get = function (identity) {
        identity = this.trellis.get_identity(identity);
        var filter = {};
        filter[this.trellis.primary_keys[0].name] = identity;
        return this.filter(filter).first();
    };
    return Collection;
}());
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map