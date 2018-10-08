import { Change, DiffBundle } from "./types";
import { TrellisMap } from "vineyard-schema";
export declare function findChangedTrellises(first: TrellisMap, second: TrellisMap): Change[];
export declare function getDiff(path: string, firstCommit: string, secondCommit: string): DiffBundle;
export declare function getCommitHashes(path: string, limit?: number): string[];
export declare function getLatestDiff(path: string, commitHashes?: string[]): DiffBundle;
