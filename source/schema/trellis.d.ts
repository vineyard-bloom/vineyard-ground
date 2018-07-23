import { Type, Type_Category } from './type';
import { Property, SequelizeTable, Table, Trellis } from "../types";
export declare class Trellis_Type extends Type {
    trellis: Trellis;
    constructor(name: string, trellis: Trellis);
    get_category(): Type_Category;
    get_other_trellis_name(): string;
}
export declare class StandardProperty implements Property {
    name: string;
    type: Type;
    trellis: Trellis;
    is_nullable: boolean;
    "default": any;
    is_unique: boolean;
    other_property: Property | undefined;
    constructor(name: string, type: Type, trellis: Trellis);
    get_path(): string;
    is_reference(): boolean;
    is_list(): boolean;
    get_other_trellis(): Trellis;
}
export declare class Reference extends StandardProperty {
    constructor(name: string, type: Type, trellis: Trellis, other_property?: Property);
}
export declare class TrellisImplementation implements Trellis {
    oldTable: SequelizeTable | undefined;
    table: Table;
    name: string;
    properties: {
        [name: string]: Property;
    };
    primary_keys: Property[];
    parent?: Trellis;
    collection: any;
    softDelete: boolean;
    private lists;
    additional: any;
    constructor(name: string, table: Table);
    get_lists(): Reference[];
    get_identity(data: any): any;
    getIdentity(data: any): any;
}
export declare function getIdentity(trellis: Trellis, data: any): any;
