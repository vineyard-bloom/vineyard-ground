import { CollectionTrellis, DatabaseClient, SequelizeTables, TableClient } from './types';
export declare type ThenableCallback<N, O> = (result: O) => N | Promise<N>;
export interface QueryBuilder<T, O> {
    /**
     * Executes the query.  This is only needed when `then` may not be called.
     */
    exec(): Promise<O>;
    /**
     * Changes a returned foreign key field to be returned as an object instead of a scalar key value.
     *
     *
     * @param path   Path to the foreign key field to be expanded into an object
     */
    expand<T2, O2>(path: string): QueryBuilder<T2, O2>;
    /**
     * Filters a result set using a dictionary of key value pairs.
     * Maps to a SQL `WHERE` clause.
     * Currently this function only uses AND logic and does not support OR logic.
     * It also does not support null checks such as `WHERE field IS NULL`
     *
     * @param filters   Dictionary of key/value pairs
     */
    filter(options: any): QueryBuilder<T, T[]>;
    /**
     * Returns the first record in a result set
     *
     * @param filters   A dictionary of key/value pairs to filter the result set by
     */
    first(options?: any): QueryBuilder<T, T | undefined>;
    /**
     * Truncates a result set.
     * Maps to a SQL `LIMIT` clause.
     *
     * @param start   The offset of the truncation.
     *
     * @param length   The maximum number or records to return
     *
     */
    range(start?: number, length?: number): QueryBuilder<T, O>;
    select<T2, O2>(options: any): QueryBuilder<T2, O2>;
    /**
     * Sorts a result set.
     * Maps to a SQL `ORDER BY` clause
     *
     * Examples:
     *
     * Ship.all().sort(['speed'])
     *
     * Monster.all().sort(['height', 'desc', 'scariness'])
     *
     * @param args   An array of field names and optional 'asc' or 'desc' modifiers
     *
     *
     */
    sort(args: string[]): QueryBuilder<T, O>;
    /**
     * Executes the query and attaches a handler to the promise resolution.
     */
    then<N>(callback: ThenableCallback<N, O>): Promise<N>;
}
export declare class Query_Implementation<T, O> implements QueryBuilder<T, O> {
    private table;
    private client;
    private trellis;
    private options;
    private reduce_mode;
    private expansions;
    private allow_null;
    private bundle;
    private tables;
    constructor(tables: SequelizeTables, table: TableClient<T>, client: DatabaseClient, trellis: CollectionTrellis<T>);
    private set_reduce_mode;
    private get_other_collection;
    private expand_crossTable;
    private perform_expansion;
    private handle_expansions;
    private process_result;
    private process_result_with_expansions;
    private get_expansions;
    private has_expansions;
    private queryWithQueryGenerator;
    exec(): Promise<O>;
    expand<T2, O2>(path: string): QueryBuilder<T2, O2>;
    filter(filters: any): QueryBuilder<T, T[]>;
    first(filters?: any): QueryBuilder<T, T | undefined>;
    range(start?: number, length?: number): QueryBuilder<T, O>;
    select<T2, O2>(options: any): QueryBuilder<T2, O2>;
    sort(args: string[]): QueryBuilder<T, O>;
    then<N>(callback: ThenableCallback<N, O>): Promise<N>;
}
export declare function Path(path: string): any;
export declare function Sum(path: string): any;
export declare function Count(path: string): any;
