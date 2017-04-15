"use strict";
var vineyard_schema_1 = require("vineyard-schema");
var Sequelize = require('sequelize');
var node_uuid = require('uuid');
function get_field(property, library) {
    var type = property.type;
    switch (type.get_category()) {
        case vineyard_schema_1.Type_Category.primitive:
            if (type === library.types.long)
                return {
                    type: Sequelize.BIGINT,
                    defaultValue: 0
                };
            if (type === library.types.int)
                return {
                    type: Sequelize.INTEGER,
                    defaultValue: 0
                };
            if (type === library.types.string)
                return {
                    type: Sequelize.STRING,
                    defaultValue: ""
                };
            if (type === library.types.json)
                return {
                    type: Sequelize.JSON
                };
            if (type === library.types.bool)
                return {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                };
            if (type === library.types.guid)
                return {
                    type: Sequelize.UUID
                };
            if (type === library.types.float)
                return {
                    type: Sequelize.FLOAT,
                    defaultValue: 0
                };
            if (type === library.types.date)
                return {
                    type: Sequelize.DATE
                };
            throw new Error("Unknown primitive: " + type.name + '.');
        case vineyard_schema_1.Type_Category.list:
            return null;
        case vineyard_schema_1.Type_Category.trellis:
            if (library.types[type.name]) {
                return get_field(type.trellis.primary_key, library);
            }
            throw new Error("Unknown trellis reference: " + type.name + '.');
        default:
            throw Error("Invalid type category: " + type.get_category() + '.');
    }
}
function create_field(property, library) {
    var field = get_field(property, library);
    if (field)
        field.allowNull = property.is_nullable;
    if (property.default !== undefined)
        field.defaultValue = property.default;
    if (property.is_unique)
        field.unique = true;
    return field;
}
function get_cross_table_name(trellises) {
    return trellises.map(function (t) { return t['table'].getTableName(); }).sort().join('_');
}
// function create_cross_table(table_name: string, trellises: Trellis [], tables, library: Library, sequelize) {
//   const fields = {}
//   for (let trellis of trellises) {
//     const field = get_field(trellis.primary_key, library)
//     field.primaryKey = true
//     fields[trellis.name.toLowerCase()]= field
//   }
//   const table = tables [table_name] = sequelize.define(table_name, fields, {
//     underscored: true,
//     createdAt: 'created',
//     updatedAt: 'modified',
//     freezeTableName: true
//   })
//
//   return table
// }
function initialize_many_to_many(list, trellis, schema, tables, sequelize) {
    var table_trellises = [list.trellis, list.other_property.trellis];
    var cross_table_name = get_cross_table_name(table_trellises);
    if (!tables[cross_table_name]) {
        // const cross_table = create_cross_table(cross_table_name, table_trellises, tables, schema.library, sequelize)
        trellis['table'].belongsToMany(list.get_other_trellis()['table'], {
            as: list.name,
            foreignKey: list.other_property.trellis.name.toLowerCase(),
            otherKey: list.trellis.name.toLowerCase(),
            constraints: false,
            through: cross_table_name
        });
    }
}
function initialize_relationship(property, trellis, schema, tables, sequelize) {
    if (property.type.get_category() == vineyard_schema_1.Type_Category.trellis) {
        var reference = property;
        if (!reference.other_property)
            trellis['table'].belongsTo(reference.get_other_trellis()['table'], {
                foreignKey: reference.name,
                constraints: false
            });
    }
    else if (property.type.get_category() == vineyard_schema_1.Type_Category.list) {
        var list = property;
        if (list.other_property.type.get_category() == vineyard_schema_1.Type_Category.list) {
            initialize_many_to_many(list, trellis, schema, tables, sequelize);
        }
        else {
            trellis['table'].hasMany(list.get_other_trellis()['table'], {
                as: list.name,
                foreignKey: list.other_property.name,
                constraints: false
            });
        }
    }
}
function initialize_relationships(schema, tables, sequelize) {
    for (var name_1 in schema.trellises) {
        var trellis = schema.trellises[name_1];
        for (var i in trellis.properties) {
            var property = trellis.properties[i];
            initialize_relationship(property, trellis, schema, tables, sequelize);
        }
    }
}
function create_table(trellis, schema, sequelize) {
    var fields = {};
    // Create the primary key field first for DB UX
    var primary_key = fields[trellis.primary_key.name] = create_field(trellis.primary_key, schema.library);
    primary_key.primaryKey = true;
    primary_key.defaultValue = node_uuid.v4;
    for (var i in trellis.properties) {
        if (i == trellis.primary_key.name)
            continue;
        var property = trellis.properties[i];
        var field = create_field(property, schema.library);
        if (field) {
            fields[i] = field;
        }
    }
    var table = trellis['table'] = sequelize.define(trellis.name.toLowerCase(), fields, {
        underscored: true,
        createdAt: 'created',
        updatedAt: 'modified'
    });
    return table;
}
function vineyard_to_sequelize(schema, sequelize) {
    var tables = {};
    for (var name_2 in schema.trellises) {
        tables[name_2] = create_table(schema.trellises[name_2], schema, sequelize);
    }
    initialize_relationships(schema, tables, sequelize);
    return tables;
}
exports.vineyard_to_sequelize = vineyard_to_sequelize;
//# sourceMappingURL=database.js.map