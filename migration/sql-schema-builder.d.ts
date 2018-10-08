import { Change } from './types';
import { Property, Schema } from 'vineyard-schema';
export declare class SqlSchemaBuilder {
    private schema;
    private builder;
    constructor(schema: Schema);
    private isAutoIncrement;
    getDefaultValue(type: any, sequence?: string | null): string;
    getSequenceName(property: Property): string;
    createProperty(property: Property, autoIncrement?: boolean): any[] | "";
    private renderPropertyCreations;
    private createTable;
    private createField;
    private createIndex;
    private changeFieldNullable;
    private changeFieldType;
    private deleteField;
    private deleteTable;
    private deleteIndex;
    private createForeignKey;
    private createCrossTable;
    private createCrossTables;
    private processChange;
    private buildChange;
    build(changes: Change[]): string;
}
