import { ICollection } from "./collection";
import { Collection_Trellis } from './types';
export declare type ThenableCallback<N, O> = (result: O) => N;
export interface Query<T, O> {
    exec(): Promise<O>;
    expand<T2, O2>(path: string): Query<T2, O2>;
    filter(options: any): Query<T, T[]>;
    first(options?: any): Query<T, T | undefined>;
    firstOrNull(options?: any): Query<T, T | undefined>;
    join<T2, O2>(collection: ICollection): Query<T2, O2>;
    range(start?: number, length?: number): Query<T, O>;
    select<T2, O2>(options: any): Query<T2, O2>;
    sort(args: string[]): Query<T, O>;
    then<N>(callback: ThenableCallback<N, O>): Promise<N>;
    then<N>(callback: ThenableCallback<Promise<N>, O>): Promise<N>;
}
export declare class Query_Implementation<T, O> implements Query<T, O> {
    private sequelize;
    private trellis;
    private options;
    private reduce_mode;
    private expansions;
    private allow_null;
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
    exec(): Promise<O>;
    expand<T2, O2>(path: string): Query<T2, O2>;
    filter(options: any): Query<T, T[]>;
    first(options?: any): Query<T, T | undefined>;
    firstOrNull(options?: any): Query<T, T | undefined>;
    join<T2, O2>(collection: ICollection): Query<T2, O2>;
    range(start?: number, length?: number): Query<T, O>;
    select<T2, O2>(options: any): Query<T2, O2>;
    sort(args: string[]): Query<T, O>;
    then<N>(callback: ThenableCallback<N, O>): Promise<N>;
}
export declare function Path(path: string): any;
export declare function Sum(path: string): any;
export declare function Count(path: string): any;
