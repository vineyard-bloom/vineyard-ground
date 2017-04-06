/// <reference types="es6-promise" />
import { Trellis } from 'vineyard-schema';
export declare class Collection {
    trellis: Trellis;
    sequelize_model: any;
    constructor(trellis: Trellis, sequelize_model: any);
    create(seed: any): Promise<any>;
}
