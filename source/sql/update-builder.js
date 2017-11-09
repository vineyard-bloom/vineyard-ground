"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sql_building_1 = require("./sql-building");
function getFieldName(f) {
    return f.field.name;
}
function getValue(f) {
    return f.value;
}
var UpdateBuilder = /** @class */ (function (_super) {
    __extends(UpdateBuilder, _super);
    function UpdateBuilder(trellis) {
        return _super.call(this, trellis) || this;
    }
    UpdateBuilder.prototype.prepareFieldsAndValues = function (seed) {
        return [];
    };
    UpdateBuilder.prototype.formatAssignment = function (assignment) {
        return [
            'SET',
            this.builder.quote(assignment.field.name),
            '=',
            { value: assignment.value }
        ];
    };
    UpdateBuilder.prototype.formatAssignments = function (assignments) {
        var _this = this;
        return assignments.map(function (a) { return _this.formatAssignment(a); });
    };
    UpdateBuilder.prototype.buildConditions = function (seed) {
        var _this = this;
        return this.trellis.primary_keys.map(function (k) {
            var value = seed[k.name];
            if (!value)
                throw new Error('');
            return [
                _this.builder.quote(k.name),
                '=',
                { value: value }
            ];
        });
    };
    UpdateBuilder.prototype.buildCreate = function (seed) {
        var assignments = this.prepareFieldsAndValues(seed);
        var fields = sql_building_1.delimit(assignments.map(getFieldName), ', ');
        var values = sql_building_1.delimit(assignments.map(getValue), ', ');
        return ['INSERT INTO',
            this.getTableName(),
            '(', fields, ')',
            'VALUES',
            '(', values, ')'];
    };
    UpdateBuilder.prototype.buildUpdate = function (seed) {
        var assignments = this.prepareFieldsAndValues(seed);
        var assignmentClause = sql_building_1.delimit(this.formatAssignments(assignments), ', ');
        var conditionClause = sql_building_1.delimit(this.buildConditions(seed), 'AND');
        return ['UPDATE',
            this.getTableName(),
            assignmentClause,
            'WHERE', conditionClause
        ];
    };
    return UpdateBuilder;
}(sql_building_1.TrellisSqlGenerator));
exports.UpdateBuilder = UpdateBuilder;
//# sourceMappingURL=update-builder.js.map