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
exports.delimit = delimit;
function smartJoin(items) {
    var result = '';
    for (var i = 0; i < items.length; ++i) {
        if (i > 0) {
            var previous = items[i - 1];
            if (previous[previous.length - 1] != '\n')
                result += ' ';
        }
        result += items[i];
    }
    return result;
}
exports.smartJoin = smartJoin;
var Flattener = (function () {
    function Flattener() {
        this.args = [];
    }
    Flattener.prototype.flatten = function (token) {
        var _this = this;
        if (typeof token == 'string')
            return token;
        if (Array.isArray(token)) {
            return smartJoin(token
                .map(function (t) { return _this.flatten(t); })
                .filter(function (t) { return t != ''; }));
        }
        if (typeof token == 'object') {
            this.args.push(token.value);
            return '$' + this.args.length;
        }
        throw new Error("Invalid token type: " + typeof token);
    };
    return Flattener;
}());
exports.Flattener = Flattener;
var SqlBuilder = (function () {
    function SqlBuilder() {
    }
    SqlBuilder.prototype.quote = function (text) {
        return '"' + text + '"';
    };
    SqlBuilder.prototype.sanitize = function (value) {
        if (typeof value == 'string')
            return "'" + value + "'";
        return value;
    };
    SqlBuilder.prototype.flatten = function (token) {
        var flattener = new Flattener();
        var sql = flattener.flatten(token);
        return {
            sql: sql,
            args: flattener.args
        };
    };
    SqlBuilder.prototype.getPath = function (property) {
        return property.trellis.table.name + '.' + this.quote(property.name);
    };
    SqlBuilder.prototype.getCrossTableName = function (property) {
        return [property.trellis.table.name, property.get_other_trellis().table.name]
            .sort()
            .join('_');
    };
    return SqlBuilder;
}());
exports.SqlBuilder = SqlBuilder;
var TrellisSqlGenerator = (function () {
    function TrellisSqlGenerator(trellis) {
        this.builder = new SqlBuilder();
        this.trellis = trellis;
        this.table = trellis.table;
    }
    TrellisSqlGenerator.prototype.getTableName = function () {
        return this.table.name;
    };
    return TrellisSqlGenerator;
}());
exports.TrellisSqlGenerator = TrellisSqlGenerator;
//# sourceMappingURL=sql-building.js.map