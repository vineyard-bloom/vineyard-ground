import { DatabaseClient, GeneralDatabaseConfig, LegacyClient, LegacyDatabaseInterface, QueryResult } from "../types";
import { SequelizeClient } from "./sequelize-client";
export declare class PostgresClient implements DatabaseClient {
    private pgPool;
    sequelizeClient: SequelizeClient;
    constructor(databaseConfig: GeneralDatabaseConfig);
    getLegacyClient(): LegacyClient | undefined;
    getLegacyDatabaseInterface(): LegacyDatabaseInterface;
    query<T>(sql: string, args?: {
        [p: string]: any;
    }): PromiseLike<QueryResult<T>>;
}
