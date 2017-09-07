import { Trellis } from "vineyard-schema";
export interface QueryOptions {
    where?: any;
}
export declare class QueryBuilder {
    trellis: Trellis;
    table: any;
    constructor(trellis: Trellis);
    private buildWhere(where);
    build(options?: QueryOptions): string;
}
