"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var sql_building_1 = require("../source/sql/sql-building");
var field_types_1 = require("../source/sql/field-types");
var schema_1 = require("../source/schema");
var indent = '  ';
var SqlSchemaBuilder = /** @class */ (function () {
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
                    sequencePost.push('ALTER SEQUENCE ' + sequence + ' OWNED BY ' + this.builder.getPath(property) + ';');
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
            'CREATE TABLE IF NOT EXISTS',
            trellis.table.name,
            '(\n',
            this.renderPropertyCreations(trellis),
            ');\n',
            sequencePost
        ];
    };
    SqlSchemaBuilder.prototype.createField = function (property) {
        var createdProperty = this.createProperty(property, property.autoIncrement);
        var formattedProperty = createdProperty === '' ? '' : createdProperty.join(' ').substr(2);
        return [
            "ALTER TABLE \"" + property.trellis.table.name + "\"\n  ADD " + formattedProperty + ";"
        ];
    };
    SqlSchemaBuilder.prototype.changeFieldNullable = function (property) {
        var action = property.is_nullable ? 'DROP' : 'SET';
        return [
            "ALTER TABLE \"" + property.trellis.table.name + "\"\n  ALTER COLUMN \"" + property.name + "\" " + action + " NOT NULL;"
        ];
    };
    SqlSchemaBuilder.prototype.changeFieldType = function (property) {
        var type = field_types_1.getFieldType(property, this.schema.library);
        var result = !type ? [''] : [
            "ALTER TABLE \"" + property.trellis.table.name + "\"\n  ALTER COLUMN \"" + property.name + "\" TYPE " + type.name + ";"
        ];
        return result;
    };
    SqlSchemaBuilder.prototype.deleteField = function (property) {
        return [
            "ALTER TABLE \"" + property.trellis.table.name + "\"\n  DROP COLUMN \"" + property.name + "\";"
        ];
    };
    SqlSchemaBuilder.prototype.deleteTable = function (trellis) {
        return [
            "DROP TABLE IF EXISTS \"" + trellis.table.name + "\" CASCADE;"
        ];
    };
    SqlSchemaBuilder.prototype.createForeignKey = function (trellis) {
        var name = trellis.name[0].toLowerCase() + trellis.name.substr(1);
        return new schema_1.StandardProperty(name, trellis.primary_keys[0].type, trellis);
    };
    SqlSchemaBuilder.prototype.createCrossTable = function (property, context) {
        var name = this.builder.getCrossTableName(property);
        var first = this.createForeignKey(property.trellis);
        var second = this.createForeignKey(property.get_other_trellis());
        var trellis = new schema_1.TrellisImplementation(name);
        trellis.table = {
            name: name,
            isCross: true
        };
        trellis.properties = (_a = {},
            _a[first.name] = first,
            _a[second.name] = second,
            _a);
        trellis.primary_keys = [first, second];
        var result = this.createTable(trellis, context);
        return this.builder.flatten(result).sql;
        var _a;
    };
    SqlSchemaBuilder.prototype.createCrossTables = function (properties, context) {
        var result = [];
        for (var name in properties) {
            result.push(this.createCrossTable(properties[name], context));
        }
        return result;
    };
    SqlSchemaBuilder.prototype.processChange = function (change, context) {
        switch (change.type) {
            case types_1.ChangeType.createTable:
                return this.createTable(change.trellis, context);
            case types_1.ChangeType.createField:
                return this.createField(change.property);
            case types_1.ChangeType.deleteField:
                return this.deleteField(change.property);
            case types_1.ChangeType.deleteTable:
                return this.deleteTable(change.trellis);
            case types_1.ChangeType.changeFieldType:
                return this.changeFieldType(change.property);
            case types_1.ChangeType.changeFieldNullable:
                return this.changeFieldNullable(change.property);
        }
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
        statements = statements.concat(this.createCrossTables(context.crossTables, context));
        var result = statements.join('\n');
        return result;
    };
    return SqlSchemaBuilder;
}());
exports.SqlSchemaBuilder = SqlSchemaBuilder;
//# sourceMappingURL=sql-schema-builder.js.map