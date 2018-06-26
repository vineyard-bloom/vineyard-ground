
import {Library, Trellis_Type, Type_Category} from "../schema"
import {Property} from "../types";

export function getFieldType(property: Property, library: Library): any {
  const type = property.type
  switch (type.get_category()) {
    case Type_Category.primitive:

      if (type.name === library.types.long.name)
        return {
          name: 'BIGINT',
          defaultValue: '0'
        }

      if (type.name === library.types.int.name)
        return {
          name: 'INTEGER',
          defaultValue: '0'
        }

      if (type.name === library.types.string.name)
        return {
          name: 'CHARACTER VARYING(255)',
          defaultValue: "''"
        }

      if (type.name === library.types.text.name)
        return {
          name: 'TEXT'
        }

      if (type.name === library.types.json.name)
        return {name: 'JSON'}

      if (type.name === library.types.bool.name)
        return {
          name: 'BOOLEAN',
          defaultValue: 'false'
        }

      if (type.name === library.types.guid.name)
        return {
          name: 'UUID'
        }

      if (type.name === library.types.float.name)
        return {
          name: 'FLOAT',
          defaultValue: '0'
        }

      if (type.name === library.types.date.name)
        return {
          name: 'DATE'
        }

      if (type.name === library.types.char.name)
        return {
          name: 'CHAR'
        }

      if (type.name === library.types.datetime.name)
        return {
          name: 'TIMESTAMPZ'
        }

      if (type.name === library.types.time.name)
        return {
          name: 'TIME'
        }

      if (type.name === library.types.colossal.name)
        return {
          name: 'NUMERIC',
          defaultValue: '0'
        }

      if (type.name === library.types.bignumber.name)
        return {
          name: 'NUMERIC',
          defaultValue: '0'
        }

      if (type.name === library.types.short.name)
        return {
          name: 'SMALLINT',
          defaultValue: 0
        }

      throw new Error("Unknown primitive: " + type.name + '.')

    case Type_Category.list:
      return null

    case Type_Category.trellis:
      if (library.types[type.name]) {
        const field: any = (type as Trellis_Type).trellis.primary_keys[0]
        return getFieldType(field, library)
      }

      throw new Error("Unknown trellis reference: " + type.name + '.')

    default:
      throw Error("Invalid type category: " + type.get_category() + '.')
  }
}
