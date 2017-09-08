"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function delimit(tokens, delimiter) {
    var result = [];
    for (var i = 0; i < tokens.length; ++i) {
        if (i > 0)
            result.push(delimiter);
        result.push(tokens[i]);
    }
    return result;
}
var Flattener = (function () {
    function Flattener() {
        this.args = [];
    }
    Flattener.prototype.flatten = function (token) {
        var _this = this;
        if (typeof token == 'string')
            return token;
        if (Array.isArray(token)) {
            return token
                .map(function (t) { return _this.flatten(t); })
                .filter(function (t) { return t != ''; })
                .join(' ');
        }
        if (typeof token == 'object') {
            this.args.push(token.value);
            return '$' + this.args.length;
        }
        throw new Error("Invalid token type: " + typeof token);
    };
    return Flattener;
}());
var QueryBuilder = (function () {
    function QueryBuilder(trellis) {
        this.trellis = trellis;
        this.table = trellis['table'];
    }
    QueryBuilder.prototype.quote = function (text) {
        return '"' + text + '"';
    };
    QueryBuilder.prototype.sanitize = function (value) {
        if (typeof value == 'string')
            return "'" + value + "'";
        return value;
    };
    QueryBuilder.prototype.buildWhere = function (where) {
        if (!where)
            return '';
        var conditions = [];
        for (var i in where) {
            conditions.push([
                this.quote(i),
                '=',
                { value: where[i] }
            ]);
        }
        return ['WHERE', delimit(conditions, 'AND')];
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
                tokens.push(this.quote(item));
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
            this.quote(this.table.tableName),
            this.buildWhere(options.where),
            this.buildOrderBy(options.order),
            this.buildRange('LIMIT', options.limit),
            this.buildRange('OFFSET', options.offset),
        ];
        var flattener = new Flattener();
        var sql = flattener.flatten(finalToken);
        return {
            sql: sql,
            args: flattener.args
        };
    };
    return QueryBuilder;
}());
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=query-builder.js.map