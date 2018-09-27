import { Property, Trellis } from "../source/types";
export declare enum ChangeType {
    createTable = 0,
    createField = 1,
    createIndex = 2,
    deleteField = 3,
    deleteTable = 4,
    deleteIndex = 5,
    changeFieldType = 6,
    changeFieldNullable = 7,
}
export interface Change {
    type: ChangeType;
    trellis?: Trellis;
    property?: Property;
    tableName?: string;
    propertyName?: string;
}
export interface TableChange {
    type: ChangeType.createTable | ChangeType.deleteTable;
    trellis: Trellis;
    property?: undefined;
}
export interface DiffBundle {
    changes: any;
    originalSchema: any;
    firstCommit: string;
    secondCommit: string;
}
