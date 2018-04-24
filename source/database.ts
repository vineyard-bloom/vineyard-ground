import {Type_Category, Trellis_Type, Library} from "./schema"

const Sequelize = require('sequelize')
import {Table_Trellis, Trellis, Property, Schema, Table} from "./types";
import {SequelizeModel, SequelizeModelMap} from "./clients/sequelize-client";
import {to_lower_snake_case} from "./utility";

const node_uuid = require('uuid')

function get_field(property: Property, library: Library, dialect: string): any {
  const type = property.type
  switch (type.get_category()) {
    case Type_Category.primitive:

      if (type === library.types.long)
        return {
          type: Sequelize.BIGINT,
          defaultValue: 0
        }

      if (type === library.types.int)
        return {
          type: Sequelize.INTEGER,
          defaultValue: 0
        }

      if (type === library.types.string)
        return {
          type: Sequelize.STRING,
          defaultValue: ""
        }

      if (type === library.types.text)
        return {
          type: Sequelize.TEXT
        }

      if (type === library.types.json)
        return dialect == 'mysql'
          ? {type: Sequelize.TEXT}
          : {type: Sequelize.JSON}

      if (type === library.types.bool)
        return {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }

      if (type === library.types.guid)
        return {
          type: Sequelize.UUID
        }

      if (type === library.types.float)
        return {
          type: Sequelize.FLOAT,
          defaultValue: 0
        }

      if (type === library.types.date)
        return {
          type: Sequelize.DATEONLY
        }

      if (type === library.types.datetime)
        return {
          type: Sequelize.DATE
        }

      if (type === library.types.time)
        return {
          type: Sequelize.TIME
        }

      if (type === library.types.colossal)
        return {
          type: Sequelize.NUMERIC,
          defaultValue: 0
        }

      if (type === library.types.bignumber)
        return {
          type: Sequelize.NUMERIC,
          defaultValue: 0
        }

      if (type === library.types.char)
        return {
          type: Sequelize.CHAR,
          defaultValue: ""
        }

      if (type === library.types.short)
        return {
          type: Sequelize.SMALLINT,
          defaultValue: 0
        }

      throw new Error("Unknown primitive: " + type.name + '.')

    case Type_Category.list:
      return null

    case Type_Category.trellis:
      if (library.types[type.name]) {
        const field: any = (type as Trellis_Type).trellis.primary_keys[0]
        return get_field(field, library, dialect)
      }

      throw new Error("Unknown trellis reference: " + type.name + '.')

    default:
      throw Error("Invalid type category: " + type.get_category() + '.')
  }
}

function create_field(property: Property, library: Library, dialect: string): any {
  const field = get_field(property, library, dialect)
  if (!field)
    return null

  if (property.length)
    field.type = field.type(property.length)

  field.allowNull = property.is_nullable

  if (property.default !== undefined)
    field.defaultValue = property.default

  if (property.is_unique)
    field.unique = true

  return field
}

function get_cross_table_name(trellises: Trellis []) {
  return trellises.map(t => t.oldTable.getTableName()).sort().join('_')
}

function initialize_many_to_many(list: Property, trellis: Trellis, schema: Schema, tables: any, sequelize: any) {
  const table_trellises = [list.trellis, list.other_property.trellis]
  const cross_table_name = get_cross_table_name(table_trellises)

  const relationship = trellis.oldTable.belongsToMany(list.get_other_trellis().oldTable, {
    as: list.name,
    otherKey: list.other_property.trellis.name.toLowerCase(),
    foreignKey: list.trellis.name.toLowerCase(),
    constraints: false,
    through: cross_table_name
  })

  list.cross_table = relationship.through.model
}

function initialize_relationship(property: Property, trellis: Trellis, schema: Schema, tables: any, sequelize: any) {
  if (property.type.get_category() == Type_Category.trellis) {
    const reference = property as Property
    if (!reference.other_property) {
      const other_table = reference.get_other_trellis().oldTable
      other_table.hasMany(trellis.oldTable, {
        foreignKey: reference.name,
        constraints: true
      })
    }
  }
  else if (property.type.get_category() == Type_Category.list) {
    const list = property as Property
    if (list.other_property.type.get_category() == Type_Category.list) {
      initialize_many_to_many(list, trellis, schema, tables, sequelize)
    }
    else {
      trellis.oldTable.hasMany(list.get_other_trellis().oldTable, {
        as: list.name,
        foreignKey: list.other_property.name,
        constraints: true
      })
    }
  }
}

function initialize_relationships(schema: Schema, tables: any, sequelize: any) {
  for (let name in schema.trellises) {
    const trellis = schema.trellises [name]
    for (let i in trellis.properties) {
      const property = trellis.properties [i]
      initialize_relationship(property, trellis, schema, tables, sequelize)
    }
  }
}

function create_table(trellis: Trellis, schema: Schema, sequelize: any) {
  const fields: { [T: string]: Property } = {}

  // Create the primary key field first for DB UX
  for (let i = 0; i < trellis.primary_keys.length; ++i) {
    const property = trellis.primary_keys[i]
    const primary_key = fields[property.name] =
      create_field(property, schema.library, sequelize.getDialect())

    primary_key.primaryKey = true
    if (property.type === schema.library.types.uuid) {
      primary_key.defaultValue = sequelize.getDialect() == 'mysql'
        ? () => node_uuid.v4().replace(/-/g, '')
        : node_uuid.v4
    }
    else if (property.type === schema.library.types.int ||
      property.type === schema.library.types.long) {
      if (property.autoIncrement !== false)
        primary_key.autoIncrement = true

      delete primary_key.defaultValue
    }
  }

  for (let i in trellis.properties) {
    if (trellis.primary_keys.some(k => k.name == i))
      continue

    const property = trellis.properties[i]
    const field = create_field(property, schema.library, sequelize.getDialect())
    if (field) {
      fields[i] = field
    }
  }

  let created: string | boolean = 'created'
  let modified: string | boolean = 'modified'
  const deleted: string | boolean = trellis.softDelete ? 'deleted' : false

  if (trellis.additional && Array.isArray(trellis.additional.autoFields)) {
    const autoFields = trellis.additional.autoFields
    if (autoFields.indexOf('created') == -1)
      created = false

    if (autoFields.indexOf('modified') == -1)
      modified = false
  }

  const oldTable = trellis.oldTable = sequelize.define(trellis.table.name, fields, {
    underscored: true,
    createdAt: created,
    updatedAt: modified,
    deletedAt: deleted,
    paranoid: !!deleted,
    // Create Sequelize indexes
    indexes: [{
      unique: true,
      fields: trellis.table.indexes
    }]
  })

  return oldTable
}

export function vineyard_to_sequelize(schema: Schema, keys: any, sequelize: any): SequelizeModelMap {
  const tables: { [key: string]: SequelizeModel } = {}

  for (let name in keys) {
    tables [name] = create_table(schema.trellises [name], schema, sequelize)
  }

  initialize_relationships(schema, tables, sequelize)

  return tables
}
