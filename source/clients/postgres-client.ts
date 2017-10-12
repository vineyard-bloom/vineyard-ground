import {DatabaseClient, GeneralDatabaseConfig, LegacyClient, QueryResult} from "../types"

export class PostgresClient implements DatabaseClient {
  private pgPool: any

  constructor(databaseConfig:GeneralDatabaseConfig) {
    const pg = require('pg')
    const pgConfig = Object.assign(databaseConfig, {
      user: databaseConfig.username
    })
    this.pgPool = new pg.Pool(pgConfig)
  }

  getLegacyClient(): LegacyClient | undefined {
    return undefined
  }

  query<T>(sql: string, args?: { [p: string]: any }): PromiseLike<QueryResult<T>> {
    return this.pgPool.query(sql, args)
  }
}