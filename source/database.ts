import {Property, Type_Category, Reference, Trellis_Type, Trellis, Library, Schema} from "vineyard-schema"
import * as Sequelize from 'sequelize'
import {Table_Trellis} from "./types";

const node_uuid = require('uuid')

function get_field(property: Property, library: Library): any {
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

      if (type === library.types.json)
        return {
          type: Sequelize.JSON
        }

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

      throw new Error("Unknown primitive: " + type.name + '.')

    case Type_Category.list:
      return null

    case Type_Category.trellis:
      if (library.types[type.name]) {
        return get_field((type as Trellis_Type).trellis.primary_key, library)
      }

      throw new Error("Unknown trellis reference: " + type.name + '.')

    default:
      throw Error("Invalid type category: " + type.get_category() + '.')
  }
}

function create_field(property: Property, library: Library): any {
  const field = get_field(property, library)
  if (!field)
    return null

  field.allowNull = property.is_nullable

  if (property.default !== undefined)
    field.defaultValue = property.default

  if (property.is_unique)
    field.unique = true

  return field
}

function get_cross_table_name(trellises: Trellis []) {
  return trellises.map(t => t['table'].getTableName()).sort().join('_')
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

function initialize_many_to_many(list: Reference, trellis: Trellis, schema: Schema, tables, sequelize) {
  const table_trellises = [list.trellis, list.other_property.trellis]
  const cross_table_name = get_cross_table_name(table_trellises)

  // if (!tables [cross_table_name]) {
  // const cross_table = create_cross_table(cross_table_name, table_trellises, tables, schema.library, sequelize)

  const relationship = trellis['table'].belongsToMany(list.get_other_trellis()['table'], {
    as: list.name,
    otherKey: list.other_property.trellis.name.toLowerCase(),
    foreignKey: list.trellis.name.toLowerCase(),
    constraints: false,
    through: cross_table_name
  })
  // tables [cross_table_name] = relationship.through.model
  // }

  // list['cross_table'] = tables [cross_table_name]
  list['cross_table'] = relationship.through.model
}

function initialize_relationship(property: Property, trellis: Trellis, schema: Schema, tables, sequelize) {
  if (property.type.get_category() == Type_Category.trellis) {
    const reference = property as Reference
    if (!reference.other_property) {
      const other_table = reference.get_other_trellis()['table']
      other_table.hasMany(trellis['table'], {
        foreignKey: reference.name,
        constraints: true
      })
    }
    // trellis['table'].belongsTo(reference.get_other_trellis()['table'], {
    //   foreignKey: reference.name,
    //   constraints: false
    // })
  }
  else if (property.type.get_category() == Type_Category.list) {
    const list = property as Reference
    if (list.other_property.type.get_category() == Type_Category.list) {
      initialize_many_to_many(list, trellis, schema, tables, sequelize)
    }
    else {
      trellis['table'].hasMany(list.get_other_trellis()['table'], {
        as: list.name,
        foreignKey: list.other_property.name,
        constraints: true
      })
    }
  }
}

function initialize_relationships(schema: Schema, tables, sequelize) {
  for (let name in schema.trellises) {
    const trellis = schema.trellises [name]
    for (let i in trellis.properties) {
      const property = trellis.properties [i]
      initialize_relationship(property, trellis, schema, tables, sequelize)
    }
  }

}

function create_table(trellis: Trellis, schema: Schema, sequelize) {
  const fields = {}

  // Create the primary key field first for DB UX
  const primary_key = fields[trellis.primary_key.name] = create_field(trellis.primary_key, schema.library)
  primary_key.primaryKey = true
  if (trellis.primary_key.type === schema.library.types.uuid) {
    primary_key.defaultValue = node_uuid.v4
  }
  else if (trellis.primary_key.type === schema.library.types.int ||
    trellis.primary_key.type === schema.library.types.long) {
    primary_key.autoIncrement = true
    delete primary_key.defaultValue
  }

  for (let i in trellis.properties) {
    if (i == trellis.primary_key.name)
      continue

    const property = trellis.properties[i]
    const field = create_field(property, schema.library)
    if (field) {
      fields[i] = field
    }
  }

  const table = trellis['table'] = sequelize.define(trellis.name.toLowerCase(), fields, {
    underscored: true,
    createdAt: 'created',
    updatedAt: 'modified'
    // freezeTableName: true
  })

  return table
}

export function vineyard_to_sequelize(schema: Schema, sequelize) {
  const tables = {}

  for (let name in schema.trellises) {
    tables [name] = create_table(schema.trellises [name], schema, sequelize)
  }

  initialize_relationships(schema, tables, sequelize)

  return tables
}