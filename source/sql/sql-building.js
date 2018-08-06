"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function delimit(tokens, delimiter) {
    let result = [];
    for (let i = 0; i < tokens.length; ++i) {
        if (i > 0)
            result.push(delimiter);
        result.push(tokens[i]);
    }
    return result;
}
exports.delimit = delimit;
function smartJoin(items) {
    let result = '';
    for (let i = 0; i < items.length; ++i) {
        if (i > 0) {
            const previous = items[i - 1];
            if (previous[previous.length - 1] != '\n')
                result += ' ';
        }
        result += items[i];
    }
    return result;
}
exports.smartJoin = smartJoin;
class Flattener {
    constructor() {
        this.args = [];
    }
    flatten(token) {
        if (typeof token == 'string')
            return token;
        if (Array.isArray(token)) {
            return smartJoin(token
                .map(t => this.flatten(t))
                .filter(t => t != ''));
        }
        if (typeof token == 'object') {
            this.args.push(token.value);
            return '$' + this.args.length;
        }
        throw new Error("Invalid token type: " + typeof token);
    }
}
exports.Flattener = Flattener;
class SqlBuilder {
    quote(text) {
        return '"' + text + '"';
    }
    sanitize(value) {
        if (typeof value == 'string')
            return "'" + value + "'";
        return value;
    }
    flatten(token) {
        const flattener = new Flattener();
        const sql = flattener.flatten(token);
        return {
            sql: sql,
            args: flattener.args
        };
    }
    getPath(property) {
        return property.trellis.table.name + '.' + this.quote(property.name);
    }
    getCrossTableName(property) {
        return [property.trellis.table.name, property.get_other_trellis().table.name]
            .sort()
            .join('_');
    }
}
exports.SqlBuilder = SqlBuilder;
class TrellisSqlGenerator {
    constructor(trellis) {
        this.builder = new SqlBuilder();
        this.trellis = trellis;
        this.table = trellis.table;
    }
    getTableName() {
        return this.table.name;
    }
}
exports.TrellisSqlGenerator = TrellisSqlGenerator;
//# sourceMappingURL=sql-building.js.map