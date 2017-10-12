import { ICollection } from "./collection";
import { CollectionTrellis, DatabaseClient, TableClient } from './types';
export declare type ThenableCallback<N, O> = (result: O) => N | Promise<N>;
export interface QueryBuilder<T, O> {
    exec(): Promise<O>;
    expand<T2, O2>(path: string): QueryBuilder<T2, O2>;
    filter(options: any): QueryBuilder<T, T[]>;
    first(options?: any): QueryBuilder<T, T | undefined>;
    join<T2, O2>(collection: ICollection): QueryBuilder<T2, O2>;
    range(start?: number, length?: number): QueryBuilder<T, O>;
    select<T2, O2>(options: any): QueryBuilder<T2, O2>;
    sort(args: string[]): QueryBuilder<T, O>;
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
    constructor(table: TableClient<T>, client: DatabaseClient, trellis: CollectionTrellis<T>);
    private set_reduce_mode(value);
    private get_other_collection(path);
    private expand_cross_table(reference, identity);
    private perform_expansion(path, data);
    private handle_expansions(results);
    private process_result(result);
    private process_result_with_expansions(result);
    private get_expansions();
    private has_expansions();
    private queryWithQueryGenerator();
    exec(): Promise<O>;
    expand<T2, O2>(path: string): QueryBuilder<T2, O2>;
    filter(options: any): QueryBuilder<T, T[]>;
    first(options?: any): QueryBuilder<T, T | undefined>;
    join<T2, O2>(collection: ICollection): QueryBuilder<T2, O2>;
    range(start?: number, length?: number): QueryBuilder<T, O>;
    select<T2, O2>(options: any): QueryBuilder<T2, O2>;
    sort(args: string[]): QueryBuilder<T, O>;
    then<N>(callback: ThenableCallback<N, O>): Promise<N>;
}
export declare function Path(path: string): any;
export declare function Sum(path: string): any;
export declare function Count(path: string): any;
