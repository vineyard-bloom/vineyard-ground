export declare enum Operation_Type {
    add = "add",
    clear = "clear",
    remove = "remove"
}
export interface Operation {
    type: Operation_Type;
    item?: any;
}
export declare function Add(item: any): Operation;
export declare function Clear(): Operation;
export declare function Remove(item: any): Operation;
