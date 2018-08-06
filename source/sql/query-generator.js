"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql_building_1 = require("./sql-building");
class QueryGenerator extends sql_building_1.TrellisSqlGenerator {
    constructor(trellis) {
        super(trellis);
    }
    buildWhere(where) {
        if (!where)
            return '';
        const conditions = [];
        for (let i in where) {
            conditions.push([
                this.builder.quote(i),
                '=',
                { value: where[i] }
            ]);
        }
        return ['WHERE', sql_building_1.delimit(conditions, 'AND')];
    }
    buildOrderBy(order) {
        if (!order)
            return '';
        const tokens = [];
        for (let item of order) {
            if (item == 'desc' || item == 'DESC') {
                tokens.push('DESC');
            }
            else if (item == 'asc' || item == 'ASC') {
                tokens.push('ASC');
            }
            else {
                if (tokens.length > 0)
                    tokens[tokens.length - 1] += ',';
                tokens.push(this.builder.quote(item));
            }
        }
        return ['ORDER BY', tokens];
    }
    buildRange(command, value) {
        if (!value)
            return '';
        if (typeof value != 'number')
            throw new Error("Range values must be numbers.");
        return [command, value.toString()];
    }
    buildSelect(attributes) {
        return '*';
    }
    generate(options = {}) {
        const finalToken = [
            'SELECT',
            this.buildSelect(options.attributes),
            'FROM',
            this.builder.quote(this.getTableName()),
            this.buildWhere(options.where),
            this.buildOrderBy(options.order),
            this.buildRange('LIMIT', options.limit),
            this.buildRange('OFFSET', options.offset),
        ];
        return this.builder.flatten(finalToken);
    }
}
exports.QueryGenerator = QueryGenerator;
//# sourceMappingURL=query-generator.js.map