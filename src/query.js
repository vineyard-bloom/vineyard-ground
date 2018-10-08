"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize = require('sequelize');
var utility_1 = require("./utility");
var query_generator_1 = require("./sql/query-generator");
var BigNumber = require('bignumber.js');
var Reduce_Mode;
(function (Reduce_Mode) {
    Reduce_Mode[Reduce_Mode["none"] = 0] = "none";
    Reduce_Mode[Reduce_Mode["first"] = 1] = "first";
    Reduce_Mode[Reduce_Mode["single_value"] = 2] = "single_value";
})(Reduce_Mode || (Reduce_Mode = {}));
function getData(row) {
    return row.dataValues || row;
}
var Query_Implementation = /** @class */ (function () {
    function Query_Implementation(tables, table, client, trellis) {
        this.options = {};
        this.reduce_mode = Reduce_Mode.none;
        this.expansions = {};
        this.allow_null = true;
        this.tables = tables;
        this.table = table;
        this.trellis = trellis;
        this.client = client;
        // Monkey patch for soft backwards compatibility
        var self = this;
        self.firstOrNull = this.first;
        self.first_or_null = this.first;
    }
    Query_Implementation.prototype.set_reduce_mode = function (value) {
        if (this.reduce_mode == value)
            return;
        if (this.reduce_mode != Reduce_Mode.none && value != Reduce_Mode.single_value) {
            throw new Error('Reduce mode already set.');
        }
        this.reduce_mode = value;
    };
    Query_Implementation.prototype.get_other_collection = function (path) {
        var reference = this.trellis.properties[path];
        return reference.get_other_trellis().collection;
    };
    Query_Implementation.prototype.expand_crossTable = function (tables, reference, identity) {
        var where = {};
        where[utility_1.to_lower(reference.trellis.name)] = identity;
        return tables[reference.otherProperty.trellis.table.name].findAll({
            include: {
                model: tables[reference.trellis.table.name],
                through: { where: where },
                as: reference.otherProperty.name,
                required: true
            }
        })
            .then(function (result) { return result.map(function (r) { return utility_1.processFields(getData(r), reference.otherProperty.trellis); }); });
    };
    Query_Implementation.prototype.perform_expansion = function (tables, path, data) {
        var _a;
        var property = this.trellis.properties[path];
        if (property.is_list()) {
            return property.otherProperty.is_list()
                ? this.expand_crossTable(tables, property, this.trellis.get_identity(data))
                : this.get_other_collection(path).filter((_a = {}, _a[property.otherProperty.name] = data, _a));
        }
        else {
            return this.get_other_collection(path).get(data[path]);
        }
    };
    Query_Implementation.prototype.handle_expansions = function (tables, results) {
        var _this = this;
        var promises = results.map(function (result) { return Promise.all(_this.get_expansions()
            .map(function (path) { return _this.perform_expansion(tables, path, getData(result))
            .then(function (child) { return getData(result)[path] = child; }); })); });
        return Promise.all(promises)
            .then(function () { return results; }); // Not needed but a nice touch.
    };
    Query_Implementation.prototype.process_result = function (result) {
        var _this = this;
        if (this.reduce_mode == Reduce_Mode.first) {
            if (result.length == 0) {
                if (this.allow_null)
                    return null;
                throw Error('Query.first called on empty result set.');
            }
            return utility_1.processFields(getData(result[0]), this.trellis);
        }
        else if (this.reduce_mode == Reduce_Mode.single_value) {
            if (result.length == 0) {
                if (this.allow_null)
                    return null;
                throw Error('Query.select single value called on empty result set.');
            }
            return getData(result[0])._value;
        }
        return result.map(function (item) { return utility_1.processFields(getData(item), _this.trellis); });
    };
    Query_Implementation.prototype.process_result_with_expansions = function (tables, result) {
        var _this = this;
        return this.handle_expansions(tables, result)
            .then(function (result) { return _this.process_result(result); });
    };
    Query_Implementation.prototype.get_expansions = function () {
        return Object.keys(this.expansions);
    };
    Query_Implementation.prototype.has_expansions = function () {
        return this.get_expansions().length > 0;
    };
    Query_Implementation.prototype.queryWithQueryGenerator = function () {
        var legacyClient = this.client.getLegacyClient();
        if (legacyClient)
            return legacyClient.findAll(this.table, this.options);
        var generator = new query_generator_1.QueryGenerator(this.trellis);
        this.bundle = generator.generate(this.options);
        return this.client.query(this.bundle.sql, this.bundle.args)
            .then(function (result) { return result.rows; });
    };
    Query_Implementation.prototype.exec = function () {
        var _this = this;
        return this.queryWithQueryGenerator()
            .then(function (result) { return _this.has_expansions()
            ? _this.process_result_with_expansions(_this.tables, result)
            : _this.process_result(result); })
            .catch(function (error) {
            if (_this.bundle)
                console.error(_this.bundle);
            else
                console.error(_this.options);
            throw error;
        });
    };
    Query_Implementation.prototype.expand = function (path) {
        if (!this.trellis.properties[path])
            throw new Error('No such property: ' + this.trellis.name + '.' + path + '.');
        this.expansions[path] = null;
        return this;
    };
    Query_Implementation.prototype.filter = function (filters) {
        for (var i in filters) {
            var option = filters[i];
            if (option && option[this.trellis.primary_keys[0].name]) {
                filters[i] = option[this.trellis.primary_keys[0].name];
            }
        }
        this.options.where = filters;
        return this;
    };
    Query_Implementation.prototype.first = function (filters) {
        this.set_reduce_mode(Reduce_Mode.first);
        return filters
            ? this.filter(filters)
            : this;
    };
    // join<T2, O2>(collection: ICollection): QueryBuilder<T2, O2> {
    //   this.options.include = this.options.include || []
    //   // this.options.include.push(collection.get_sequelize())
    //   throw new Error("Not implemented.")
    //   // return this as any
    // }
    Query_Implementation.prototype.range = function (start, length) {
        if (start)
            this.options.offset = start;
        if (length)
            this.options.limit = length;
        return this;
    };
    Query_Implementation.prototype.select = function (options) {
        if (typeof options === 'string')
            options = [options];
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
    Query_Implementation.prototype.sort = function (args) {
        this.options.order = args;
        return this;
    };
    Query_Implementation.prototype.then = function (callback) {
        return this.exec()
            .then(callback);
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