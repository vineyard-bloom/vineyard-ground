import {Trellis} from "vineyard-schema"

export interface QueryOptions {
  where?: any
}

function quote(text: string) {
  return '"' + text + '"'
}

function sanitize(value) {
  if (typeof value == 'string')
    return "'" + value + "'"

  return value
}

export class QueryBuilder {
  trellis: Trellis
  table

  constructor(trellis: Trellis) {
    this.trellis = trellis;
    this.table = trellis['table']
  }

  private buildWhere(where): string {
    const conditions = []

    for (let i in where) {
      conditions.push(quote(i) + ' = ' + sanitize(where[i]))
    }

    return 'WHERE ' + conditions.join(' AND ')
  }

  build(options: QueryOptions = {}): string {
    const whereClause = options.where
      ? ' ' + this.buildWhere(options.where)
      : ''

    return 'SELECT * FROM ' + quote(this.table.tableName) + whereClause
  }
}
