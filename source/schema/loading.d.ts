import { Library } from './library';
import { Trellis } from "../types";
export declare function setSnakeCaseTables(value: boolean): void;
export interface Property_Source {
    type: string;
    trellis?: string;
    nullable?: boolean;
    "default"?: any;
    defaultValue?: any;
    unique?: boolean;
    autoIncrement?: boolean;
}
export interface Table_Source {
    name?: string;
}
export interface Trellis_Source {
    primary_key?: string | string[];
    primaryKeys?: string[];
    primary?: string | string[];
    properties: {
        [name: string]: Property_Source;
    };
    additional?: any;
    parent?: string;
    table?: Table_Source;
    softDelete?: boolean;
}
export declare type Schema_Source = {
    [name: string]: Trellis_Source;
};
export declare function load_schema(definitions: Schema_Source, trellises: {
    [name: string]: Trellis;
}, library: Library): void;
