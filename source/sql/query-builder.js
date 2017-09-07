"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function quote(text) {
    return '"' + text + '"';
}
function sanitize(value) {
    if (typeof value == 'string')
        return "'" + value + "'";
    return value;
}
var QueryBuilder = (function () {
    function QueryBuilder(trellis) {
        this.trellis = trellis;
        this.table = trellis['table'];
    }
    QueryBuilder.prototype.buildWhere = function (where) {
        var conditions = [];
        for (var i in where) {
            conditions.push(quote(i) + ' = ' + sanitize(where[i]));
        }
        return 'WHERE ' + conditions.join(' AND ');
    };
    QueryBuilder.prototype.build = function (options) {
        if (options === void 0) { options = {}; }
        var whereClause = options.where
            ? ' ' + this.buildWhere(options.where)
            : '';
        return 'SELECT * FROM ' + quote(this.table.tableName) + whereClause;
    };
    return QueryBuilder;
}());
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=query-builder.js.map