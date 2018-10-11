export declare enum Type_Category {
    incomplete = 0,
    decimal = 1,
    primitive = 2,
    list = 3,
    trellis = 4
}
export declare abstract class Type {
    name: string;
    constructor(name: string);
    abstract get_category(): Type_Category;
    abstract get_other_trellis_name(): string;
}
export declare class Primitive extends Type {
    constructor(name: string);
    get_category(): Type_Category;
    get_other_trellis_name(): string;
}
export declare type Precision = number[];
export declare class Decimal extends Primitive {
    precision: Precision;
    constructor(name: string, precision: Precision);
}
export declare class List_Type extends Type {
    child_type: Type;
    constructor(name: string, child_type: Type);
    get_category(): Type_Category;
    get_other_trellis_name(): string;
}
