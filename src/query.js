"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize = require('sequelize');
const utility_1 = require("./utility");
const query_generator_1 = require("./sql/query-generator");
const BigNumber = require('bignumber.js');
var Reduce_Mode;
(function (Reduce_Mode) {
    Reduce_Mode[Reduce_Mode["none"] = 0] = "none";
    Reduce_Mode[Reduce_Mode["first"] = 1] = "first";
    Reduce_Mode[Reduce_Mode["single_value"] = 2] = "single_value";
})(Reduce_Mode || (Reduce_Mode = {}));
function getData(row) {
    return row.dataValues || row;
}
class Query_Implementation {
    constructor(tables, table, client, trellis) {
        this.options = {};
        this.reduce_mode = Reduce_Mode.none;
        this.expansions = {};
        this.allow_null = true;
        this.tables = tables;
        this.table = table;
        this.trellis = trellis;
        this.client = client;
        // Monkey patch for soft backwards compatibility
        const self = this;
        self.firstOrNull = this.first;
        self.first_or_null = this.first;
    }
    set_reduce_mode(value) {
        if (this.reduce_mode == value)
            return;
        if (this.reduce_mode != Reduce_Mode.none && value != Reduce_Mode.single_value) {
            throw new Error('Reduce mode already set.');
        }
        this.reduce_mode = value;
    }
    get_other_collection(path) {
        const reference = this.trellis.properties[path];
        return reference.get_other_trellis().collection;
    }
    expand_crossTable(tables, reference, identity) {
        const where = {};
        where[utility_1.to_lower(reference.trellis.name)] = identity;
        return tables[reference.otherProperty.trellis.table.name].findAll({
            include: {
                model: tables[reference.trellis.table.name],
                through: { where: where },
                as: reference.otherProperty.name,
                required: true
            }
        })
            .then((result) => result.map((r) => utility_1.processFields(getData(r), reference.otherProperty.trellis)));
    }
    perform_expansion(tables, path, data) {
        const property = this.trellis.properties[path];
        if (property.is_list()) {
            return property.otherProperty.is_list()
                ? this.expand_crossTable(tables, property, this.trellis.get_identity(data))
                : this.get_other_collection(path).filter({ [property.otherProperty.name]: data });
        }
        else {
            return this.get_other_collection(path).get(data[path]);
        }
    }
    handle_expansions(tables, results) {
        let promises = results.map((result) => Promise.all(this.get_expansions()
            .map(path => this.perform_expansion(tables, path, getData(result))
            .then((child) => getData(result)[path] = child))));
        return Promise.all(promises)
            .then(() => results); // Not needed but a nice touch.
    }
    process_result(result) {
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
        return result.map((item) => utility_1.processFields(getData(item), this.trellis));
    }
    process_result_with_expansions(tables, result) {
        return this.handle_expansions(tables, result)
            .then(result => this.process_result(result));
    }
    get_expansions() {
        return Object.keys(this.expansions);
    }
    has_expansions() {
        return this.get_expansions().length > 0;
    }
    queryWithQueryGenerator() {
        const legacyClient = this.client.getLegacyClient();
        if (legacyClient)
            return legacyClient.findAll(this.table, this.options);
        const generator = new query_generator_1.QueryGenerator(this.trellis);
        this.bundle = generator.generate(this.options);
        return this.client.query(this.bundle.sql, this.bundle.args)
            .then(result => result.rows);
    }
    exec() {
        return this.queryWithQueryGenerator()
            .then((result) => this.has_expansions()
            ? this.process_result_with_expansions(this.tables, result)
            : this.process_result(result))
            .catch((error) => {
            if (this.bundle)
                console.error(this.bundle);
            else
                console.error(this.options);
            throw error;
        });
    }
    expand(path) {
        if (!this.trellis.properties[path])
            throw new Error('No such property: ' + this.trellis.name + '.' + path + '.');
        this.expansions[path] = null;
        return this;
    }
    filter(filters) {
        for (var i in filters) {
            const option = filters[i];
            if (option && option[this.trellis.primary_keys[0].name]) {
                filters[i] = option[this.trellis.primary_keys[0].name];
            }
        }
        this.options.where = filters;
        return this;
    }
    first(filters) {
        this.set_reduce_mode(Reduce_Mode.first);
        return filters
            ? this.filter(filters)
            : this;
    }
    // join<T2, O2>(collection: ICollection): QueryBuilder<T2, O2> {
    //   this.options.include = this.options.include || []
    //   // this.options.include.push(collection.get_sequelize())
    //   throw new Error("Not implemented.")
    //   // return this as any
    // }
    range(start, length) {
        if (start)
            this.options.offset = start;
        if (length)
            this.options.limit = length;
        return this;
    }
    select(options) {
        if (typeof options === 'string')
            options = [options];
        if (options.length == 1) {
            const entry = options[0];
            options = Array.isArray(entry)
                ? [[entry[0], '_value']]
                : [[entry, '_value']];
            this.set_reduce_mode(Reduce_Mode.single_value);
        }
        this.options.attributes = options;
        return this;
    }
    sort(args) {
        this.options.order = args;
        return this;
    }
    then(callback) {
        return this.exec()
            .then(callback);
    }
}
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