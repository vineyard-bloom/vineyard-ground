"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const sql_schema_builder_1 = require("./sql-schema-builder");
function generateInitializationSql(schema) {
    let changes = [];
    for (let name in schema.trellises) {
        const trellis = schema.trellises[name];
        changes.push({
            type: types_1.ChangeType.createTable,
            trellis: trellis
        });
    }
    changes = changes.sort((a, b) => {
        if (a.trellis.table.name < b.trellis.table.name)
            return -1;
        if (a.trellis.table.name > b.trellis.table.name)
            return 1;
        else
            return 0;
    });
    const builder = new sql_schema_builder_1.SqlSchemaBuilder(schema);
    return builder.build(changes);
}
exports.generateInitializationSql = generateInitializationSql;
function generateMigrationSql(diffBundle) {
    const builder = new sql_schema_builder_1.SqlSchemaBuilder(diffBundle.originalSchema);
    return builder.build(diffBundle.changes);
}
exports.generateMigrationSql = generateMigrationSql;
//# sourceMappingURL=generation.js.map