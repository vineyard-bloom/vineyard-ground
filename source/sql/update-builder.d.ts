import { Trellis } from "../types";
import { TrellisSqlBuilder } from "./sql-building";
export declare class UpdateBuilder extends TrellisSqlBuilder {
    constructor(trellis: Trellis);
    private prepareFieldsAndValues(seed);
    formatAssignment(assignment: any): (string | {
        value: any;
    })[];
    formatAssignments(assignments: any[]): (string | {
        value: any;
    })[][];
    buildConditions(seed: any): any;
    buildCreate(seed: any): any[];
    buildUpdate(seed: any): any[];
}
