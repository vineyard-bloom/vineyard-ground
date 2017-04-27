import { Schema } from 'vineyard-schema';
import { ICollection } from "./collection";
export declare type Collection_Map = {
    [name: string]: ICollection;
};
export declare class Modeler {
    private schema;
    private db;
    collections: Collection_Map;
    constructor(db: any, schema: Schema);
    sync_database(options?: any): any;
    regenerate(): any;
}
