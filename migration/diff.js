"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shell = require('shelljs');
var types_1 = require("./types");
var schema_1 = require("../source/schema");
var fs = require("fs");
function shellCommand(command, echo) {
    if (echo === void 0) { echo = false; }
    if (echo)
        console.log('shell', command);
    var options = {
        silent: !echo
    };
    var extendedCommand = process.platform === 'win32'
        ? 'powershell "' + command + '"'
        : command;
    return shell.exec(extendedCommand, options);
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
            if (first.type.name != second.type.name)
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
function findChangedIndexes(tableName, first, second) {
    var result = [];
    var firstIndexes = first[tableName].table.indexes;
    var secondIndexes = second[tableName].table.indexes;
    if (firstIndexes.length > 0 || secondIndexes.length > 0) {
        // May not need this first part
        if (firstIndexes.length > 0 && secondIndexes.length === 0) {
            firstIndexes.forEach(function (indexItem) {
                indexItem.properties.forEach(function (property) {
                    result.push({
                        type: types_1.ChangeType.deleteIndex,
                        tableName: first[tableName].table.name,
                        propertyName: property
                    });
                });
            });
        }
        else if (secondIndexes.length > 0 && firstIndexes.length === 0) {
            secondIndexes.forEach(function (indexItem) {
                indexItem.properties.forEach(function (property) {
                    result.push({
                        type: types_1.ChangeType.createIndex,
                        tableName: second[tableName].table.name,
                        propertyName: property
                    });
                });
            });
        }
        else {
            result = result.concat(findChangedIndexProperties(first[tableName].table.name, firstIndexes, secondIndexes));
        }
    }
    return result;
}
function findChangedIndexProperties(tableName, firstIndexes, secondIndexes) {
    var result = [];
    var firstProperties = [];
    var secondProperties = [];
    firstIndexes.forEach(function (indexItem) {
        indexItem.properties.forEach(function (property) {
            firstProperties.push(property);
        });
    });
    secondIndexes.forEach(function (indexItem) {
        indexItem.properties.forEach(function (property) {
            secondProperties.push(property);
        });
    });
    firstProperties.forEach(function (property) {
        if (secondProperties.indexOf(property) === -1) {
            result.push({
                type: types_1.ChangeType.deleteIndex,
                tableName: tableName,
                propertyName: property
            });
        }
    });
    secondProperties.forEach(function (property) {
        if (firstProperties.indexOf(property) === -1) {
            result.push({
                type: types_1.ChangeType.createIndex,
                tableName: tableName,
                propertyName: property
            });
        }
    });
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
        if (first[name] && second[name]) {
            if (first[name].table.indexes.length > 0 || second[name].table.indexes.length > 0) {
                result = result.concat(findChangedIndexes(name, first, second));
            }
        }
    }
    return result;
}
exports.findChangedTrellises = findChangedTrellises;
function loadSchemaFromCommit(path, hash) {
    var pathOffset = shellCommand('git rev-parse --show-prefix').trim();
    var fullPath = pathOffset + path;
    var firstJson = getJson(hash, fullPath);
    return new schema_1.Schema(firstJson);
}
function getDiff(path, firstCommit, secondCommit) {
    var first = loadSchemaFromCommit(path, firstCommit);
    var second = loadSchemaFromCommit(path, secondCommit);
    return {
        changes: findChangedTrellises(first.trellises, second.trellises),
        originalSchema: first,
        firstCommit: firstCommit,
        secondCommit: secondCommit
    };
}
exports.getDiff = getDiff;
function getCommitHashes(path, limit) {
    if (limit === void 0) { limit = 1; }
    var shellOutput = shellCommand('git log --pretty="%H" -' + limit + ' ' + path).trim();
    return shellOutput.split(/\s+/g);
}
exports.getCommitHashes = getCommitHashes;
function loadSchemaBundleFromCommit(path, hash) {
    return {
        schema: loadSchemaFromCommit(path, hash),
        name: hash
    };
}
function routeSchemaGathering(path, commitHashes) {
    if (commitHashes.length < 0 || commitHashes.length > 2)
        throw new Error("Invalid commitHash count: " + commitHashes.length);
    if (commitHashes.length == 2) {
        return [
            loadSchemaBundleFromCommit(path, commitHashes[0]),
            loadSchemaBundleFromCommit(path, commitHashes[1])
        ];
    }
    var commits = getCommitHashes(path, 2);
    if (commits.length < 1)
        throw new Error("There are not enough Git commits to that file to make a diff.");
    var firstCommit = commitHashes.length > 0
        ? loadSchemaBundleFromCommit(path, commitHashes[0])
        : loadSchemaBundleFromCommit(path, commits[1]);
    var current = {
        schema: new schema_1.Schema(JSON.parse(fs.readFileSync(path, 'utf8'))),
        name: 'current'
    };
    return [firstCommit, current];
}
function getLatestDiff(path, commitHashes) {
    if (commitHashes === void 0) { commitHashes = []; }
    var commits = routeSchemaGathering(path, commitHashes);
    return {
        changes: findChangedTrellises(commits[0].schema.trellises, commits[1].schema.trellises),
        originalSchema: commits[0].schema,
        firstCommit: commits[0].name,
        secondCommit: commits[1].name
    };
}
exports.getLatestDiff = getLatestDiff;
//# sourceMappingURL=diff.js.map