/// <reference types="sequelize" />
import { ICollection } from "./collection";
import * as sequelize from 'sequelize';
import { Collection_Trellis } from './types';
export interface Query<T> {
    then(any: any): Promise<any>;
    exec(): Promise<any>;
    expand<T2>(path: string): Query<T2>;
    filter(options: any): Query<T>;
    first(options?: any): Query<T>;
    first_or_null(options?: any): Query<T>;
    firstOrNull(options?: any): Query<T>;
    join<N>(collection: ICollection): Query<N>;
    select<N>(options: any): Query<N>;
    range(start?: number, length?: number): Query<T>;
    sort(args: string[]): Query<T>;
}
export declare class Query_Implementation<T> implements Query<T> {
    private sequelize;
    private trellis;
    private options;
    private reduce_mode;
    private expansions;
    private allow_null;
    private bundle;
    private set_reduce_mode(value);
    private get_other_collection(path);
    private expand_cross_table(reference, identity);
    private perform_expansion(path, data);
    private handle_expansions(results);
    private process_result(result);
    private process_result_with_expansions(result);
    private get_expansions();
    private has_expansions();
    constructor(sequelize: any, trellis: Collection_Trellis<T>);
    private queryWithQueryBuilder();
    exec(): Promise<any>;
    then(callback: any): Promise<any>;
    filter(options: any): Query<T>;
    join(collection: ICollection): Query<T>;
    select<N>(options: any): Query<N>;
    first<N>(options?: any): Query<N>;
    first_or_null<N>(options?: any): Query<N>;
    firstOrNull<N>(options?: any): Query<N>;
    range(start?: number, length?: number): Query<T>;
    sort(args: string[]): Query<T>;
    expand<T2>(path: string): Query<T2>;
}
export declare function Path(path: any): sequelize.col;
export declare function Sum(path: any): sequelize.fn;
export declare function Count(path: any): sequelize.fn;
