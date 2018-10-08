import { DatabaseClient, DatabaseServiceConfig, ITableClient, LegacyClient, LegacyDatabaseInterface, QueryResult } from "../types";
import { SequelizeClient, SequelizeModel } from "./sequelize-client";
import { Trellis } from 'vineyard-schema';
export declare class PostgresClient implements DatabaseClient {
    private pgPool;
    sequelizeClient: SequelizeClient;
    constructor(databaseConfig: DatabaseServiceConfig);
    getLegacyClient(): LegacyClient | undefined;
    getLegacyDatabaseInterface(): LegacyDatabaseInterface;
    query<T>(sql: string, args?: {
        [p: string]: any;
    }): PromiseLike<QueryResult<T>>;
    createTableInterface(trellis: Trellis, sequelizeModel: SequelizeModel): ITableClient;
}
