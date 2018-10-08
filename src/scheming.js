"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vineyard_schema_1 = require("vineyard-schema");
var SchemaClass = /** @class */ (function () {
    function SchemaClass(definitions) {
        if (definitions === void 0) { definitions = undefined; }
        this.trellises = {};
        this.library = new vineyard_schema_1.LibraryImplementation();
        this.tables = {};
        if (definitions) {
            this.define(definitions);
        }
    }
    SchemaClass.prototype.define = function (definitions) {
        vineyard_schema_1.load_schema(definitions, this.trellises, this.library);
    };
    SchemaClass.prototype.add_type = function (type) {
        this.library.add_type(type);
    };
    return SchemaClass;
}());
exports.SchemaClass = SchemaClass;
//# sourceMappingURL=scheming.js.map