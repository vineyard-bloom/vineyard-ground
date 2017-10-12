import {DatabaseClient, ITableClient, LegacyClient, QueryResult, RemoveOptions, TableClient} from "../types";

export interface SequelizeModel {
  create: any
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

  constructor(sequelize: any) {
    this.sequelize = sequelize
    this.legacyClient = new SequelizeLegacyClient()
  }

  getLegacyClient(): LegacyClient | undefined {
    return this.legacyClient
  }

  query<T>(sql: string, args?: { [p: string]: any }): PromiseLike<QueryResult<T>> {
    return this.sequelize.query(sql, {replacements: args})
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
    return this.sequelizeModel.create((newSeed as any).dataValues)
  }

  upsert(newSeed: T): Promise<T> {
    return this.sequelizeModel.upsert(newSeed)
  }

  remove(options: RemoveOptions): Promise<any> {
    return this.sequelizeModel.destroy(options)
  }

  getSequelizeModel(): any {
    return this.sequelizeModel
  }
}