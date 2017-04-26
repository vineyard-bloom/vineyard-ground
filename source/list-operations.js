"use strict";
(function (Operation_Type) {
    Operation_Type[Operation_Type["add"] = 0] = "add";
    Operation_Type[Operation_Type["clear"] = 1] = "clear";
    Operation_Type[Operation_Type["remove"] = 2] = "remove";
})(exports.Operation_Type || (exports.Operation_Type = {}));
var Operation_Type = exports.Operation_Type;
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
