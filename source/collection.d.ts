import { QueryBuilder } from './query';
import { CollectionTrellis, DatabaseClient, TableClient, Trellis } from './types';
export interface ICollection {
    getTrellis(): Trellis;
}
export declare class Collection<T> implements ICollection {
    private table;
    private client;
    private trellis;
    constructor(trellis: CollectionTrellis<T>, table: TableClient<T>, client: DatabaseClient);
    getTrellis(): CollectionTrellis<T>;
    getTableClient(): TableClient<T>;
    create(seed: any): Promise<T>;
    create_or_update(seed: any): Promise<T>;
    update(seed: any, changes?: any): Promise<T>;
    remove(seed: any): Promise<T>;
    all(): QueryBuilder<T, T[]>;
    filter(options: any): QueryBuilder<T, T[]>;
    first(options?: any): QueryBuilder<T, T | undefined>;
    get(identity: any): QueryBuilder<T, T | undefined>;
}
