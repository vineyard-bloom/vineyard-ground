import { Trellis } from "../types";
import { TrellisSqlGenerator } from "./sql-building";
export declare class UpdateBuilder extends TrellisSqlGenerator {
    constructor(trellis: Trellis);
    private prepareFieldsAndValues;
    formatAssignment(assignment: any): (string | {
        value: any;
    })[];
    formatAssignments(assignments: any[]): (string | {
        value: any;
    })[][];
    buildConditions(seed: any): (string | {
        value: any;
    })[][];
    buildCreate(seed: any): any[];
    buildUpdate(seed: any): any[];
}
