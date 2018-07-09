import { Change } from "./types";
import { Trellis_Map } from "../source/types";
export declare function findChangedTrellises(first: Trellis_Map, second: Trellis_Map): Change[];
export declare function get_diff(path: string, firstCommit: string, secondCommit: string): Change[];
