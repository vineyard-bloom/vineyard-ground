import { Schema } from 'vineyard-schema';
import { Collection } from "./Collection";
export declare type Collection_Map = {
    [name: string]: Collection;
};
export declare class Model {
    private schema;
    private db;
    collections: Collection_Map;
    constructor(db: any, schema: Schema);
    sync_database(options?: any): any;
}
