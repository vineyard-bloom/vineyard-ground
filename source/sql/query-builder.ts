import {Trellis} from "vineyard-schema"
import {delimit, Flattener, TrellisSqlBuilder, Token} from "./sql-building";

export interface QueryOptions {
  where?: any
  order?: string[]
  limit?: number
  offset?: number
  attributes?: any
}

export interface QueryBundle {
  sql: string
  args: any[]
}

export class QueryBuilder extends TrellisSqlBuilder {

  constructor(trellis: Trellis) {
    super(trellis)
  }

  private buildWhere(where): Token {
    if (!where)
      return ''

    const conditions = []

    for (let i in where) {
      conditions.push([
        this.builder.quote(i),
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

        tokens.push(this.builder.quote(item))
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
      this.builder.quote(this.getTableName()),
      this.buildWhere(options.where),
      this.buildOrderBy(options.order),
      this.buildRange('LIMIT', options.limit),
      this.buildRange('OFFSET', options.offset),
    ]

    return this.builder.flatten(finalToken)
  }
}