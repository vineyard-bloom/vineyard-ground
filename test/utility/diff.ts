import * as shell from 'shelljs'
import * as assert from "assert";

const fs = require('fs')
const path = require('path')

export function viewDiff(firstPath: string, secondString: string, viewerPath: string) {
  if (!fs.existsSync('test/temp'))
    shell.mkdir('test/temp')

  const secondPath = path.resolve('test/temp/output.sql').replace('\\', '/')
  fs.writeFileSync(secondPath, secondString)
  shell.exec('"' + viewerPath + '"' + " /x /s " + secondPath + " " + firstPath)
}

export function checkDiff(firstPath: string, secondString: string, viewerPath: string) {
  const firstString = fs.readFileSync(firstPath, 'utf8')
  if (firstString == secondString) {
    assert.equal(firstString, secondString)
  }
  else {
    viewDiff(firstPath, secondString, viewerPath)
    assert.equal(firstString, secondString)
  }
}
