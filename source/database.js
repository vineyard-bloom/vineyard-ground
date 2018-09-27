"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("./schema");
var Sequelize = require('sequelize');
var node_uuid = require('uuid');
function get_field(property, library, dialect) {
    var type = property.type;
    switch (type.get_category()) {
        case schema_1.Type_Category.primitive:
            if (type === library.types.long)
                return {
                    type: Sequelize.BIGINT
                };
            if (type === library.types.int)
                return {
                    type: Sequelize.INTEGER
                };
            if (type === library.types.string)
                return {
                    type: Sequelize.STRING
                };
            if (type === library.types.text)
                return {
                    type: Sequelize.TEXT
                };
            if (type === library.types.json)
                return dialect == 'mysql'
                    ? { type: Sequelize.TEXT }
                    : { type: Sequelize.JSON };
            if (type === library.types.bool)
                return {
                    type: Sequelize.BOOLEAN
                };
            if (type === library.types.guid)
                return {
                    type: Sequelize.UUID
                };
            if (type === library.types.float)
                return {
                    type: Sequelize.FLOAT
                };
            if (type === library.types.date)
                return {
                    type: Sequelize.DATEONLY
                };
            if (type === library.types.datetime)
                return {
                    type: Sequelize.DATE
                };
            if (type === library.types.time)
                return {
                    type: Sequelize.TIME
                };
            if (type === library.types.colossal)
                return {
                    type: Sequelize.NUMERIC
                };
            if (type === library.types.bignumber)
                return {
                    type: Sequelize.NUMERIC
                };
            if (type === library.types.char)
                return {
                    type: Sequelize.CHAR
                };
            if (type === library.types.short)
                return {
                    type: Sequelize.SMALLINT
                };
            throw new Error("Unknown primitive: " + type.name + '.');
        case schema_1.Type_Category.list:
            return null;
        case schema_1.Type_Category.trellis:
            if (library.types[type.name]) {
                var field = type.trellis.primary_keys[0];
                return get_field(field, library, dialect);
            }
            throw new Error("Unknown trellis reference: " + type.name + '.');
        default:
            throw Error("Invalid type category: " + type.get_category() + '.');
    }
}
function create_field(property, library, dialect) {
    var field = get_field(property, library, dialect);
    if (!field)
        return null;
    if (property.length)
        field.type = field.type(property.length);
    field.allowNull = property.is_nullable;
    if (property.default !== undefined)
        field.defaultValue = property.default;
    if (property.is_unique)
        field.unique = true;
    return field;
}
function get_cross_table_name(trellises) {
    return trellises.map(function (t) { return t.oldTable.getTableName(); }).sort().join('_');
}
function initialize_many_to_many(list, trellis, schema, tables, sequelize) {
    var table_trellises = [list.trellis, list.other_property.trellis];
    var cross_table_name = get_cross_table_name(table_trellises);
    var relationship = trellis.oldTable.belongsToMany(list.get_other_trellis().oldTable, {
        as: list.name,
        otherKey: list.other_property.trellis.name.toLowerCase(),
        foreignKey: list.trellis.name.toLowerCase(),
        constraints: false,
        through: cross_table_name
    });
    list.cross_table = relationship.through.model;
}
function initialize_relationship(property, trellis, schema, tables, sequelize) {
    if (property.type.get_category() == schema_1.Type_Category.trellis) {
        var reference = property;
        if (!reference.other_property) {
            var other_table = reference.get_other_trellis().oldTable;
            other_table.hasMany(trellis.oldTable, {
                foreignKey: reference.name,
                constraints: true
            });
        }
    }
    else if (property.type.get_category() == schema_1.Type_Category.list) {
        var list = property;
        if (list.other_property.type.get_category() == schema_1.Type_Category.list) {
            initialize_many_to_many(list, trellis, schema, tables, sequelize);
        }
        else {
            trellis.oldTable.hasMany(list.get_other_trellis().oldTable, {
                as: list.name,
                foreignKey: list.other_property.name,
                constraints: true
            });
        }
    }
}
function initialize_relationships(schema, tables, sequelize) {
    for (var name in schema.trellises) {
        var trellis = schema.trellises[name];
        for (var i in trellis.properties) {
            var property = trellis.properties[i];
            initialize_relationship(property, trellis, schema, tables, sequelize);
        }
    }
}
function create_table(trellis, schema, sequelize) {
    var fields = {};
    // Create the primary key field first for DB UX
    for (var i = 0; i < trellis.primary_keys.length; ++i) {
        var property = trellis.primary_keys[i];
        var primary_key = fields[property.name] =
            create_field(property, schema.library, sequelize.getDialect());
        primary_key.primaryKey = true;
        if (property.type === schema.library.types.uuid) {
            primary_key.defaultValue = sequelize.getDialect() == 'mysql'
                ? function () { return node_uuid.v4().replace(/-/g, ''); }
                : node_uuid.v4;
        }
        else if (property.type === schema.library.types.int ||
            property.type === schema.library.types.long) {
            if (property.autoIncrement)
                primary_key.autoIncrement = true;
            delete primary_key.defaultValue;
        }
    }
    var _loop_1 = function (i) {
        if (trellis.primary_keys.some(function (k) { return k.name == i; }))
            return "continue";
        var property = trellis.properties[i];
        var field = create_field(property, schema.library, sequelize.getDialect());
        if (field) {
            fields[i] = field;
        }
    };
    for (var i in trellis.properties) {
        _loop_1(i);
    }
    var created = 'created';
    var modified = 'modified';
    var deleted = trellis.softDelete ? 'deleted' : false;
    if (trellis.additional && Array.isArray(trellis.additional.autoFields)) {
        var autoFields = trellis.additional.autoFields;
        if (autoFields.indexOf('created') == -1)
            created = false;
        if (autoFields.indexOf('modified') == -1)
            modified = false;
    }
    var indexArray = !trellis.table.indexes ? [] : trellis.table.indexes.map(function (index) {
        return ({
            fields: index.properties
        });
    });
    var oldTable = trellis.oldTable = sequelize.define(trellis.table.name, fields, {
        underscored: true,
        createdAt: created,
        updatedAt: modified,
        deletedAt: deleted,
        paranoid: !!deleted,
        indexes: indexArray
    });
    return oldTable;
}
function vineyard_to_sequelize(schema, keys, sequelize) {
    var tables = {};
    for (var name in keys) {
        tables[name] = create_table(schema.trellises[name], schema, sequelize);
    }
    initialize_relationships(schema, tables, sequelize);
    return tables;
}
exports.vineyard_to_sequelize = vineyard_to_sequelize;
//# sourceMappingURL=database.js.map