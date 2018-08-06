import { Change, DiffBundle } from "./types";
import { Trellis_Map } from "../source";
export declare function findChangedTrellises(first: Trellis_Map, second: Trellis_Map): Change[];
export declare function getDiff(path: string, firstCommit: string, secondCommit: string): DiffBundle;
export declare function getCommitHashes(path: string, limit?: number): string[];
export declare function getLatestDiff(path: string, commitHashes?: string[]): DiffBundle;
