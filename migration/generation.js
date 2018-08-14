"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var sql_schema_builder_1 = require("./sql-schema-builder");
function generateInitializationSql(schema) {
    var changes = [];
    for (var name in schema.trellises) {
        var trellis = schema.trellises[name];
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
exports.generateInitializationSql = generateInitializationSql;
function generateMigrationSql(diffBundle) {
    var builder = new sql_schema_builder_1.SqlSchemaBuilder(diffBundle.originalSchema);
    return builder.build(diffBundle.changes);
}
exports.generateMigrationSql = generateMigrationSql;
//# sourceMappingURL=generation.js.map