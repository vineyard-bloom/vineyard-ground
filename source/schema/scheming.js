"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const library_1 = require("./library");
const loading_1 = require("./loading");
class Schema {
    constructor(definitions = undefined) {
        this.trellises = {};
        this.library = new library_1.Library();
        if (definitions) {
            this.define(definitions);
        }
    }
    define(definitions) {
        loading_1.load_schema(definitions, this.trellises, this.library);
    }
    add_type(type) {
        this.library.add_type(type);
    }
}
exports.Schema = Schema;
//# sourceMappingURL=scheming.js.map