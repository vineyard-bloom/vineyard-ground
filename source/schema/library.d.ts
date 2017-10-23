import { Type } from "./type";
export declare type Type_Map = {
    [name: string]: Type;
};
export declare class Library {
    types: Type_Map;
    constructor();
    add_type(type: Type): void;
}
