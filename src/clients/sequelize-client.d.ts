import { DatabaseClient, DatabaseConfig, ITableClient, LegacyClient, LegacyDatabaseInterface, QueryResult, RemoveOptions, TableClient } from "../types";
import { Trellis } from 'vineyard-schema';
export interface SequelizeModel {
    create: any;
    update: any;
    upsert: any;
    remove: any;
}
export declare type SequelizeModelMap = {
    [key: string]: SequelizeModel;
};
export declare class SequelizeLegacyClient implements LegacyClient {
    findAll(table: ITableClient, options: any): any;
}
export declare class SequelizeClient implements DatabaseClient {
    private sequelize;
    private legacyClient;
    constructor(databaseConfig: DatabaseConfig);
    getLegacyClient(): LegacyClient | undefined;
    getLegacyDatabaseInterface(): LegacyDatabaseInterface;
    query<T>(sql: string, args?: {
        [p: string]: any;
    }): PromiseLike<QueryResult<T>>;
    createTableInterface(trellis: Trellis, sequelizeModel: SequelizeModel): ITableClient;
}
export declare class SequelizeTableClient<T> implements TableClient<T> {
    private client;
    private sequelizeModel;
    constructor(client: SequelizeClient, sequelizeModel: any);
    getClient(): DatabaseClient;
    create(newSeed: T): Promise<T>;
    upsert(newSeed: T): Promise<T>;
    update(seed: any | T, filter?: Partial<T>): Promise<T>;
    remove(options: RemoveOptions): Promise<any>;
    getSequelizeModel(): any;
}
