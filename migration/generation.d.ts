import { DiffBundle } from "./types";
import { Schema } from "../source";
export declare function generateInitializationSql(schema: Schema): string;
export declare function generateMigrationSql(diffBundle: DiffBundle): string;
