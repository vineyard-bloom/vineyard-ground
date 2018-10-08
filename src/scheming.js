"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vineyard_schema_1 = require("vineyard-schema");
class SchemaClass {
    constructor(definitions = undefined) {
        this.trellises = {};
        this.library = new vineyard_schema_1.LibraryImplementation();
        this.tables = {};
        if (definitions) {
            this.define(definitions);
        }
    }
    define(definitions) {
        vineyard_schema_1.load_schema(definitions, this.trellises, this.library);
    }
    add_type(type) {
        this.library.add_type(type);
    }
}
exports.SchemaClass = SchemaClass;
//# sourceMappingURL=scheming.js.map