
import {Property, Library, Trellis_Type, TypeCategory} from "vineyard-schema"

export function getFieldType(property: Property, library: Library): any {
  const type = property.type
  switch (type.get_category()) {
    case TypeCategory.primitive:

      if (type.name === library.types.Long.name)
        return {
          name: 'BIGINT',
          defaultValue: '0'
        }

      if (type.name === library.types.Int.name)
        return {
          name: 'INTEGER',
          defaultValue: '0'
        }

      if (type.name === library.types.String.name)
        return {
          name: 'CHARACTER VARYING(255)',
          defaultValue: "''"
        }

      if (type.name === library.types.Text.name)
        return {
          name: 'TEXT'
        }

      if (type.name === library.types.Json.name)
        return {name: 'JSON'}

      if (type.name === library.types.Bool.name)
        return {
          name: 'BOOLEAN',
          defaultValue: 'false'
        }

      if (type.name === library.types.Float.name)
        return {
          name: 'FLOAT',
          defaultValue: '0'
        }

      if (type.name === library.types.Date.name)
        return {
          name: 'DATE'
        }

      if (type.name === library.types.Datetime.name)
        return {
          name: 'TIMESTAMPZ'
        }

      if (type.name === library.types.Time.name)
        return {
          name: 'TIME'
        }

      if (type.name === library.types.BigNumber.name)
        return {
          name: 'NUMERIC',
          defaultValue: '0'
        }

      if (type.name === library.types.Short.name)
        return {
          name: 'SMALLINT',
          defaultValue: 0
        }

      throw new Error("Unknown primitive: " + type.name + '.')

    case TypeCategory.list:
      return null

    case TypeCategory.trellis:
      if (library.types[type.name]) {
        const field: any = (type as Trellis_Type).trellis.primary_keys[0]
        return getFieldType(field, library)
      }

      throw new Error("Unknown trellis reference: " + type.name + '.')

    default:
      throw Error("Invalid type category: " + type.get_category() + '.')
  }
}
