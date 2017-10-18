import { DatabaseClient, GeneralDatabaseConfig, ITableClient, LegacyClient, LegacyDatabaseInterface, QueryResult, Trellis } from "../types";
import { SequelizeClient, SequelizeModel } from "./sequelize-client";
export declare class PostgresClient implements DatabaseClient {
    private pgPool;
    sequelizeClient: SequelizeClient;
    constructor(databaseConfig: GeneralDatabaseConfig);
    getLegacyClient(): LegacyClient | undefined;
    getLegacyDatabaseInterface(): LegacyDatabaseInterface;
    query<T>(sql: string, args?: {
        [p: string]: any;
    }): PromiseLike<QueryResult<T>>;
    createTableInterface(trellis: Trellis, sequelizeModel: SequelizeModel): ITableClient;
}
