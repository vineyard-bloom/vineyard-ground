"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Type_Category;
(function (Type_Category) {
    Type_Category[Type_Category["incomplete"] = 0] = "incomplete";
    Type_Category[Type_Category["decimal"] = 1] = "decimal";
    Type_Category[Type_Category["primitive"] = 2] = "primitive";
    Type_Category[Type_Category["list"] = 3] = "list";
    Type_Category[Type_Category["trellis"] = 4] = "trellis";
})(Type_Category = exports.Type_Category || (exports.Type_Category = {}));
class Type {
    constructor(name) {
        this.name = name;
    }
}
exports.Type = Type;
class Primitive extends Type {
    constructor(name) {
        super(name);
    }
    get_category() {
        return Type_Category.primitive;
    }
    get_other_trellis_name() {
        throw Error("Primitive types do not point to a trellis.");
    }
}
exports.Primitive = Primitive;
class Decimal extends Primitive {
    constructor(name, precision) {
        super(name);
        this.precision = precision;
    }
}
exports.Decimal = Decimal;
class List_Type extends Type {
    constructor(name, child_type) {
        super(name);
        this.child_type = child_type;
    }
    get_category() {
        return Type_Category.list;
    }
    get_other_trellis_name() {
        return this.child_type.get_other_trellis_name();
    }
}
exports.List_Type = List_Type;
//# sourceMappingURL=type.js.map