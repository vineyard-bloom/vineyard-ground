"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const shell = require('shelljs');
const types_1 = require("./types");
const fs = require("fs");
function shellCommand(command, echo = false) {
    if (echo)
        console.log('shell', command);
    const options = {
        silent: !echo
    };
    const extendedCommand = process.platform === 'win32'
        ? 'powershell "' + command + '"'
        : command;
    return shell.exec(extendedCommand, options);
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
    let result = [];
    const firstIndexes = first[tableName].table.indexes;
    const secondIndexes = second[tableName].table.indexes;
    if (firstIndexes.length > 0 || secondIndexes.length > 0) {
        // May not need this first part
        if (firstIndexes.length > 0 && secondIndexes.length === 0) {
            firstIndexes.forEach(indexItem => {
                indexItem.properties.forEach(property => {
                    result.push({
                        type: types_1.ChangeType.deleteIndex,
                        tableName: first[tableName].table.name,
                        propertyName: property
                    });
                });
            });
        }
        else if (secondIndexes.length > 0 && firstIndexes.length === 0) {
            secondIndexes.forEach(indexItem => {
                indexItem.properties.forEach(property => {
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
    let result = [];
    let firstProperties = [];
    let secondProperties = [];
    firstIndexes.forEach(indexItem => {
        indexItem.properties.forEach(property => {
            firstProperties.push(property);
        });
    });
    secondIndexes.forEach(indexItem => {
        indexItem.properties.forEach(property => {
            secondProperties.push(property);
        });
    });
    firstProperties.forEach(property => {
        if (secondProperties.indexOf(property) === -1) {
            result.push({
                type: types_1.ChangeType.deleteIndex,
                tableName: tableName,
                propertyName: property
            });
        }
    });
    secondProperties.forEach(property => {
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
    const pathOffset = shellCommand('git rev-parse --show-prefix').trim();
    const fullPath = pathOffset + path;
    const firstJson = getJson(hash, fullPath);
    return new src_1.SchemaClass(firstJson);
}
function getDiff(path, firstCommit, secondCommit) {
    const first = loadSchemaFromCommit(path, firstCommit);
    const second = loadSchemaFromCommit(path, secondCommit);
    return {
        changes: findChangedTrellises(first.trellises, second.trellises),
        originalSchema: first,
        firstCommit,
        secondCommit
    };
}
exports.getDiff = getDiff;
function getCommitHashes(path, limit = 1) {
    const shellOutput = shellCommand('git log --pretty="%H" -' + limit + ' ' + path).trim();
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
    const commits = getCommitHashes(path, 2);
    if (commits.length < 1)
        throw new Error("There are not enough Git commits to that file to make a diff.");
    const firstCommit = commitHashes.length > 0
        ? loadSchemaBundleFromCommit(path, commitHashes[0])
        : loadSchemaBundleFromCommit(path, commits[1]);
    const current = {
        schema: new src_1.SchemaClass(JSON.parse(fs.readFileSync(path, 'utf8'))),
        name: 'current'
    };
    return [firstCommit, current];
}
function getLatestDiff(path, commitHashes = []) {
    const commits = routeSchemaGathering(path, commitHashes);
    return {
        changes: findChangedTrellises(commits[0].schema.trellises, commits[1].schema.trellises),
        originalSchema: commits[0].schema,
        firstCommit: commits[0].name,
        secondCommit: commits[1].name
    };
}
exports.getLatestDiff = getLatestDiff;
//# sourceMappingURL=diff.js.map