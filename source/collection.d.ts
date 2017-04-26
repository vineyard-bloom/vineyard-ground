/// <reference types="es6-promise" />
import { Query } from './query';
import { Collection_Trellis } from './types';
export interface ICollection {
    get_sequelize(): any;
}
export declare class Collection<T> implements ICollection {
    private sequelize;
    private trellis;
    constructor(trellis: Collection_Trellis<T>, sequelize_model: any);
    create(seed: any): Promise<T>;
    create_or_update(seed: any): Promise<T>;
    update(seed: any, changes?: any): Promise<T>;
    all(): Query<T>;
    filter(options: any): Query<T>;
    first(options?: any): Query<T>;
    first_or_null(options?: any): Query<T>;
    get_sequelize(): any;
    get(identity: any): Query<T>;
}
