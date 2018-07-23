"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var diff_1 = require("../migration/diff");
var args = process.argv;
// TODO Set this to var then actually run the SQL?
// const { firstSchema, changes } = get_diff...
diff_1.get_diff(args[2], args[3], args[4]);
//# sourceMappingURL=create-migration.js.map