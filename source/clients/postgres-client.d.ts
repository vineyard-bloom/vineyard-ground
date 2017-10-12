import { DatabaseClient, GeneralDatabaseConfig, LegacyClient, QueryResult } from "../types";
export declare class PostgresClient implements DatabaseClient {
    private pgPool;
    constructor(databaseConfig: GeneralDatabaseConfig);
    getLegacyClient(): LegacyClient | undefined;
    query<T>(sql: string, args?: {
        [p: string]: any;
    }): PromiseLike<QueryResult<T>>;
}
