"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require('shelljs');
const types_1 = require("./types");
const schema_1 = require("../source/schema");
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
    const json = shellCommand('git show ' + commit + ':' + path);
    return JSON.parse(json);
}
function findChangedProperties(firstProperties, secondProperties) {
    let result = [];
    for (let name in firstProperties) {
        if (!secondProperties[name]) {
            result.push({
                type: types_1.ChangeType.deleteField,
                property: firstProperties[name],
            });
        }
    }
    for (let name in secondProperties) {
        const first = firstProperties[name];
        const second = secondProperties[name];
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
    let result = [];
    for (let name in first) {
        if (!second[name]) {
            result.push({
                type: types_1.ChangeType.deleteTable,
                trellis: first[name]
            });
        }
    }
    for (let name in second) {
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
    const firstJson = getJson(firstCommit, path);
    const secondJson = getJson(secondCommit, path);
    const first = new schema_1.Schema(firstJson).trellises;
    const second = new schema_1.Schema(secondJson).trellises;
    return findChangedTrellises(first, second);
}
exports.get_diff = get_diff;
//# sourceMappingURL=diff.js.map