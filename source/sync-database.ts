import {Schema, Property, Library, Type_Category, Trellis, Trellis_Type} from 'vineyard-schema'
import knex = require("knex");
const node_uuid = require('uuid')

function create_field(table: knex.TableBuilder, property: Property, library: Library): any {
  const type = property.type
  const name = property.name

  if (type.get_category() == Type_Category.primitive) {
    if (type === library.types.int) {
      return table.integer(name)
    }

    if (type === library.types.string) {
      return table.string(name)
    }

    if (type === library.types.json) {
      return table.json(name)
    }

    if (type === library.types.bool) {
      return table.boolean(name)
    }

    if (type === library.types.guid) {
      return table.uuid(name)
    }

    if (type === library.types.float) {
      return table.float(name)
    }

    if (type === library.types.date) {
      return table.date(name)
    }
  }
  else if (type.get_category() == Type_Category.list) {
    return null
  }
  else if (type.get_category() == Type_Category.trellis) {
    if (library.types[type.name]) {
      return create_field(table, (type as Trellis_Type).trellis.primary_key, library)
    }
  }

  throw Error("Not implemented or supported")
}

function create_table(chain, schema: Schema, name: string, trellis: Trellis) {
  return chain.createTable(name, table => {
    const primary_key = create_field(table, trellis.primary_key, schema.library)
      .primary()

    // primary_key.primaryKey = true
    // primary_key.defaultValue = node_uuid.v4

    for (let i in trellis.properties) {
      if (i == trellis.primary_key.name)
        continue

      const property = trellis.properties[i]
      table.smallint('test')
      // const field = create_field(table, property, schema.library)
    }
  })
}

function drop_tables(db: knex, schema: Schema) {
  let promise = Promise.resolve()

  for (let name in schema.trellises) {
    const trellis = schema.trellises [name]
    promise = promise.then(() => db.schema.dropTableIfExists(name)
    )
  }

  return promise
}

function create_tables(db: knex, schema: Schema) {
  let chain = db.schema
  for (let name in schema.trellises) {
    const trellis = schema.trellises [name]
    chain = create_table(chain, schema, name, trellis)
  }

  return chain
}

export function sync_database(db: knex, schema: Schema) {
  return drop_tables(db, schema)
    .then(() => create_tables(db, schema))

}