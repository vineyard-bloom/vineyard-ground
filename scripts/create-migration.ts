import {get_diff} from "../migration/diff";

const args = process.argv

get_diff(args[2], args[3], args[4])