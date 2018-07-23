import { Change } from "./types";
import { Property, Schema } from "../source/types";
export declare class SqlSchemaBuilder {
    private schema;
    private builder;
    constructor(schema: Schema);
    private isAutoIncrement(property);
    getDefaultValue(type: any, sequence?: string | null): string;
    getSequenceName(property: Property): string;
    createProperty(property: Property, autoIncrement?: boolean): any[] | "";
    private renderPropertyCreations(trellis);
    private createTable(trellis, context);
    private createField(property);
    private changeFieldNullable(property);
    private changeFieldType(property);
    private deleteField(property);
    private deleteTable(trellis);
    private createForeignKey(trellis);
    private createCrossTable(property, context);
    private createCrossTables(properties, context);
    private processChange(change, context);
    private buildChange(change, context);
    build(changes: Change[]): string;
}
