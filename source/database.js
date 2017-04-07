"use strict";
var vineyard_schema_1 = require("vineyard-schema");
var Sequelize = require('sequelize');
var node_uuid = require('uuid');
function get_field(property, library) {
    var type = property.type;
    if (type.get_category() == vineyard_schema_1.Type_Category.primitive) {
        if (type === library.types.int) {
            return {
                type: Sequelize.INTEGER,
                defaultValue: 0
            };
        }
        if (type === library.types.string) {
            return {
                type: Sequelize.STRING,
                defaultValue: ""
            };
        }
        if (type === library.types.json) {
            return {
                type: Sequelize.JSON
            };
        }
        if (type === library.types.bool) {
            return {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            };
        }
        if (type === library.types.guid) {
            return {
                type: Sequelize.UUID
            };
        }
        if (type === library.types.float) {
            return {
                type: Sequelize.FLOAT,
                defaultValue: 0
            };
        }
        if (type === library.types.date) {
            return {
                type: Sequelize.DATE
            };
        }
    }
    else if (type.get_category() == vineyard_schema_1.Type_Category.list) {
        return null;
    }
    else if (type.get_category() == vineyard_schema_1.Type_Category.trellis) {
        if (library.types[type.name]) {
            return get_field(type.trellis.primary_key, library);
        }
    }
    throw Error("Not implemented or supported");
}
function create_field(property, library) {
    var field = get_field(property, library);
    if (field)
        field.allowNull = property.nullable;
    if (property.default !== undefined)
        field.defaultValue = property.default;
    return field;
}
function convert_relationship(property, trellis) {
    if (property.type.get_category() == vineyard_schema_1.Type_Category.trellis) {
        var reference = property;
        if (!reference.other_property)
            trellis['table'].belongsTo(reference.get_other_trellis()['table'], { foreignKey: reference.name, constraints: false });
    }
    else if (property.type.get_category() == vineyard_schema_1.Type_Category.list) {
        var list = property;
        trellis['table'].hasMany(list.get_other_trellis()['table'], {
            as: list.name,
            foreignKey: list.other_property.name,
            constraints: false
        });
    }
}
function vineyard_to_sequelize(schema, sequelize) {
    var result = {};
    for (var name_1 in schema.trellises) {
        var trellis = schema.trellises[name_1];
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
        var table = trellis['table'] = result[trellis.name] = sequelize.define(trellis.name, fields, {
            underscored: true,
            createdAt: 'created',
            updatedAt: 'modified',
            freezeTableName: true
        });
    }
    for (var name_2 in schema.trellises) {
        var trellis = schema.trellises[name_2];
        for (var i in trellis.properties) {
            var property = trellis.properties[i];
            convert_relationship(property, trellis);
        }
    }
    return result;
}
exports.vineyard_to_sequelize = vineyard_to_sequelize;
//# sourceMappingURL=database.js.map