"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shell = require("shelljs");
var types_1 = require("./types");
function shellCommand(command) {
    console.log('shell', command);
    if (process.platform === 'win32') {
        return shell.exec('powershell "' + command + '"');
    }
    else {
        return shell.exec(command);
    }
}
function getJson(commit, path) {
    var json = shellCommand('git show ' + commit + ':' + path);
    return JSON.parse(json);
}
function findChangedProperties(firstProperties, secondProperties) {
    var result = [];
    for (var name_1 in firstProperties) {
        if (!secondProperties[name_1]) {
            result.push({
                type: types_1.ChangeType.deleteField,
                property: firstProperties[name_1],
            });
        }
    }
    for (var name_2 in secondProperties) {
        var first = firstProperties[name_2];
        var second = secondProperties[name_2];
        if (!first) {
            result.push({
                type: types_1.ChangeType.createField,
                property: second,
            });
        }
        else {
            if (first.type != second.type)
                result.push({
                    type: types_1.ChangeType.changeFieldType,
                    property: second,
                });
            if (first.is_nullable != second.is_nullable) {
                result.push({
                    type: types_1.ChangeType.changeFieldNullable,
                    property: second,
                });
            }
        }
    }
    return result;
}
function findChangedTrellises(first, second) {
    var result = [];
    for (var name_3 in first) {
        if (!second[name_3]) {
            result.push({
                type: types_1.ChangeType.deleteTable,
                trellis: first[name_3]
            });
        }
    }
    for (var name_4 in second) {
        if (!first[name_4]) {
            result.push({
                type: types_1.ChangeType.createTable,
                trellis: second[name_4]
            });
        }
        else {
            result = result.concat(findChangedProperties(first[name_4].properties, second[name_4].properties));
        }
    }
    return result;
}
function get_diff(path, firstCommit, secondCommit) {
    var firstJson = getJson(firstCommit, path);
    var secondJson = getJson(secondCommit, path);
    var first = new Schema(firstJson).trellises;
    var second = new Schema(secondJson).trellises;
    return findChangedTrellises(first, second);
}
exports.get_diff = get_diff;
//# sourceMappingURL=diff.js.map