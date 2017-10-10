"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var sql_schema_builder_1 = require("./sql-schema-builder");
function generate(schema) {
    var changes = [];
    for (var name_1 in schema.trellises) {
        var trellis = schema.trellises[name_1];
        changes.push({
            type: types_1.ChangeType.createTable,
            trellis: trellis
        });
    }
    changes = changes.sort(function (a, b) {
        if (a.trellis.table.name < b.trellis.table.name)
            return -1;
        if (a.trellis.table.name > b.trellis.table.name)
            return 1;
        else
            return 0;
    });
    var builder = new sql_schema_builder_1.SqlSchemaBuilder(schema);
    return builder.build(changes);
}
exports.generate = generate;
//# sourceMappingURL=generate.js.map