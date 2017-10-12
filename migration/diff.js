"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shell = require('shelljs');
var types_1 = require("./types");
var scheming_1 = require("vineyard-schema/source/scheming");
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
    for (var name in firstProperties) {
        if (!secondProperties[name]) {
            result.push({
                type: types_1.ChangeType.deleteField,
                property: firstProperties[name],
            });
        }
    }
    for (var name in secondProperties) {
        var first = firstProperties[name];
        var second = secondProperties[name];
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
    for (var name in first) {
        if (!second[name]) {
            result.push({
                type: types_1.ChangeType.deleteTable,
                trellis: first[name]
            });
        }
    }
    for (var name in second) {
        if (!first[name]) {
            result.push({
                type: types_1.ChangeType.createTable,
                trellis: second[name]
            });
        }
        else {
            result = result.concat(findChangedProperties(first[name].properties, second[name].properties));
        }
    }
    return result;
}
function get_diff(path, firstCommit, secondCommit) {
    var firstJson = getJson(firstCommit, path);
    var secondJson = getJson(secondCommit, path);
    var first = new scheming_1.Schema(firstJson).trellises;
    var second = new scheming_1.Schema(secondJson).trellises;
    return findChangedTrellises(first, second);
}
exports.get_diff = get_diff;
//# sourceMappingURL=diff.js.map