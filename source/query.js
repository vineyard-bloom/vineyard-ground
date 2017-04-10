"use strict";
var sequelize = require('sequelize');
var Reduce_Mode;
(function (Reduce_Mode) {
    Reduce_Mode[Reduce_Mode["none"] = 0] = "none";
    Reduce_Mode[Reduce_Mode["first"] = 1] = "first";
    // first_or_null,
    Reduce_Mode[Reduce_Mode["single_value"] = 2] = "single_value";
})(Reduce_Mode || (Reduce_Mode = {}));
var Query_Implementation = (function () {
    function Query_Implementation(sequelize, trellis) {
        this.options = {};
        this.reduce_mode = Reduce_Mode.none;
        this.expansions = {};
        this.sequelize = sequelize;
        this.trellis = trellis;
    }
    Query_Implementation.prototype.set_reduce_mode = function (value) {
        if (this.reduce_mode == value)
            return;
        if (this.reduce_mode != Reduce_Mode.none)
            throw new Error("Reduce mode already set.");
        this.reduce_mode = value;
    };
    Query_Implementation.prototype.handle_expansions = function (results) {
        var _this = this;
        var promises = Promise.all(results.map(function (result) { return Promise.all(_this.get_expansions()
            .map(function (path) { return _this.trellis.collection.get(result.dataValues[path])
            .then(function (child) { return result.dataValues[path] = child; }); })); }));
        return Promise.all(promises)
            .then(function () { return results; }); // Not needed but a nice touch.
    };
    Query_Implementation.prototype.process_result = function (result) {
        if (this.reduce_mode == Reduce_Mode.first) {
            if (result.length == 0)
                throw Error("Query.first called on empty result set.");
            return result[0].dataValues;
        }
        else if (this.reduce_mode == Reduce_Mode.single_value) {
            return result[0].dataValues._value;
        }
        return result.map(function (item) { return item.dataValues; });
    };
    Query_Implementation.prototype.process_result_with_expansions = function (result) {
        var _this = this;
        return this.handle_expansions(result)
            .then(function (result) { return _this.process_result(result); });
    };
    Query_Implementation.prototype.get_expansions = function () {
        return Object.keys(this.expansions);
    };
    Query_Implementation.prototype.has_expansions = function () {
        return this.get_expansions().length > 0;
    };
    Query_Implementation.prototype.exec = function () {
        var _this = this;
        console.log(this.options);
        return this.sequelize.findAll(this.options)
            .then(function (result) { return _this.has_expansions()
            ? _this.process_result_with_expansions(result)
            : _this.process_result(result); });
    };
    Query_Implementation.prototype.then = function (callback) {
        return this.exec()
            .then(callback);
    };
    Query_Implementation.prototype.filter = function (options) {
        for (var i in options) {
            var option = options[i];
            if (option && option[this.trellis.primary_key.name]) {
                options[i] = option[this.trellis.primary_key.name];
            }
        }
        options.where = options;
        return this;
    };
    Query_Implementation.prototype.join = function (collection) {
        this.options.include = this.options.include || [];
        this.options.include.push(collection.get_sequelize());
        return this;
    };
    Query_Implementation.prototype.select = function (options) {
        if (options.length == 1) {
            var entry = options[0];
            options = Array.isArray(entry)
                ? [[entry[0], '_value']]
                : [[entry, '_value']];
            this.set_reduce_mode(Reduce_Mode.single_value);
        }
        this.options.attributes = options;
        return this;
    };
    Query_Implementation.prototype.first = function () {
        this.set_reduce_mode(Reduce_Mode.first);
        return this;
    };
    Query_Implementation.prototype.expand = function (path) {
        if (!this.trellis.properties[path])
            throw new Error("No such property: " + this.trellis.name + '.' + path + '.');
        this.expansions[path] = null;
        return this;
    };
    return Query_Implementation;
}());
exports.Query_Implementation = Query_Implementation;
function Path(path) {
    return sequelize.col(path);
}
exports.Path = Path;
function Sum(path) {
    return sequelize.fn('SUM', sequelize.col(path));
}
exports.Sum = Sum;
function Count(path) {
    return sequelize.fn('COUNT', sequelize.col(path));
}
exports.Count = Count;
//# sourceMappingURL=query.js.map