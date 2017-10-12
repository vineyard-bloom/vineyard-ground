import { Property, Trellis } from "../source/types";
export declare enum ChangeType {
    createTable = 0,
    createField = 1,
    deleteField = 2,
    deleteTable = 3,
    changeFieldType = 4,
    changeFieldNullable = 5,
}
export interface Change {
    type: ChangeType;
    trellis?: Trellis;
    property?: Property;
}
export interface TableChange {
    type: ChangeType.createTable | ChangeType.deleteTable;
    trellis: Trellis;
    property?: undefined;
}
