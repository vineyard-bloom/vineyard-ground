"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var list_operations_1 = require("./list-operations");
var utility_1 = require("./utility");
function prepare_reference(reference, value) {
    var other_primary_key = reference.get_other_trellis().primary_keys[0].name;
    if (typeof value === 'object') {
        if (!value) {
            if (reference.is_nullable)
                return null;
            throw new Error(reference.get_path() + ' cannot be null');
        }
        if (value[other_primary_key])
            return value[other_primary_key];
        else
            throw new Error(reference.get_path() + ' is missing property "' + other_primary_key + '"');
    }
    else {
        return value;
    }
}
function prepare_property(property, value) {
    if (property.is_reference()) {
        return prepare_reference(property, value);
    }
    else {
        if ((value === null || value === undefined) && property.is_nullable)
            return null;
        if (typeof value === 'object') {
            if (property.type.name === 'colossal') {
                return value.toString();
            }
            if (property.type.name === 'bignumber') {
                return value.toString();
            }
            if (['json', 'jsonb', 'date', 'datetime', 'time'].indexOf(property.type.name) == -1)
                throw new Error(property.get_path() + ' cannot be an object');
        }
        return value;
    }
}
function prepare_seed(seed, trellis) {
    var newSeed = {};
    for (var i in seed) {
        var property = trellis.properties[i];
        if (!property)
            throw new Error("Invalid property: " + trellis.name + "." + i + '.');
        if (!property.is_list()) {
            newSeed[i] = prepare_property(property, seed[i]);
        }
    }
    return newSeed;
}
function formatOperation(operation) {
    if (Object.keys(operation).length == 2 && operation.type != undefined && operation.item != undefined) {
        return operation;
    }
    return list_operations_1.Add(operation);
}
function perform_operation(identity, list, operationOrIdentity) {
    var operation = formatOperation(operationOrIdentity);
    switch (operation.type) {
        case list_operations_1.Operation_Type.add: {
            var fields = {};
            fields[utility_1.to_lower(list.trellis.name)] = identity;
            fields[utility_1.to_lower(list.other_property.trellis.name)] = list.other_property.trellis.get_identity(operation.item);
            if (!list.cross_table)
                throw Error("List is missing cross table.");
            return list.cross_table.create(fields);
        }
        case list_operations_1.Operation_Type.remove: {
            var fields = {};
            fields[utility_1.to_lower(list.trellis.name)] = identity;
            fields[utility_1.to_lower(list.other_property.trellis.name)] = list.other_property.trellis.get_identity(operation.item);
            if (!list.cross_table)
                throw Error("List is missing cross table.");
            return list.cross_table.destroy({
                where: fields,
                force: true
            });
        }
        default:
            throw new Error("Not implemented.");
    }
}
function update_list(identity, seed, list, table) {
    var value = seed[list.name];
    if (Array.isArray(value)) {
        return Promise.all(value.map(function (item) { return perform_operation(identity, list, item); }));
    }
    else {
        return perform_operation(identity, list, value);
    }
}
function update_lists(identity, seed, trellis, table) {
    var promise = Promise.resolve();
    var _loop_1 = function (list) {
        if (seed[list.name])
            promise = promise.then(function () { return update_list(identity, seed, list, table); });
    };
    for (var _i = 0, _a = trellis.get_lists(); _i < _a.length; _i++) {
        var list = _a[_i];
        _loop_1(list);
    }
    return promise;
}
function post_process(result, identity, seed, trellis, table) {
    utility_1.processFields(result.dataValues, trellis);
    return update_lists(identity, seed, trellis, table)
        .then(function () { return result.dataValues; });
}
function create(seed, trellis, table) {
    var newSeed = prepare_seed(seed, trellis);
    return table.create(newSeed)
        .then(function (result) { return post_process(result, trellis.get_identity(result), seed, trellis, table); });
}
exports.create = create;
function create_or_update(seed, trellis, table) {
    var newSeed = prepare_seed(seed, trellis);
    return table.upsert(newSeed)
        .then(function (result) { return post_process(result, trellis.get_identity(result), seed, trellis, table); });
}
exports.create_or_update = create_or_update;
function update(seed, trellis, table, changes) {
    var primary_key = trellis.primary_keys[0].name;
    var identity = trellis.get_identity(seed);
    var newSeed = prepare_seed(changes || seed, trellis);
    var filter = typeof identity === 'object'
        ? identity
        : (_a = {}, _a[primary_key] = identity, _a);
    return table.update(newSeed, filter)
        .then(function (result) { return post_process(result[1][0], identity, changes, trellis, table); });
    var _a;
}
exports.update = update;
//# sourceMappingURL=update.js.map