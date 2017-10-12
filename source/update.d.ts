import { Trellis } from "./types";
export declare function create<T>(seed: any, trellis: Trellis, sequelize: any): Promise<T>;
export declare function create_or_update<T>(seed: any, trellis: Trellis, sequelize: any): Promise<T>;
export declare function update<T>(seed: any, trellis: Trellis, sequelize: any, changes?: any): Promise<T>;
