import { Property, Trellis } from "../types";
export interface Arg {
    value: any;
}
export declare type Token = string | any[] | Arg;
export declare function delimit(tokens: Token[], delimiter: string): Token;
export declare function smartJoin(items: string[]): string;
export declare class Flattener {
    args: never[];
    flatten(token: Token): any;
}
export declare class SqlBuilder {
    quote(text: string): string;
    sanitize(value: any): any;
    flatten(token: any): {
        sql: any;
        args: never[];
    };
    getPath(property: Property): string;
    getCrossTableName(property: Property): string;
}
export declare class TrellisSqlBuilder {
    protected trellis: Trellis;
    protected table: any;
    protected builder: SqlBuilder;
    constructor(trellis: Trellis);
    getTableName(): any;
}
