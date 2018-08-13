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

function findChangedIndexes(tableName: string, firstIndexes: Index[], secondIndexes: Index[]): Change[] {
  let result: Change[] = []
  let firstProperties: string[] = []
  let secondProperties: string[] = []

  firstIndexes.forEach(indexArray => {
    indexArray.properties.forEach(property => {
      firstProperties.push(property)
    })
  })
  secondIndexes.forEach(indexArray => {
    indexArray.properties.forEach(property => {
      secondProperties.push(property)
    })
  })

  firstProperties.forEach(property => {
    if (secondProperties.indexOf(property) === -1) {
      result.push({
        type: ChangeType.deleteIndex,
        tableName: tableName,
        propertyName: property
      })
    }
  })
  secondProperties.forEach(property => {
    if (secondProperties.indexOf(property) === -1) {
      result.push({
        type: ChangeType.createIndex,
        tableName: tableName,
        propertyName: property
      })
    }
  })

  return result
}

export function findChangedTrellises(first: Trellis_Map, second: Trellis_Map): Change[] {
  let result: Change[] = []
  for (let name in first) {
    if (!second[name]) {
      result.push({
        type: ChangeType.deleteTable,
        trellis: first[name]
      })
    }
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
  }

  for (let name in first) {
    if (first[name].table.indexes && !second[name].table.indexes) {
      first[name].table.indexes!.forEach(index => {
        index.properties.forEach(property => {
          result.push({
            type: ChangeType.deleteIndex,
            tableName: first[name].name,
            propertyName: property
          })
        })
      })
    } else if (second[name].table.indexes && !first[name].table.indexes) {
      second[name].table.indexes!.forEach(index => {
        index.properties.forEach(property => {
          result.push({
            type: ChangeType.createIndex,
            tableName: second[name].name,
            propertyName: property
          })
        })
      })
    } else {
      result = result.concat(findChangedIndexes(first[name].name, first[name].table.indexes!, second[name].table.indexes!))
    }
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