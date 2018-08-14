"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Type_Category;
(function (Type_Category) {
    Type_Category[Type_Category["incomplete"] = 0] = "incomplete";
    Type_Category[Type_Category["decimal"] = 1] = "decimal";
    Type_Category[Type_Category["primitive"] = 2] = "primitive";
    Type_Category[Type_Category["list"] = 3] = "list";
    Type_Category[Type_Category["trellis"] = 4] = "trellis";
})(Type_Category = exports.Type_Category || (exports.Type_Category = {}));
var Type = /** @class */ (function () {
    function Type(name) {
        this.name = name;
    }
    return Type;
}());
exports.Type = Type;
var Primitive = /** @class */ (function (_super) {
    __extends(Primitive, _super);
    function Primitive(name) {
        return _super.call(this, name) || this;
    }
    Primitive.prototype.get_category = function () {
        return Type_Category.primitive;
    };
    Primitive.prototype.get_other_trellis_name = function () {
        throw Error("Primitive types do not point to a trellis.");
    };
    return Primitive;
}(Type));
exports.Primitive = Primitive;
var Decimal = /** @class */ (function (_super) {
    __extends(Decimal, _super);
    function Decimal(name, precision) {
        var _this = _super.call(this, name) || this;
        _this.precision = precision;
        return _this;
    }
    return Decimal;
}(Primitive));
exports.Decimal = Decimal;
var List_Type = /** @class */ (function (_super) {
    __extends(List_Type, _super);
    function List_Type(name, child_type) {
        var _this = _super.call(this, name) || this;
        _this.child_type = child_type;
        return _this;
    }
    List_Type.prototype.get_category = function () {
        return Type_Category.list;
    };
    List_Type.prototype.get_other_trellis_name = function () {
        return this.child_type.get_other_trellis_name();
    };
    return List_Type;
}(Type));
exports.List_Type = List_Type;
//# sourceMappingURL=type.js.map