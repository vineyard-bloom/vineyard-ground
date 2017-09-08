import { Trellis } from "vineyard-schema";
export interface QueryOptions {
    where?: any;
    order?: string[];
    limit?: number;
    offset?: number;
    attributes?: any;
}
export interface QueryBundle {
    sql: string;
    args: any[];
}
export declare class QueryBuilder {
    trellis: Trellis;
    table: any;
    constructor(trellis: Trellis);
    private quote(text);
    private sanitize(value);
    private buildWhere(where);
    private buildOrderBy(order);
    private buildRange(command, value);
    private buildSelect(attributes);
    build(options?: QueryOptions): QueryBundle;
}
