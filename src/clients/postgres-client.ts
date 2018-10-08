import {
  DatabaseClient, DatabaseServiceConfig, ITableClient, LegacyClient, LegacyDatabaseInterface, QueryResult
} from "../types"
import {SequelizeClient, SequelizeModel} from "./sequelize-client";
import {Trellis} from 'vineyard-schema'

export class PostgresClient implements DatabaseClient {
  private pgPool: any

  // Used until PostgresClient fulfills all of the ground needs that Sequelize fulfills
  sequelizeClient: SequelizeClient

  constructor(databaseConfig: DatabaseServiceConfig) {
    this.sequelizeClient = new SequelizeClient(databaseConfig)

    const pg = require('pg')
    const pgConfig = Object.assign(databaseConfig, {
      user: databaseConfig.username
    })
    this.pgPool = new pg.Pool(pgConfig)
  }

  getLegacyClient(): LegacyClient | undefined {
    return undefined
  }

  getLegacyDatabaseInterface(): LegacyDatabaseInterface {
    return this.sequelizeClient.getLegacyDatabaseInterface()
  }

  query<T>(sql: string, args?: { [p: string]: any }): PromiseLike<QueryResult<T>> {
    return this.pgPool.query(sql, args)
  }

  createTableInterface(trellis: Trellis, sequelizeModel: SequelizeModel): ITableClient {
    return this.sequelizeClient.createTableInterface(trellis, sequelizeModel)
  }
}