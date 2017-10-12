import { DatabaseClient, ITableClient, LegacyClient, QueryResult, RemoveOptions, TableClient } from "../types";
export interface SequelizeModel {
    create: any;
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
    constructor(sequelize: any);
    getLegacyClient(): LegacyClient | undefined;
    query<T>(sql: string, args?: {
        [p: string]: any;
    }): PromiseLike<QueryResult<T>>;
}
export declare class SequelizeTableClient<T> implements TableClient<T> {
    private client;
    private sequelizeModel;
    constructor(client: SequelizeClient, sequelizeModel: any);
    getClient(): DatabaseClient;
    create(newSeed: T): Promise<T>;
    upsert(newSeed: T): Promise<T>;
    remove(options: RemoveOptions): Promise<any>;
    getSequelizeModel(): any;
}
