import {Trellis} from "../types"
import {delimit, Flattener, TrellisSqlGenerator, Token} from "./sql-building";

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

export class QueryGenerator extends TrellisSqlGenerator {

  constructor(trellis: Trellis) {
    super(trellis)
  }

  private buildWhere(where: any): Token {
    if (!where)
      return ''

    const conditions: any = []

    for (let i in where) {
      conditions.push([
        this.builder.quote(i),
        '=',
        {value: where[i]}
      ])
    }

    return ['WHERE', delimit(conditions, 'AND')]
  }

  private buildOrderBy(order: any): Token {
    if (!order)
      return ''

    const tokens: any = []
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

  private buildRange(command: string, value: any): Token {
    if (!value)
      return ''

    if (typeof value != 'number')
      throw new Error("Range values must be numbers.")

    return [command, value.toString()]
  }

  private buildSelect(attributes: any) {
    return '*'
  }

  generate(options: QueryOptions = {}): QueryBundle {
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
