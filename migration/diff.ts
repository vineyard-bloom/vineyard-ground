import * as shell from 'shelljs'
import {Property, Schema, Trellis, Trellis_Map} from "vineyard-schema"
import {Change, ChangeType} from "./types";

function shellCommand(command) {
  console.log('shell', command)
  if (process.platform === 'win32') {
    return shell.exec('powershell "' + command + '"')
  }
  else {
    return shell.exec(command)
  }
}

function getJson(commit: string, path: string) {
  const json = shellCommand('git show ' + commit + ':' + path)
  return JSON.parse(json)
}

interface Bundle {
  first: any
  second: any
  trellises: Trellis_Map
}

type Property_Map = { [name: string]: Property }

function findChangedProperties(firstProperties: Property_Map, secondProperties: Property_Map): Change [] {
  let result = []
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
      if (first.type != second.type)
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

function findChangedTrellises(first: Trellis_Map, second: Trellis_Map): Change [] {
  let result = []
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
  const first = new Schema(firstJson).trellises
  const second = new Schema(secondJson).trellises
  return findChangedTrellises(first, second)
}