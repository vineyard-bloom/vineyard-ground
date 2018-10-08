"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const list_operations_1 = require("./list-operations");
const utility_1 = require("./utility");
function prepare_reference(reference, value) {
    const other_primary_key = reference.get_other_trellis().primary_keys[0].name;
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
    const newSeed = {};
    for (let i in seed) {
        const property = trellis.properties[i];
        if (!property)
            throw new Error('Invalid property: ' + trellis.name + '.' + i + '.');
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
function perform_operation(tables, identity, list, operationOrIdentity) {
    const operation = formatOperation(operationOrIdentity);
    switch (operation.type) {
        case list_operations_1.Operation_Type.add: {
            const fields = {};
            fields[utility_1.to_lower(list.trellis.name)] = identity;
            fields[utility_1.to_lower(list.otherProperty.trellis.name)] = list.otherProperty.trellis.get_identity(operation.item);
            if (!list.crossTable)
                throw Error('List is missing cross table.');
            return tables[list.crossTable.table.name].create(fields);
        }
        case list_operations_1.Operation_Type.remove: {
            const fields = {};
            fields[utility_1.to_lower(list.trellis.name)] = identity;
            fields[utility_1.to_lower(list.otherProperty.trellis.name)] = list.otherProperty.trellis.get_identity(operation.item);
            if (!list.crossTable)
                throw Error('List is missing cross table.');
            return tables[list.crossTable.table.name].destroy({
                where: fields,
                force: true
            });
        }
        default:
            throw new Error('Not implemented.');
    }
}
function update_list(tables, identity, seed, list, table) {
    const value = seed[list.name];
    if (Array.isArray(value)) {
        return Promise.all(value.map(item => perform_operation(tables, identity, list, item)));
    }
    else {
        return perform_operation(tables, identity, list, value);
    }
}
function update_lists(tables, identity, seed, trellis, table) {
    let promise = Promise.resolve();
    for (let list of trellis.get_lists()) {
        if (seed[list.name])
            promise = promise.then(() => update_list(tables, identity, seed, list, table));
    }
    return promise;
}
function post_process(tables, result, identity, seed, trellis, table) {
    utility_1.processFields(result.dataValues, trellis);
    return update_lists(tables, identity, seed, trellis, table)
        .then(() => result.dataValues);
}
function create(tables, seed, trellis, table) {
    const newSeed = prepare_seed(seed, trellis);
    return table.create(newSeed)
        .then(result => post_process(tables, result, trellis.get_identity(result), seed, trellis, table));
}
exports.create = create;
function create_or_update(tables, seed, trellis, table) {
    const newSeed = prepare_seed(seed, trellis);
    return table.upsert(newSeed)
        .then(result => post_process(tables, result, trellis.get_identity(result), seed, trellis, table));
}
exports.create_or_update = create_or_update;
function update(tables, seed, trellis, table, changes) {
    const primary_key = trellis.primary_keys[0].name;
    const identity = trellis.get_identity(seed);
    const newSeed = prepare_seed(changes || seed, trellis);
    const filter = typeof identity === 'object'
        ? identity
        : { [primary_key]: identity };
    return table.update(newSeed, filter)
        .then((result) => post_process(tables, result[1][0], identity, changes, trellis, table));
}
exports.update = update;
//# sourceMappingURL=update.js.map