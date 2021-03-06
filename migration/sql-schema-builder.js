"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sql_building_1 = require("../source/sql/sql-building");
var field_types_1 = require("../source/sql/field-types");
var indent = '  ';
var SqlSchemaBuilder = (function () {
    function SqlSchemaBuilder(schema) {
        this.builder = new sql_building_1.SqlBuilder();
        this.schema = schema;
    }
    SqlSchemaBuilder.prototype.isAutoIncrement = function (property) {
        return property.type.name == 'int' || property.type.name == 'long';
    };
    SqlSchemaBuilder.prototype.getDefaultValue = function (type, sequence) {
        if (sequence === void 0) { sequence = null; }
        if (sequence)
            return "DEFAULT nextval('" + sequence + "')";
        if (type.defaultValue !== undefined)
            return 'DEFAULT ' + type.defaultValue;
        return '';
    };
    SqlSchemaBuilder.prototype.getSequenceName = function (property) {
        return property.trellis.table.name + '_' + property.name + '_seq';
    };
    SqlSchemaBuilder.prototype.createProperty = function (property, autoIncrement) {
        if (autoIncrement === void 0) { autoIncrement = false; }
        var type = field_types_1.getFieldType(property, this.schema.library);
        if (!type)
            return '';
        var defaultValue = this.getDefaultValue(type, autoIncrement ? this.getSequenceName(property) : null);
        if (property.trellis.table.isCross)
            defaultValue = '';
        return [
            indent + this.builder.quote(property.name),
            type.name,
            defaultValue,
            property.is_nullable ? 'NULL' : 'NOT NULL',
        ];
    };
    SqlSchemaBuilder.prototype.renderPropertyCreations = function (trellis) {
        var _this = this;
        var tokens = [];
        for (var i = 0; i < trellis.primary_keys.length; ++i) {
            var property = trellis.primary_keys[i];
            var result = this.createProperty(property, this.isAutoIncrement(property));
            tokens.push(this.builder.flatten(result).sql);
        }
        for (var name in trellis.properties) {
            var property = trellis.properties[name];
            if (trellis.primary_keys.indexOf(property) > -1)
                continue;
            var result = this.createProperty(property);
            if (result != '')
                tokens.push(this.builder.flatten(result).sql);
        }
        tokens.push(indent + '"created" TIMESTAMPTZ NOT NULL');
        tokens.push(indent + '"modified" TIMESTAMPTZ NOT NULL');
        tokens.push(indent + 'CONSTRAINT "' + trellis.table.name + '_pkey" PRIMARY KEY ('
            + trellis.primary_keys.map(function (p) { return _this.builder.quote(p.name); }).join(', ')
            + ')\n');
        return tokens.join(",\n");
    };
    SqlSchemaBuilder.prototype.createTable = function (trellis, context) {
        var sequencePre = [], sequencePost = [];
        if (!trellis.table.isCross) {
            for (var i = 0; i < trellis.primary_keys.length; ++i) {
                var property = trellis.primary_keys[i];
                if (this.isAutoIncrement(property)) {
                    var sequence = this.getSequenceName(property);
                    sequencePre.push('CREATE SEQUENCE ' + sequence + ';\n');
                    sequencePost.push('ALTER SEQUENCE ' + sequence + ' OWNED BY ' + this.builder.getPath(property) + ';\n');
                }
            }
        }
        for (var name in trellis.properties) {
            var property = trellis.properties[name];
            if (property.is_list() && property.other_property.is_list()) {
                var crossTableName = this.builder.getCrossTableName(property);
                context.crossTables[crossTableName] = property.trellis.name < property.other_property.trellis.name
                    ? property
                    : property.other_property;
            }
        }
        return [
            sequencePre,
            'CREATE TABLE',
            trellis.table.name,
            '(\n',
            this.renderPropertyCreations(trellis),
            ');\n',
            sequencePost
        ];
    };
    SqlSchemaBuilder.prototype.changeFieldNullable = function (property) {
    };
    SqlSchemaBuilder.prototype.changeFieldType = function (property) {
    };
    SqlSchemaBuilder.prototype.deleteField = function (property) {
    };
    SqlSchemaBuilder.prototype.deleteTable = function (property) {
    };
    SqlSchemaBuilder.prototype.createForeignKey = function (trellis) {
        var name = trellis.name[0].toLowerCase() + trellis.name.substr(1);
        throw new Error("Not implemented.");
        // return new vineyardSchema.StandardProperty(name, trellis.primary_keys[0].type, null)
    };
    SqlSchemaBuilder.prototype.createCrossTable = function (property) {
        var name = this.builder.getCrossTableName(property);
        var first = this.createForeignKey(property.trellis);
        var second = this.createForeignKey(property.get_other_trellis());
        throw new Error("Not implemented.");
        // const trellis: Trellis = {
        //   table: {
        //     name: name,
        //     isCross: true,
        //   },
        //   name: name,
        //   properties: {
        //     [first.name]: first,
        //     [second.name]: second,
        //   },
        //   primary_keys: [first, second],
        //   additional: null
        // }
        //
        // first.trellis = trellis
        // second.trellis = trellis
        //
        // return this.buildChange({
        //   type: ChangeType.createTable,
        //   trellis: trellis
        // }, null)
    };
    SqlSchemaBuilder.prototype.createCrossTables = function (properties) {
        var result = [];
        for (var name in properties) {
            result.push(this.createCrossTable(properties[name]));
        }
        return result;
    };
    SqlSchemaBuilder.prototype.processChange = function (change, context) {
        throw new Error("Not implemented.");
        // switch (change.type) {
        //   case ChangeType.createTable:
        //     return this.createTable(change.trellis, context)
        //
        //   case ChangeType.changeFieldNullable:
        //     return this.changeFieldNullable(change.property)
        //
        //   case ChangeType.changeFieldType:
        //     return this.changeFieldType(change.property)
        //
        //   case ChangeType.deleteField:
        //     return this.deleteField(change.property)
        //
        //   case ChangeType.deleteTable:
        //     return this.deleteTable(change.property)
        // }
    };
    SqlSchemaBuilder.prototype.buildChange = function (change, context) {
        var token = this.processChange(change, context);
        return this.builder.flatten(token).sql;
    };
    SqlSchemaBuilder.prototype.build = function (changes) {
        var _this = this;
        var context = {
            crossTables: {},
            additional: []
        };
        var statements = changes.map(function (c) { return _this.buildChange(c, context); });
        statements = statements.concat(this.createCrossTables(context.crossTables));
        var result = statements.join('\n');
        return result;
    };
    return SqlSchemaBuilder;
}());
exports.SqlSchemaBuilder = SqlSchemaBuilder;
//# sourceMappingURL=sql-schema-builder.js.map