const shell = require('shelljs')
import {Change, ChangeType} from "./types";
import {Property, Trellis, Trellis_Map} from "../source/types";
import {Schema} from "../source/schema";

function shellCommand(command: string) {
  console.log('shell', command)
  if (process.platform === 'win32') {
    return shell.exec('powershell "' + command + '"')
  }
  else {
    return shell.exec(command)
  }
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
      console.log(`the first type of ${name} is ${first.type.name}`)
      console.log(`the second type of ${name} is ${second.type.name}`)
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

export function findChangedTrellises(first: Trellis_Map, second: Trellis_Map): Change [] {
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
  return result
}

export function get_diff(path: string, firstCommit: string, secondCommit: string) {
  const firstJson = getJson(firstCommit, path)
  const secondJson = getJson(secondCommit, path)
  const first:any = new Schema(firstJson).trellises
  const second:any = new Schema(secondJson).trellises
  return findChangedTrellises(first, second)
  // TODO Return more complex object of changes plus the first schema?
}