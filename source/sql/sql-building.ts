import {Trellis} from "../../../vineyard-schema/source/trellis";

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

export class Flattener {
  args = []

  flatten(token: Token) {
    if (typeof token == 'string')
      return token

    if (Array.isArray(token)) {
      return token
        .map(t => this.flatten(t))
        .filter(t => t != '')
        .join(' ')
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
}

export class TrellisSqlBuilder {
  protected trellis: Trellis
  protected table
  protected builder:SqlBuilder = new SqlBuilder()

  constructor(trellis: Trellis) {
    this.trellis = trellis;
    this.table = trellis['table']
  }

  getTableName() {
    return this.table.tableName
  }
}