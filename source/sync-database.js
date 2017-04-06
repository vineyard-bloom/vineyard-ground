"use strict";
var vineyard_schema_1 = require('vineyard-schema');
var node_uuid = require('uuid');
function create_field(table, property, library) {
    var type = property.type;
    var name = property.name;
    if (type.get_category() == vineyard_schema_1.Type_Category.primitive) {
        if (type === library.types.int) {
            return table.integer(name);
        }
        if (type === library.types.string) {
            return table.string(name);
        }
        if (type === library.types.json) {
            return table.json(name);
        }
        if (type === library.types.bool) {
            return table.boolean(name);
        }
        if (type === library.types.guid) {
            return table.uuid(name);
        }
        if (type === library.types.float) {
            return table.float(name);
        }
        if (type === library.types.date) {
            return table.date(name);
        }
    }
    else if (type.get_category() == vineyard_schema_1.Type_Category.list) {
        return null;
    }
    else if (type.get_category() == vineyard_schema_1.Type_Category.trellis) {
        if (library.types[type.name]) {
            return create_field(table, type.trellis.primary_key, library);
        }
    }
    throw Error("Not implemented or supported");
}
function create_table(chain, schema, name, trellis) {
    return chain.createTable(name, function (table) {
        var primary_key = create_field(table, trellis.primary_key, schema.library)
            .primary();
        // primary_key.primaryKey = true
        // primary_key.defaultValue = node_uuid.v4
        for (var i in trellis.properties) {
            if (i == trellis.primary_key.name)
                continue;
            var property = trellis.properties[i];
            table.smallint('test');
        }
    });
}
function drop_tables(db, schema) {
    var promise = Promise.resolve();
    var _loop_1 = function(name_1) {
        var trellis = schema.trellises[name_1];
        promise = promise.then(function () { return db.schema.dropTableIfExists(name_1); });
    };
    for (var name_1 in schema.trellises) {
        _loop_1(name_1);
    }
    return promise;
}
function create_tables(db, schema) {
    var chain = db.schema;
    for (var name_2 in schema.trellises) {
        var trellis = schema.trellises[name_2];
        chain = create_table(chain, schema, name_2, trellis);
    }
    return chain;
}
function sync_database(db, schema) {
    return drop_tables(db, schema)
        .then(function () { return create_tables(db, schema); });
}
exports.sync_database = sync_database;
//# sourceMappingURL=sync-database.js.map