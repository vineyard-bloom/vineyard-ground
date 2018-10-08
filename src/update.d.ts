import { SequelizeTables, TableClient } from './types';
import { Trellis } from 'vineyard-schema';
export declare function create<T>(tables: SequelizeTables, seed: any, trellis: Trellis, table: TableClient<T>): Promise<T>;
export declare function create_or_update<T>(tables: SequelizeTables, seed: any, trellis: Trellis, table: TableClient<T>): Promise<T>;
export declare function update<T>(tables: SequelizeTables, seed: any, trellis: Trellis, table: TableClient<T>, changes?: any): Promise<T>;
