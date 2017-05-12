"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var list_operations_1 = require("./list-operations");
var utility_1 = require("./utility");
function prepare_reference(reference, value) {
    var other_primary_key = reference.get_other_trellis().primary_key.name;
    if (typeof value === 'object') {
        if (!value)
            throw new Error(reference.get_path() + ' cannot be null');
        if (value[other_primary_key])
            return value[other_primary_key];
        else
            throw new Error(reference.get_path() + ' cannot be an object');
    }
    else {
        return value;
    }
}
function prepare_property(property, value) {
    if (property.is_reference()) {
        return prepare_reference(property, value);
    }
    else if (property.type.name == 'json' && property.trellis['table'].sequelize.getDialect() == 'mysql') {
        return JSON.stringify(value);
    }
    else {
        if (typeof value === 'object' && ['json', 'jsonb', 'date', 'datetime', 'time'].indexOf(property.type.name) == -1)
            throw new Error(property.get_path() + ' cannot be an object');
        return value;
    }
}
function prepare_seed(seed, trellis) {
    var new_seed = {};
    for (var i in seed) {
        var property = trellis.properties[i];
        if (!property)
            throw new Error("Invalid property: " + trellis.name + "." + i + '.');
        if (!property.is_list()) {
            new_seed[i] = prepare_property(property, seed[i]);
        }
    }
    return new_seed;
}
function perform_operation(identity, seed, list, sequelize, operation) {
    switch (operation.type) {
        case list_operations_1.Operation_Type.add: {
            var fields = {};
            fields[utility_1.to_lower(list.trellis.name)] = identity;
            fields[utility_1.to_lower(list.other_property.trellis.name)] = list.other_property.trellis.get_identity(operation.item);
            return list['cross_table'].create(fields);
        }
        case list_operations_1.Operation_Type.remove: {
            var fields = {};
            fields[utility_1.to_lower(list.trellis.name)] = identity;
            fields[utility_1.to_lower(list.other_property.trellis.name)] = list.other_property.trellis.get_identity(operation.item);
            return list['cross_table'].destroy({
                where: fields,
                force: true
            });
        }
        default:
            throw new Error("Not implemented.");
    }
}
function update_list(identity, seed, list, sequelize) {
    var value = seed[list.name];
    if (Array.isArray(value)) {
        throw new Error("Not yet implemented.");
    }
    else {
        return perform_operation(identity, seed, list, sequelize, value);
    }
}
function update_lists(identity, seed, trellis, sequelize) {
    var promise = Promise.resolve();
    var _loop_1 = function (list) {
        if (seed[list.name])
            promise = promise.then(function () { return update_list(identity, seed, list, sequelize); });
    };
    for (var _i = 0, _a = trellis.get_lists(); _i < _a.length; _i++) {
        var list = _a[_i];
        _loop_1(list);
    }
    return promise;
}
function post_process(result, identity, seed, trellis, sequelize) {
    return update_lists(identity, seed, trellis, sequelize)
        .then(function () { return result.dataValues; });
}
function create(seed, trellis, sequelize) {
    var new_seed = prepare_seed(seed, trellis);
    return sequelize.create(new_seed)
        .then(function (result) { return post_process(result, trellis.get_identity(result.dataValues), seed, trellis, sequelize); });
}
exports.create = create;
function create_or_update(seed, trellis, sequelize) {
    var new_seed = prepare_seed(seed, trellis);
    return sequelize.upsert(new_seed)
        .then(function (result) { return post_process(result, trellis.get_identity(result), seed, trellis, sequelize); });
}
exports.create_or_update = create_or_update;
function update(seed, trellis, sequelize, changes) {
    var primary_key = trellis.primary_key.name;
    var identity = trellis.get_identity(seed);
    var new_seed = prepare_seed(changes || seed, trellis);
    var filter = {};
    filter[primary_key] = identity;
    return sequelize.update(new_seed, {
        where: filter
    })
        .then(function (result) { return post_process(result, identity, changes, trellis, sequelize); });
}
exports.update = update;
//# sourceMappingURL=update.js.map