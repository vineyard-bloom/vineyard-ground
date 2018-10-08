"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql_building_1 = require("./sql-building");
function getFieldName(f) {
    return f.field.name;
}
function getValue(f) {
    return f.value;
}
class UpdateBuilder extends sql_building_1.TrellisSqlGenerator {
    constructor(trellis) {
        super(trellis);
    }
    prepareFieldsAndValues(seed) {
        return [];
    }
    formatAssignment(assignment) {
        return [
            'SET',
            this.builder.quote(assignment.field.name),
            '=',
            { value: assignment.value }
        ];
    }
    formatAssignments(assignments) {
        return assignments.map(a => this.formatAssignment(a));
    }
    buildConditions(seed) {
        return this.trellis.primary_keys.map(k => {
            const value = seed[k.name];
            if (!value)
                throw new Error('');
            return [
                this.builder.quote(k.name),
                '=',
                { value: value }
            ];
        });
    }
    buildCreate(seed) {
        const assignments = this.prepareFieldsAndValues(seed);
        const fields = sql_building_1.delimit(assignments.map(getFieldName), ', ');
        const values = sql_building_1.delimit(assignments.map(getValue), ', ');
        return ['INSERT INTO',
            this.getTableName(),
            '(', fields, ')',
            'VALUES',
            '(', values, ')'];
    }
    buildUpdate(seed) {
        const assignments = this.prepareFieldsAndValues(seed);
        const assignmentClause = sql_building_1.delimit(this.formatAssignments(assignments), ', ');
        const conditionClause = sql_building_1.delimit(this.buildConditions(seed), 'AND');
        return ['UPDATE',
            this.getTableName(),
            assignmentClause,
            'WHERE', conditionClause
        ];
    }
}
exports.UpdateBuilder = UpdateBuilder;
//# sourceMappingURL=update-builder.js.map