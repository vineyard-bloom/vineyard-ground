import { Schema, Table } from "./types";
export declare function vineyard_to_sequelize(schema: Schema, keys: any, sequelize: any): {
    [key: string]: Table;
};
