import { Schema } from 'vineyard-schema';
import { ICollection } from "./collection";
export declare type Collection_Map = {
    [name: string]: ICollection;
};
export declare class Modeler {
    private schema;
    private db;
    collections: Collection_Map;
    devMode: boolean;
    constructor(db: any, schema: Schema | any, devMode?: boolean);
    regenerate(): any;
    query(sql: any, replacements?: any): any;
    querySingle(sql: any, replacements?: any): any;
}
