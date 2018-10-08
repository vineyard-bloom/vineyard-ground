import { Schema, TrellisMap, Types, LibraryImplementation } from 'vineyard-schema';
import { SequelizeTables } from './types';
export declare class SchemaClass implements Schema {
    trellises: TrellisMap;
    library: LibraryImplementation;
    tables: SequelizeTables;
    constructor(definitions?: any);
    define(definitions: any): void;
    add_type(type: Types): void;
}
