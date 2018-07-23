import {get_diff} from "../migration/diff";

const args = process.argv

// TODO Set this to var then actually run the SQL?
// const { firstSchema, changes } = get_diff...
get_diff(args[2], args[3], args[4])