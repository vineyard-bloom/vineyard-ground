"use strict";
exports.__esModule = true;
var query_1 = require("./query");
var update_1 = require("./update");
var Collection = /** @class */ (function () {
    function Collection(trellis, table, client) {
        this.trellis = trellis;
        this.table = table;
        this.client = client;
        trellis.collection = this;
        // Monkey patch for soft backwards compatibility
        var self = this;
        self.firstOrNull = this.first;
        self.first_or_null = this.first;
    }
    Collection.prototype.getTrellis = function () {
        return this.trellis;
    };
    Collection.prototype.getTableClient = function () {
        return this.table;
    };
    Collection.prototype.create = function (seed) {
        return update_1.create(seed, this.trellis, this.table);
    };
    Collection.prototype.create_or_update = function (seed) {
        return update_1.create_or_update(seed, this.trellis, this.table);
    };
    Collection.prototype.update = function (seed, changes) {
        return update_1.update(seed, this.trellis, this.table, changes);
    };
    Collection.prototype.remove = function (seed) {
        return this.table.remove({
            where: (_a = {},
                _a[this.trellis.primary_keys[0].name] = this.trellis.get_identity(seed),
                _a)
        });
        var _a;
    };
    Collection.prototype.all = function () {
        return new query_1.Query_Implementation(this.table, this.client, this.trellis);
    };
    Collection.prototype.filter = function (options) {
        return this.all().filter(options);
    };
    Collection.prototype.first = function (options) {
        return this.all().first(options);
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
