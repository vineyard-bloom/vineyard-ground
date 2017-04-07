/// <reference types="es6-promise" />
import { Trellis } from 'vineyard-schema';
import { Query } from './query';
export interface ICollection {
    get_sequelize(): any;
}
export declare class Collection<T> implements ICollection {
    private sequelize;
    private trellis;
    constructor(trellis: Trellis, sequelize_model: any);
    create(seed: any): Promise<T>;
    update(seed: any, changes?: any): Promise<T>;
    all(): Query<T>;
    filter(options: any): Query<T>;
    get_sequelize(): any;
}
