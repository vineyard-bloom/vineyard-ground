export declare enum Operation_Type {
    add = 0,
    clear = 1,
    remove = 2,
}
export interface Operation {
    type: Operation_Type;
    item?: any;
}
export declare function Add(item: any): Operation;
export declare function Clear(): Operation;
export declare function Remove(item: any): Operation;
