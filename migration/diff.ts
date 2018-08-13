const shell = require('shelljs')
import { Change, ChangeType, DiffBundle } from "./types";
import { Property, Trellis_Map, Index } from "../source";
import { Schema } from "../source/schema";
import * as fs from 'fs'

function shellCommand(command: string, echo: Boolean = false) {
  if (echo)
    console.log('shell', command)

  const options = {
    silent: !echo
  }

  const extendedCommand = process.platform === 'win32'
    ? 'powershell "' + command + '"'
    : command

  return shell.exec(extendedCommand, options)
}

function getJson(commit: string, path: string) {
  const json = shellCommand('git show ' + commit + ':' + path) as string
  return JSON.parse(json)
}

interface Bundle {
  first: any
  second: any
  trellises: Trellis_Map
}

type Property_Map = { [name: string]: Property }

function findChangedProperties(firstProperties: Property_Map, secondProperties: Property_Map): Change [] {
  let result: Change[] = []
  for (let name in firstProperties) {
    if (!secondProperties[name]) {
      result.push({
        type: ChangeType.deleteField,
        property: firstProperties[name],
      })
    }
  }
  for (let name in secondProperties) {
    const first = firstProperties [name]
    const second = secondProperties [name]
    if (!first) {
      result.push({
        type: ChangeType.createField,
        property: second,
      })
    }
    else {
      if (first.type.name != second.type.name)
        result.push({
          type: ChangeType.changeFieldType,
          property: second,
        })
      if (first.is_nullable != second.is_nullable) {
        result.push({
          type: ChangeType.changeFieldNullable,
          property: second,
        })
      }
    }
  }
  return result
}

function findChangedIndexes(firstIndexes: string[], secondIndexes: string[]): Change[] {
  let result: Change[] = []
  firstIndexes.forEach(index => {
    if (secondIndexes.indexOf(index) === -1) {
      result.push({
        type: ChangeType.deleteIndex,
        index: index
      })
    }
  })
  secondIndexes.forEach(index => {
    if (firstIndexes.indexOf(index) === -1) {
      result.push({
        type: ChangeType.createIndex,
        index: index
      })
    }
  })
  return result
}

export function findChangedTrellises(first: Trellis_Map, second: Trellis_Map): Change [] {
  let result: Change[] = []
  for (let name in first) {
    if (!second[name]) {
      result.push({
        type: ChangeType.deleteTable,
        trellis: first[name]
      })
    }
    // Also look through indexes?
  }
  for (let name in second) {
    if (!first[name]) {
      result.push({
        type: ChangeType.createTable,
        trellis: second[name]
      })
    }
    else {
      result = result.concat(findChangedProperties(first[name].properties, second[name].properties))
    }
    // Also look through indexes?
  }
  return result
}

function loadSchemaFromCommit(path: string, hash: string): Schema {
  const pathOffset = (shellCommand('git rev-parse --show-prefix') as string).trim()
  const fullPath = pathOffset + path
  const firstJson = getJson(hash, fullPath)
  return new Schema(firstJson)
}

export function getDiff(path: string, firstCommit: string, secondCommit: string): DiffBundle {
  const first = loadSchemaFromCommit(path, firstCommit)
  const second = loadSchemaFromCommit(path, secondCommit)
  return {
    changes: findChangedTrellises(first.trellises, second.trellises),
    originalSchema: first,
    firstCommit,
    secondCommit
  }
}

export function getCommitHashes(path: string, limit: number = 1): string[] {
  const shellOutput = (shellCommand('git log --pretty="%H" -' + limit + ' ' + path) as string).trim()
  return shellOutput.split(/\s+/g)
}

interface SchemaBundle {
  schema: Schema,
  name: string
}

function loadSchemaBundleFromCommit(path: string, hash: string): SchemaBundle {
  return {
    schema: loadSchemaFromCommit(path, hash),
    name: hash
  }
}

function routeSchemaGathering(path: string, commitHashes: string[]): [SchemaBundle, SchemaBundle] {
  if (commitHashes.length < 0 || commitHashes.length > 2)
    throw new Error("Invalid commitHash count: " + commitHashes.length)

  if (commitHashes.length == 2) {
    return [
      loadSchemaBundleFromCommit(path, commitHashes[0]),
      loadSchemaBundleFromCommit(path, commitHashes[1])
    ]
  }

  const commits = getCommitHashes(path, 2)
  if (commits.length < 1)
    throw new Error("There are not enough Git commits to that file to make a diff.")

  const firstCommit = commitHashes.length > 0
    ? loadSchemaBundleFromCommit(path, commitHashes[0])
    : loadSchemaBundleFromCommit(path, commits[1])

  const current = {
    schema: new Schema(JSON.parse(fs.readFileSync(path, 'utf8'))),
    name: 'current'
  }

  return [firstCommit, current]
}

export function getLatestDiff(path: string, commitHashes: string[] = []): DiffBundle {
  const commits = routeSchemaGathering(path, commitHashes)
  return {
    changes: findChangedTrellises(commits[0].schema.trellises, commits[1].schema.trellises),
    originalSchema: commits[0].schema,
    firstCommit: commits[0].name,
    secondCommit: commits[1].name
  }
}