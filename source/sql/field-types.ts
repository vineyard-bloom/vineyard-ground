
import {Property, Library, Trellis_Type, Type_Category} from "vineyard-schema"

export function getFieldType(property: Property, library: Library): any {
  const type = property.type
  switch (type.get_category()) {
    case Type_Category.primitive:

      if (type === library.types.long)
        return {
          name: 'BIGINT',
          defaultValue: 0
        }

      if (type === library.types.int)
        return {
          name: 'INTEGER',
          defaultValue: 0
        }

      if (type === library.types.string)
        return {
          name: 'CHARACTER VARYING(255)',
          defaultValue: ""
        }

      if (type === library.types.text)
        return {
          name: 'TEXT'
        }

      if (type === library.types.json)
        return {name: 'JSON'}

      if (type === library.types.bool)
        return {
          name: 'BOOLEAN',
          defaultValue: false
        }

      if (type === library.types.guid)
        return {
          name: 'UUID'
        }

      if (type === library.types.float)
        return {
          name: 'FLOAT',
          defaultValue: 0
        }

      if (type === library.types.date)
        return {
          name: 'DATEONLY'
        }

      if (type === library.types.datetime)
        return {
          name: 'DATE'
        }

      if (type === library.types.time)
        return {
          name: 'TIME'
        }

      if (type === library.types.colossal)
        return {
          name: 'NUMERIC',
          defaultValue: 0
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
