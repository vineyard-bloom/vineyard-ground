import { Trellis } from "vineyard-schema";
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
    private buildWhere;
    private buildOrderBy;
    private buildRange;
    private buildSelect;
    generate(options?: QueryOptions): QueryBundle;
}
