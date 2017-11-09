"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var type_1 = require("./type");
var trellis_1 = require("./trellis");
var utility_1 = require("../utility");
var Incomplete_Type = (function (_super) {
    __extends(Incomplete_Type, _super);
    function Incomplete_Type(target_name, source) {
        var _this = _super.call(this, "Incomplete: " + target_name) || this;
        _this.target_name = target_name;
        _this.source = source;
        return _this;
    }
    Incomplete_Type.prototype.get_category = function () {
        return type_1.Type_Category.incomplete;
    };
    Incomplete_Type.prototype.get_other_trellis_name = function () {
        return this.target_name;
    };
    return Incomplete_Type;
}(type_1.Type));
var Loader = (function () {
    function Loader(library) {
        this.incomplete = {};
        this.library = library;
    }
    return Loader;
}());
function load_type(source, loader) {
    var types = loader.library.types;
    var result = types[source.type];
    if (result)
        return result;
    if (source.type == 'list') {
        if (source.trellis) {
            var result_1 = types[source.trellis];
            if (result_1)
                return new type_1.List_Type(result_1.name, result_1);
        }
        return new Incomplete_Type(source.trellis || "", source);
    }
    return new Incomplete_Type(source.type, source);
    // throw Error("Not supported: " + JSON.stringify(source))
}
function find_other_references(trellis, other_trellis) {
    var result = [];
    for (var name in other_trellis.properties) {
        var property = other_trellis.properties[name];
        if (property.is_reference()) {
            var reference = property;
            if (reference.type.get_other_trellis_name() == trellis.name)
                result.push(reference);
        }
    }
    return result;
}
function find_other_reference_or_null(trellis, other_trellis) {
    var references = find_other_references(trellis, other_trellis);
    if (references.length > 1)
        console.error("Multiple ambiguous other references for " + trellis.name + " and " + other_trellis.name + ".");
    // throw Error("Multiple ambiguous other references for " + trellis.name + " and " + other_trellis.name + ".")
    return references[0];
}
function find_other_reference(trellis, other_trellis) {
    var reference = find_other_reference_or_null(trellis, other_trellis);
    if (!reference)
        throw Error("Could not find other reference for " + trellis.name + " and " + other_trellis.name + ".");
    return reference;
}
function load_property_inner(name, source, trellis, loader) {
    if (!source.type)
        throw new Error(trellis.name + "." + name + " is missing a type property.");
    var type = load_type(source, loader);
    if (type.get_category() == type_1.Type_Category.primitive) {
        return new trellis_1.StandardProperty(name, type, trellis);
    }
    else if (type.get_category() == type_1.Type_Category.trellis) {
        return new trellis_1.Reference(name, type, trellis, find_other_reference_or_null(trellis, type.trellis));
    }
    else if (type.get_category() == type_1.Type_Category.list) {
        var list_type = type;
        return new trellis_1.Reference(name, type, trellis, find_other_reference(trellis, list_type.child_type.trellis));
    }
    else if (type.get_category() == type_1.Type_Category.incomplete) {
        var property = new trellis_1.Reference(name, type, trellis);
        var target = type.target_name;
        var incomplete = loader.incomplete[target] = loader.incomplete[target] || [];
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
    var property = trellis.properties[name] = load_property_inner(name, property_source, trellis, loader);
    if (property_source.nullable === true)
        property.is_nullable = true;
    if (property_source.unique === true)
        property.is_unique = true;
    property.default = property_source.defaultValue !== undefined
        ? property_source.defaultValue
        : property_source.default;
    return property;
}
function update_incomplete(trellis, loader) {
    var incomplete = loader.incomplete[trellis.name];
    if (incomplete) {
        for (var i = 0; i < incomplete.length; ++i) {
            var entry = incomplete[i];
            var property = entry.property;
            var type = property.type = load_type(entry.source, loader);
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
    var initialPrimaryKeys = source.primaryKeys || source.primary || source.primary_key;
    var primaryKeys = format_primary_keys(initialPrimaryKeys, trellis.name);
    for (var i = 0; i < primaryKeys.length; ++i) {
        trellis.primary_keys.push(initialize_primary_key(primaryKeys[i], trellis, loader));
    }
}
function load_trellis(name, source, loader) {
    var trellis = new trellis_1.TrellisImplementation(name);
    loader.library.types[name] = new trellis_1.Trellis_Type(name, trellis);
    var sourceTable = source.table || {};
    trellis.table = {
        name: sourceTable.name || utility_1.to_lower_snake_case(trellis.name)
    };
    for (var name_1 in source.properties) {
        var property_source = source.properties[name_1];
        trellis.properties[name_1] = load_property(name_1, property_source, trellis, loader);
    }
    if (source.additional)
        trellis.additional = source.additional;
    initialize_primary_keys(trellis, source, loader);
    update_incomplete(trellis, loader);
    return trellis;
}
function load_schema(definitions, trellises, library) {
    var loader = new Loader(library);
    for (var name in definitions) {
        var definition = definitions[name];
        trellises[name] = load_trellis(name, definition, loader);
    }
    for (var name in definitions) {
        var definition = definitions[name];
        if (typeof definition.parent == 'string') {
            if (!trellises[definition.parent])
                throw Error("Invalid parent trellis: " + definition.parent + '.');
            trellises[name].parent = trellises[definition.parent];
        }
    }
    for (var a in loader.incomplete) {
        throw Error("Unknown type '" + a + "'.");
    }
}
exports.load_schema = load_schema;
//# sourceMappingURL=loading.js.map