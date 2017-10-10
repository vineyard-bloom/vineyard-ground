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
var QueryBuilder = (function (_super) {
    __extends(QueryBuilder, _super);
    function QueryBuilder(trellis) {
        return _super.call(this, trellis) || this;
    }
    QueryBuilder.prototype.buildWhere = function (where) {
        if (!where)
            return '';
        var conditions = [];
        for (var i in where) {
            conditions.push([
                this.builder.quote(i),
                '=',
                { value: where[i] }
            ]);
        }
        return ['WHERE', sql_building_1.delimit(conditions, 'AND')];
    };
    QueryBuilder.prototype.buildOrderBy = function (order) {
        if (!order)
            return '';
        var tokens = [];
        for (var _i = 0, order_1 = order; _i < order_1.length; _i++) {
            var item = order_1[_i];
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
    };
    QueryBuilder.prototype.buildRange = function (command, value) {
        if (!value)
            return '';
        if (typeof value != 'number')
            throw new Error("Range values must be numbers.");
        return [command, value.toString()];
    };
    QueryBuilder.prototype.buildSelect = function (attributes) {
        return '*';
    };
    QueryBuilder.prototype.build = function (options) {
        if (options === void 0) { options = {}; }
        var finalToken = [
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
    };
    return QueryBuilder;
}(sql_building_1.TrellisSqlBuilder));
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=query-builder.js.map