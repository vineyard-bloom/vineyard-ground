import {
  DatabaseClient, DatabaseConfig, ITableClient, LegacyClient, LegacyDatabaseInterface, QueryResult, RemoveOptions,
  TableClient, Trellis
} from "../types";

const sequelize = require("sequelize")

export interface SequelizeModel {
  create: any
  update: any
  upsert: any
  remove: any
}

export type SequelizeModelMap = { [key: string]: SequelizeModel }

export class SequelizeLegacyClient implements LegacyClient {

  findAll(table: ITableClient, options: any): any {
    return (table as any).getSequelizeModel().findAll(options)
  }
}

export class SequelizeClient implements DatabaseClient {
  private sequelize: any
  private legacyClient: LegacyClient

  constructor(databaseConfig: DatabaseConfig) {
    this.sequelize = new sequelize(databaseConfig)
    this.legacyClient = new SequelizeLegacyClient()
  }

  getLegacyClient(): LegacyClient | undefined {
    return this.legacyClient
  }

  getLegacyDatabaseInterface(): LegacyDatabaseInterface {
    return this.sequelize
  }

  query<T>(sql: string, args?: { [p: string]: any }): PromiseLike<QueryResult<T>> {
    return this.sequelize.query(sql, {replacements: args})
  }

  createTableInterface(trellis: Trellis, sequelizeModel: SequelizeModel): ITableClient {
    return new SequelizeTableClient(this, sequelizeModel)
  }
}

export class SequelizeTableClient<T> implements TableClient<T> {
  private client: SequelizeClient
  private sequelizeModel: any

  constructor(client: SequelizeClient, sequelizeModel: any) {
    this.client = client;
    this.sequelizeModel = sequelizeModel;
  }

  getClient(): DatabaseClient {
    return this.client
  }

  create(newSeed: T): Promise<T> {
    return this.sequelizeModel.create(newSeed)
  }

  upsert(newSeed: T): Promise<T> {
    return this.sequelizeModel.upsert(newSeed)
  }

  update(seed: any | T, filter?: Partial<T>): Promise<T> {
    return this.sequelizeModel.update(seed, {
      where: filter,
      returning: true
    })
  }

  remove(options: RemoveOptions): Promise<any> {
    return this.sequelizeModel.destroy(options)
  }

  getSequelizeModel(): any {
    return this.sequelizeModel
  }
}