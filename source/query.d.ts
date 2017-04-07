/// <reference types="es6-promise" />
/// <reference types="sequelize" />
import { Trellis } from "vineyard-schema";
import { ICollection } from "./collection";
import * as sequelize from 'sequelize';
export interface Query<T> {
    then(any: any): Promise<any>;
    exec(): Promise<any>;
    filter(options: any): Query<T>;
    join<N>(collection: ICollection): Query<N>;
    select<N>(options: any): Query<N>;
}
export declare class Query_Implementation<T> implements Query<T> {
    private sequelize;
    private trellis;
    private options;
    private reduce_mode;
    private set_reduce_mode(value);
    constructor(sequelize: any, trellis: Trellis);
    exec(): Promise<any>;
    then(callback: any): Promise<any>;
    filter(options: any): Query<T>;
    join(collection: ICollection): Query<T>;
    select<N>(options: any): Query<N>;
    first<N>(): Query<N>;
}
export declare function Path(path: any): sequelize.col;
export declare function Sum(path: any): sequelize.fn;
export declare function Count(path: any): sequelize.fn;
