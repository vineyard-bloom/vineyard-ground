import { Trellis } from "vineyard-schema";
import { TrellisSqlBuilder } from "./sql-building";
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
export declare class QueryBuilder extends TrellisSqlBuilder {
    constructor(trellis: Trellis);
    private buildWhere(where);
    private buildOrderBy(order);
    private buildRange(command, value);
    private buildSelect(attributes);
    build(options?: QueryOptions): QueryBundle;
}
