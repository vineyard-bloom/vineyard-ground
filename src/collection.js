"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const query_1 = require("./query");
const update_1 = require("./update");
class Collection {
    constructor(tables, trellis, table, client) {
        this.tables = tables;
        this.trellis = trellis;
        this.table = table;
        this.client = client;
        trellis.collection = this;
        // Monkey patch for soft backwards compatibility
        const self = this;
        self.firstOrNull = this.first;
        self.first_or_null = this.first;
    }
    getTrellis() {
        return this.trellis;
    }
    getTableClient() {
        return this.table;
    }
    create(seed) {
        return update_1.create(this.tables, seed, this.trellis, this.table);
    }
    create_or_update(seed) {
        return update_1.create_or_update(this.tables, seed, this.trellis, this.table);
    }
    update(seed, changes) {
        return update_1.update(this.tables, seed, this.trellis, this.table, changes);
    }
    remove(seed) {
        return this.table.remove({
            where: {
                [this.trellis.primary_keys[0].name]: this.trellis.get_identity(seed)
            }
        });
    }
    all() {
        return new query_1.Query_Implementation(this.tables, this.table, this.client, this.trellis);
    }
    filter(options) {
        return this.all().filter(options);
    }
    first(options) {
        return this.all().first(options);
    }
    get(identity) {
        identity = this.trellis.get_identity(identity);
        const filter = {};
        filter[this.trellis.primary_keys[0].name] = identity;
        return this.filter(filter).first();
    }
}
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map