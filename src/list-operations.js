"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Operation_Type;
(function (Operation_Type) {
    Operation_Type["add"] = "add";
    Operation_Type["clear"] = "clear";
    Operation_Type["remove"] = "remove";
})(Operation_Type = exports.Operation_Type || (exports.Operation_Type = {}));
function Add(item) {
    return {
        type: Operation_Type.add,
        item: item
    };
}
exports.Add = Add;
function Clear() {
    return {
        type: Operation_Type.clear
    };
}
exports.Clear = Clear;
function Remove(item) {
    return {
        type: Operation_Type.remove,
        item: item
    };
}
exports.Remove = Remove;
//# sourceMappingURL=list-operations.js.map