import {Trellis} from "vineyard-schema"

export interface QueryOptions {
  where?: any
  order?: string[]
  limit?: number
  offset?: number
  attributes?: any
}

function delimit(tokens: Token[], delimiter: string): Token {
  let result = []
  for (let i = 0; i < tokens.length; ++i) {
    if (i > 0)
      result.push(delimiter)

    result.push(tokens[i])
  }

  return result
}

interface Arg {
  value: any
}

type Token = string | any[] | Arg

class Flattener {
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

export interface QueryBundle {
  sql: string
  args: any[]
}

export class QueryBuilder {
  trellis: Trellis
  table

  constructor(trellis: Trellis) {
    this.trellis = trellis;
    this.table = trellis['table']
  }

  private quote(text: string) {
    return '"' + text + '"'
  }

  private sanitize(value) {
    if (typeof value == 'string')
      return "'" + value + "'"

    return value
  }

  private buildWhere(where): Token {
    if (!where)
      return ''

    const conditions = []

    for (let i in where) {
      conditions.push([
        this.quote(i),
        '=',
        {value: where[i]}
      ])
    }

    return ['WHERE', delimit(conditions, 'AND')]
  }

  private buildOrderBy(order): Token {
    if (!order)
      return ''

    const tokens = []
    for (let item of order) {
      if (item == 'desc' || item == 'DESC') {
        tokens.push('DESC')
      }
      else if (item == 'asc' || item == 'ASC') {
        tokens.push('ASC')
      }
      else {
        if (tokens.length > 0)
          tokens[tokens.length - 1] += ','

        tokens.push(this.quote(item))
      }
    }

    return ['ORDER BY', tokens]
  }

  private buildRange(command, value): Token {
    if (!value)
      return ''

    if (typeof value != 'number')
      throw new Error("Range values must be numbers.")

    return [command, value.toString()]
  }

  private buildSelect(attributes) {
    return '*'
  }

  build(options: QueryOptions = {}): QueryBundle {
    const finalToken = [
      'SELECT',
      this.buildSelect(options.attributes),
      'FROM',
      this.quote(this.table.tableName),
      this.buildWhere(options.where),
      this.buildOrderBy(options.order),
      this.buildRange('LIMIT', options.limit),
      this.buildRange('OFFSET', options.offset),
    ]

    const flattener = new Flattener()
    const sql = flattener.flatten(finalToken)

    return {
      sql: sql,
      args: flattener.args
    }
  }
}
