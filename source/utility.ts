import {Trellis} from "./types";
import {BigNumber} from "bignumber.js"

export function to_lower_snake_case(text: string) {
  if (text.length == 1)
    return text

  const result = text[0].toLowerCase() + text.substr(1).replace(/[A-Z]+/g, i => '_' + i.toLowerCase())
  return result
}

export function to_lower(text: string) {
  return text[0].toLowerCase() + text.substr(1)
}

export function processFields(result: any, trellis: Trellis) {
  if (trellis.oldTable.sequelize.getDialect() == 'mysql') {
    for (let i in trellis.properties) {
      const property = trellis.properties[i]
      if (property.type.name == 'json') {
        result[i] = JSON.parse(result[i])
      }
    }
  }

  for (let i in trellis.properties) {
    const property = trellis.properties[i]
    switch (property.type.name) {
      case 'long':
        result[i] = parseInt(result[i])
        break

      case 'bignumber':
      case 'colossal':
        result[i] = new BigNumber(result[i])
        break

      case 'datetime':
      case 'date': {
        const value = result[i]
        if (value && typeof value === 'string')
          result[i] = new Date(value)

        break
      }
    }
  }
  return result
}
