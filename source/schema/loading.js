"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
const trellis_1 = require("./trellis");
const utility_1 = require("../utility");
const pluralize = require('pluralize');
let snakeCaseTables = true;
function setSnakeCaseTables(value) {
    snakeCaseTables = value;
}
exports.setSnakeCaseTables = setSnakeCaseTables;
class Incomplete_Type extends type_1.Type {
    constructor(target_name, source) {
        super("Incomplete: " + target_name);
        this.target_name = target_name;
        this.source = source;
    }
    get_category() {
        return type_1.Type_Category.incomplete;
    }
    get_other_trellis_name() {
        return this.target_name;
    }
}
class Loader {
    constructor(library) {
        this.incomplete = {};
        this.library = library;
    }
}
function load_type(source, loader) {
    const types = loader.library.types;
    const result = types[source.type];
    if (result)
        return result;
    if (source.type == 'list') {
        if (source.trellis) {
            const result = types[source.trellis];
            if (result)
                return new type_1.List_Type(result.name, result);
        }
        return new Incomplete_Type(source.trellis || "", source);
    }
    return new Incomplete_Type(source.type, source);
    // throw Error("Not supported: " + JSON.stringify(source))
}
function find_other_references(trellis, other_trellis) {
    const result = [];
    for (let name in other_trellis.properties) {
        const property = other_trellis.properties[name];
        if (property.is_reference()) {
            const reference = property;
            if (reference.type.get_other_trellis_name() == trellis.name)
                result.push(reference);
        }
    }
    return result;
}
function find_other_reference_or_null(trellis, other_trellis) {
    const references = find_other_references(trellis, other_trellis);
    if (references.length > 1)
        console.error("Multiple ambiguous other references for " + trellis.name + " and " + other_trellis.name + ".");
    // throw Error("Multiple ambiguous other references for " + trellis.name + " and " + other_trellis.name + ".")
    return references[0];
}
function find_other_reference(trellis, other_trellis) {
    const reference = find_other_reference_or_null(trellis, other_trellis);
    if (!reference)
        throw Error("Could not find other reference for " + trellis.name + " and " + other_trellis.name + ".");
    return reference;
}
function load_property_inner(name, source, trellis, loader) {
    if (!source.type)
        throw new Error(trellis.name + "." + name + " is missing a type property.");
    const type = load_type(source, loader);
    if (type.get_category() == type_1.Type_Category.primitive) {
        return new trellis_1.StandardProperty(name, type, trellis);
    }
    else if (type.get_category() == type_1.Type_Category.trellis) {
        return new trellis_1.Reference(name, type, trellis, find_other_reference_or_null(trellis, type.trellis));
    }
    else if (type.get_category() == type_1.Type_Category.list) {
        const list_type = type;
        return new trellis_1.Reference(name, type, trellis, find_other_reference(trellis, list_type.child_type.trellis));
    }
    else if (type.get_category() == type_1.Type_Category.incomplete) {
        const property = new trellis_1.Reference(name, type, trellis);
        const target = type.target_name;
        const incomplete = loader.incomplete[target] = loader.incomplete[target] || [];
        incomplete.push({
            property: property,
            source: source
        });
        return property;
    }
    else {
        throw new Error("Unsupported property type");
    }
}
function load_property(name, property_source, trellis, loader) {
    const property = trellis.properties[name] = load_property_inner(name, property_source, trellis, loader);
    if (property_source.nullable === true)
        property.is_nullable = true;
    if (property_source.unique === true)
        property.is_unique = true;
    if (property_source.length)
        property.length = property_source.length;
    if (typeof property_source.autoIncrement === 'boolean')
        property.autoIncrement = property_source.autoIncrement;
    property.default = property.is_nullable
        ? null
        : (property_source.defaultValue !== undefined
            ? property_source.defaultValue
            : property_source.default);
    return property;
}
function update_incomplete(trellis, loader) {
    const incomplete = loader.incomplete[trellis.name];
    if (incomplete) {
        for (let i = 0; i < incomplete.length; ++i) {
            const entry = incomplete[i];
            const property = entry.property;
            const type = property.type = load_type(entry.source, loader);
            if (type.get_category() == type_1.Type_Category.incomplete)
                throw Error("Error resolving incomplete type.");
            if (type.get_category() == type_1.Type_Category.trellis) {
                property.other_property = find_other_reference_or_null(property.trellis, trellis);
            }
            else {
                property.other_property = find_other_reference(property.trellis, trellis);
            }
        }
        delete loader.incomplete[trellis.name];
    }
}
function initialize_primary_key(primary_key, trellis, loader) {
    if (primary_key == 'id' && !trellis.properties['id'])
        trellis.properties['id'] = new trellis_1.StandardProperty('id', loader.library.types.uuid, trellis);
    if (!trellis.properties[primary_key])
        throw new Error("Could not find primary key " + trellis.name + '.' + primary_key + '.');
    return trellis.properties[primary_key];
}
function format_primary_keys(primary_keys, trellis_name) {
    if (!primary_keys)
        return ['id'];
    if (typeof primary_keys == 'string')
        return [primary_keys];
    if (Array.isArray(primary_keys))
        return primary_keys;
    throw new Error("Invalid primary keys format for trellis " + trellis_name + '.');
}
function initialize_primary_keys(trellis, source, loader) {
    const initialPrimaryKeys = source.primaryKeys || source.primary || source.primary_key;
    const primaryKeys = format_primary_keys(initialPrimaryKeys, trellis.name);
    for (let i = 0; i < primaryKeys.length; ++i) {
        trellis.primary_keys.push(initialize_primary_key(primaryKeys[i], trellis, loader));
    }
}
// loadIndexes function returns an array of indexes
function loadIndexes(trellis, source) {
    if (!source.table || !source.table.indexes)
        return [];
    return source.table.indexes.map(indexSource => ({
        properties: indexSource.properties.map(name => trellis.properties[name])
    }));
}
function load_trellis(name, source, loader) {
    const sourceTable = source.table || { name: undefined };
    const table = {
        name: sourceTable.name || pluralize(snakeCaseTables ? utility_1.to_lower_snake_case(name) : name.toLowerCase()),
        // Call loadIndexes function to assign indexes to trellis.table.indexes
        indexes: []
    };
    const trellis = new trellis_1.TrellisImplementation(name, table);
    loader.library.types[name] = new trellis_1.Trellis_Type(name, trellis);
    table.indexes = loadIndexes(trellis, source);
    for (let name in source.properties) {
        const property_source = source.properties[name];
        trellis.properties[name] = load_property(name, property_source, trellis, loader);
    }
    if (source.additional)
        trellis.additional = source.additional;
    if (source.softDelete)
        trellis.softDelete = true;
    initialize_primary_keys(trellis, source, loader);
    update_incomplete(trellis, loader);
    return trellis;
}
function load_schema(definitions, trellises, library) {
    const loader = new Loader(library);
    for (let name in definitions) {
        const definition = definitions[name];
        trellises[name] = load_trellis(name, definition, loader);
    }
    for (let name in definitions) {
        const definition = definitions[name];
        if (typeof definition.parent == 'string') {
            if (!trellises[definition.parent])
                throw Error("Invalid parent trellis: " + definition.parent + '.');
            trellises[name].parent = trellises[definition.parent];
        }
    }
    for (let a in loader.incomplete) {
        throw Error("Unknown type '" + a + "'.");
    }
}
exports.load_schema = load_schema;
//# sourceMappingURL=loading.js.map