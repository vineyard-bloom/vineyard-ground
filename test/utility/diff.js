"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require('shelljs');
const assert = require("assert");
const fs = require('fs');
const path = require('path');
function viewDiff(firstPath, secondString, viewerPath) {
    if (!fs.existsSync('test/temp'))
        shell.mkdir('test/temp');
    const secondPath = path.resolve('test/temp/output.sql').replace('\\', '/');
    fs.writeFileSync(secondPath, secondString);
    shell.exec('"' + viewerPath + '"' + " /x /s " + secondPath + " " + firstPath);
}
exports.viewDiff = viewDiff;
function checkDiff(firstPath, secondString, viewerPath) {
    const firstString = fs.readFileSync(firstPath, 'utf8');
    if (firstString == secondString) {
        assert.equal(firstString, secondString);
    }
    else {
        viewDiff(firstPath, secondString, viewerPath);
        assert.equal(firstString, secondString);
    }
}
exports.checkDiff = checkDiff;
//# sourceMappingURL=diff.js.map