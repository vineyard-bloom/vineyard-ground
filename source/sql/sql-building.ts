import {Property, Trellis} from "../types"

export interface Arg {
  value: any
}

export type Token = string | any[] | Arg

export function delimit(tokens: Token[], delimiter: string): Token {
  let result = []
  for (let i = 0; i < tokens.length; ++i) {
    if (i > 0)
      result.push(delimiter)

    result.push(tokens[i])
  }

  return result
}

export function smartJoin(items: string[]) {
  let result = ''
  for (let i = 0; i < items.length; ++i) {
    if (i > 0) {
      const previous = items[i - 1]
      if (previous[previous.length - 1] != '\n')
        result += ' '
    }
    result += items[i]
  }

  return result
}

export class Flattener {
  args = []

  flatten(token: Token) {
    if (typeof token == 'string')
      return token

    if (Array.isArray(token)) {
      return smartJoin(token
        .map(t => this.flatten(t))
        .filter(t => t != '')
      )
    }

    if (typeof token == 'object') {
      this.args.push(token.value)
      return '$' + this.args.length
    }

    throw new Error("Invalid token type: " + typeof token)
  }
}

export class SqlBuilder {

  quote(text: string) {
    return '"' + text + '"'
  }

  sanitize(value) {
    if (typeof value == 'string')
      return "'" + value + "'"

    return value
  }

  flatten(token) {
    const flattener = new Flattener()
    const sql = flattener.flatten(token)

    return {
      sql: sql,
      args: flattener.args
    }
  }

  getPath(property: Property) {
    return property.trellis.table.name + '.' + this.quote(property.name)
  }

  getCrossTableName(property:Property) {
    return [property.trellis.table.name, property.get_other_trellis().table.name]
      .sort()
      .join('_')
  }
}

export class TrellisSqlBuilder {
  protected trellis: Trellis
  protected table
  protected builder: SqlBuilder = new SqlBuilder()

  constructor(trellis: Trellis) {
    this.trellis = trellis
    this.table = trellis.table
  }

  getTableName() {
    return this.table.name
  }
}