import { ICollection } from "./collection";
import { DatabaseClient } from "./types";
import { SchemaClass } from './scheming';
export declare type Collection_Map = {
    [name: string]: ICollection;
};
export declare class Modeler {
    private schema;
    protected db: any;
    collections: Collection_Map;
    private client;
    constructor(schema: SchemaClass | any, client: DatabaseClient);
    query(sql: string, replacements?: any): any;
    querySingle(sql: string, replacements?: any): any;
    addDefinitions(definitions: any): void;
    getLegacyDatabaseInterface(): any;
}
export declare class DevModeler extends Modeler {
    regenerate(): any;
}
