import { TableClient, Trellis } from "./types";
export declare function create<T>(seed: any, trellis: Trellis, table: TableClient<T>): Promise<T>;
export declare function create_or_update<T>(seed: any, trellis: Trellis, table: TableClient<T>): Promise<T>;
export declare function update<T>(seed: any, trellis: Trellis, table: TableClient<T>, changes?: any): Promise<T>;
