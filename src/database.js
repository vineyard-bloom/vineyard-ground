"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vineyard_schema_1 = require("vineyard-schema");
const Sequelize = require('sequelize');
const node_uuid = require('uuid');
function get_field(property, library, dialect) {
    const type = property.type;
    switch (type.get_category()) {
        case vineyard_schema_1.TypeCategory.primitive:
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
            throw new Error('Unknown primitive: ' + type.name + '.');
        case vineyard_schema_1.TypeCategory.list:
            return null;
        case vineyard_schema_1.TypeCategory.trellis:
            if (library.types[type.name]) {
                const field = type.trellis.primary_keys[0];
                return get_field(field, library, dialect);
            }
            throw new Error('Unknown trellis reference: ' + type.name + '.');
        default:
            throw Error('Invalid type category: ' + type.get_category() + '.');
    }
}
function create_field(property, library, dialect) {
    const field = get_field(property, library, dialect);
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
    return trellises.map(t => t.table.name).sort().join('_');
}
function initialize_many_to_many(tables, list, trellis, schema, sequelize) {
    const table_trellises = [list.trellis, list.other_property.trellis];
    const cross_table_name = get_cross_table_name(table_trellises);
    const relationship = tables[trellis.table.name].belongsToMany(tables[list.get_other_trellis().table.name], {
        as: list.name,
        otherKey: list.other_property.trellis.name.toLowerCase(),
        foreignKey: list.trellis.name.toLowerCase(),
        constraints: false,
        through: cross_table_name
    });
    list.cross_table = relationship.through.model;
}
function initialize_relationship(tables, property, trellis, schema, sequelize) {
    if (property.type.get_category() == vineyard_schema_1.TypeCategory.trellis) {
        const reference = property;
        if (!reference.other_property) {
            const other_table = tables[reference.get_other_trellis().table.name];
            other_table.hasMany(tables[trellis.table.name], {
                foreignKey: reference.name,
                constraints: true
            });
        }
    }
    else if (property.type.get_category() == vineyard_schema_1.TypeCategory.list) {
        const list = property;
        if (list.other_property.type.get_category() == vineyard_schema_1.TypeCategory.list) {
            initialize_many_to_many(tables, list, trellis, schema, sequelize);
        }
        else {
            tables[trellis.table.name].hasMany(tables[list.get_other_trellis().table.name], {
                as: list.name,
                foreignKey: list.other_property.name,
                constraints: true
            });
        }
    }
}
function initialize_relationships(schema, tables, sequelize) {
    for (let name in schema.trellises) {
        const trellis = schema.trellises[name];
        for (let i in trellis.properties) {
            const property = trellis.properties[i];
            initialize_relationship(tables, property, trellis, schema, sequelize);
        }
    }
}
function create_table(trellis, schema, sequelize, tables) {
    const fields = {};
    // Create the primary key field first for DB UX
    for (let i = 0; i < trellis.primary_keys.length; ++i) {
        const property = trellis.primary_keys[i];
        const primary_key = fields[property.name] =
            create_field(property, schema.library, sequelize.getDialect());
        primary_key.primaryKey = true;
        if (property.type === schema.library.types.uuid) {
            primary_key.defaultValue = sequelize.getDialect() == 'mysql'
                ? () => node_uuid.v4().replace(/-/g, '')
                : node_uuid.v4;
        }
        else if (property.type === schema.library.types.int ||
            property.type === schema.library.types.long) {
            if (property.autoIncrement)
                primary_key.autoIncrement = true;
            delete primary_key.defaultValue;
        }
    }
    for (let i in trellis.properties) {
        if (trellis.primary_keys.some(k => k.name == i))
            continue;
        const property = trellis.properties[i];
        const field = create_field(property, schema.library, sequelize.getDialect());
        if (field) {
            fields[i] = field;
        }
    }
    let created = 'created';
    let modified = 'modified';
    const deleted = trellis.softDelete ? 'deleted' : false;
    if (trellis.additional && Array.isArray(trellis.additional.autoFields)) {
        const autoFields = trellis.additional.autoFields;
        if (autoFields.indexOf('created') == -1)
            created = false;
        if (autoFields.indexOf('modified') == -1)
            modified = false;
    }
    const indexArray = !trellis.table.indexes ? [] : trellis.table.indexes.map(index => ({
        fields: index.properties
    }));
    const oldTable = sequelize.define(trellis.table.name, fields, {
        underscored: true,
        createdAt: created,
        updatedAt: modified,
        deletedAt: deleted,
        paranoid: !!deleted,
        indexes: indexArray
    });
    tables[trellis.table.name] = oldTable;
    return oldTable;
}
function vineyard_to_sequelize(schema, keys, sequelize) {
    const tables = {};
    const oldTables = {};
    for (let name in keys) {
        tables[name] = create_table(schema.trellises[name], schema, sequelize, oldTables);
    }
    initialize_relationships(schema, oldTables, sequelize);
    return tables;
}
exports.vineyard_to_sequelize = vineyard_to_sequelize;
//# sourceMappingURL=database.js.map