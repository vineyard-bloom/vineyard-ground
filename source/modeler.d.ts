import { Schema } from 'vineyard-schema';
import { ICollection } from "./collection";
export declare type Collection_Map = {
    [name: string]: ICollection;
};
export declare class Modeler {
    private schema;
    protected db: any;
    collections: Collection_Map;
    constructor(db: any, schema: Schema | any);
    query(sql: any, replacements?: any): any;
    querySingle(sql: any, replacements?: any): any;
    addDefinitions(definitions: any): void;
}
export declare class DevModeler extends Modeler {
    regenerate(): any;
}
