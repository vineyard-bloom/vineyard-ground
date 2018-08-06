"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const sql_building_1 = require("../source/sql/sql-building");
const field_types_1 = require("../source/sql/field-types");
const schema_1 = require("../source/schema");
const indent = '  ';
class SqlSchemaBuilder {
    constructor(schema) {
        this.builder = new sql_building_1.SqlBuilder();
        this.schema = schema;
    }
    isAutoIncrement(property) {
        return property.type.name == 'int' || property.type.name == 'long';
    }
    getDefaultValue(type, sequence = null) {
        if (sequence)
            return "DEFAULT nextval('" + sequence + "')";
        if (type.defaultValue !== undefined)
            return 'DEFAULT ' + type.defaultValue;
        return '';
    }
    getSequenceName(property) {
        return property.trellis.table.name + '_' + property.name + '_seq';
    }
    createProperty(property, autoIncrement = false) {
        const type = field_types_1.getFieldType(property, this.schema.library);
        if (!type)
            return '';
        let defaultValue = this.getDefaultValue(type, autoIncrement ? this.getSequenceName(property) : null);
        if (property.trellis.table.isCross)
            defaultValue = '';
        return [
            indent + this.builder.quote(property.name),
            type.name,
            defaultValue,
            property.is_nullable ? 'NULL' : 'NOT NULL',
        ];
    }
    renderPropertyCreations(trellis) {
        const tokens = [];
        for (let i = 0; i < trellis.primary_keys.length; ++i) {
            const property = trellis.primary_keys[i];
            const result = this.createProperty(property, this.isAutoIncrement(property));
            tokens.push(this.builder.flatten(result).sql);
        }
        for (let name in trellis.properties) {
            const property = trellis.properties[name];
            if (trellis.primary_keys.indexOf(property) > -1)
                continue;
            const result = this.createProperty(property);
            if (result != '')
                tokens.push(this.builder.flatten(result).sql);
        }
        tokens.push(indent + '"created" TIMESTAMPTZ NOT NULL');
        tokens.push(indent + '"modified" TIMESTAMPTZ NOT NULL');
        tokens.push(indent + 'CONSTRAINT "' + trellis.table.name + '_pkey" PRIMARY KEY ('
            + trellis.primary_keys.map(p => this.builder.quote(p.name)).join(', ')
            + ')\n');
        return tokens.join(",\n");
    }
    createTable(trellis, context) {
        let sequencePre = [], sequencePost = [];
        if (!trellis.table.isCross) {
            for (let i = 0; i < trellis.primary_keys.length; ++i) {
                const property = trellis.primary_keys[i];
                if (this.isAutoIncrement(property)) {
                    const sequence = this.getSequenceName(property);
                    sequencePre.push('CREATE SEQUENCE ' + sequence + ';\n');
                    sequencePost.push('ALTER SEQUENCE ' + sequence + ' OWNED BY ' + this.builder.getPath(property) + ';');
                }
            }
        }
        for (let name in trellis.properties) {
            const property = trellis.properties[name];
            if (property.is_list() && property.other_property.is_list()) {
                const crossTableName = this.builder.getCrossTableName(property);
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
    }
    createField(property) {
        const createdProperty = this.createProperty(property, property.autoIncrement);
        const formattedProperty = createdProperty === '' ? '' : createdProperty.join(' ').substr(2);
        return [
            `ALTER TABLE "${property.trellis.table.name}"\n  ADD ${formattedProperty};`
        ];
    }
    changeFieldNullable(property) {
        const action = property.is_nullable ? 'DROP' : 'SET';
        return [
            `ALTER TABLE "${property.trellis.table.name}"\n  ALTER COLUMN "${property.name}" ${action} NOT NULL;`
        ];
    }
    changeFieldType(property) {
        const type = field_types_1.getFieldType(property, this.schema.library);
        const result = !type ? [''] : [
            `ALTER TABLE "${property.trellis.table.name}"\n  ALTER COLUMN "${property.name}" TYPE ${type.name};`
        ];
        return result;
    }
    deleteField(property) {
        return [
            `ALTER TABLE "${property.trellis.table.name}"\n  DROP COLUMN "${property.name}";`
        ];
    }
    deleteTable(trellis) {
        return [
            `DROP TABLE IF EXISTS "${trellis.table.name}" CASCADE;`
        ];
    }
    createForeignKey(trellis) {
        const name = trellis.name[0].toLowerCase() + trellis.name.substr(1);
        return new schema_1.StandardProperty(name, trellis.primary_keys[0].type, trellis);
    }
    createCrossTable(property, context) {
        const name = this.builder.getCrossTableName(property);
        const first = this.createForeignKey(property.trellis);
        const second = this.createForeignKey(property.get_other_trellis());
        const trellis = new schema_1.TrellisImplementation(name);
        trellis.table = {
            name: name,
            isCross: true
        };
        trellis.properties = {
            [first.name]: first,
            [second.name]: second
        };
        trellis.primary_keys = [first, second];
        const result = this.createTable(trellis, context);
        return this.builder.flatten(result).sql;
    }
    createCrossTables(properties, context) {
        const result = [];
        for (let name in properties) {
            result.push(this.createCrossTable(properties[name], context));
        }
        return result;
    }
    processChange(change, context) {
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
    }
    buildChange(change, context) {
        const token = this.processChange(change, context);
        return this.builder.flatten(token).sql;
    }
    build(changes) {
        const context = {
            crossTables: {},
            additional: []
        };
        let statements = changes.map(c => this.buildChange(c, context));
        statements = statements.concat(this.createCrossTables(context.crossTables, context));
        const result = statements.join('\n');
        return result;
    }
}
exports.SqlSchemaBuilder = SqlSchemaBuilder;
//# sourceMappingURL=sql-schema-builder.js.map