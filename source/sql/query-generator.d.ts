import { Trellis } from "../types";
import { TrellisSqlGenerator } from "./sql-building";
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
export declare class QueryGenerator extends TrellisSqlGenerator {
    constructor(trellis: Trellis);
    private buildWhere(where);
    private buildOrderBy(order);
    private buildRange(command, value);
    private buildSelect(attributes);
    generate(options?: QueryOptions): QueryBundle;
}
