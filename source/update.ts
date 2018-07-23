import { Add, Operation, Operation_Type } from './list-operations'
import { processFields, to_lower } from "./utility"
import { Property, TableClient, Trellis } from "./types";

function prepare_reference(reference: Property, value: any) {
  const other_primary_key = reference.get_other_trellis().primary_keys[0].name
  if (typeof value === 'object') {
    if (!value) {
      if (reference.is_nullable)
        return null

      throw new Error(reference.get_path() + ' cannot be null')
    }

    if (value[other_primary_key])
      return value[other_primary_key]
    else
      throw new Error(reference.get_path() + ' is missing property "' + other_primary_key + '"')
  }
  else {
    return value
  }
}

function prepare_property(property: Property, value: any) {
  if (property.is_reference()) {
    return prepare_reference(property as Property, value)
  }
  else {
    if ((value === null || value === undefined) && property.is_nullable)
      return null

    if (typeof value === 'object') {
      if (property.type.name === 'colossal') {
        return value.toString()
      }
      if (property.type.name === 'bignumber') {
        return value.toString()
      }
      if (['json', 'jsonb', 'date', 'datetime', 'time'].indexOf(property.type.name) == -1)
        throw new Error(property.get_path() + ' cannot be an object')
    }

    return value
  }
}

function prepare_seed(seed: any, trellis: Trellis) {
  const newSeed: any = {}

  for (let i in seed) {
    const property = trellis.properties[i]
    if (!property)
      throw new Error("Invalid property: " + trellis.name + "." + i + '.')

    if (!property.is_list()) {
      newSeed [i] = prepare_property(property, seed[i])
    }
  }

  return newSeed
}

function formatOperation(operation: Operation | any): Operation {
  if (Object.keys(operation).length == 2 && operation.type != undefined && operation.item != undefined) {
    return operation
  }

  return Add(operation)
}

function perform_operation<T>(identity: any, list: Property, operationOrIdentity: Operation | any) {
  const operation = formatOperation(operationOrIdentity)

  switch (operation.type) {

    case Operation_Type.add: {
      const fields: any = {}
      fields [to_lower(list.trellis.name)] = identity
      fields [to_lower(list.other_property!.trellis.name)] = list.other_property!.trellis.get_identity(operation.item)
      if (!list.cross_table)
        throw Error("List is missing cross table.")

      return list.cross_table.create(fields)
    }

    case Operation_Type.remove: {
      const fields: any = {}
      fields [to_lower(list.trellis.name)] = identity
      fields [to_lower(list.other_property!.trellis.name)] = list.other_property!.trellis.get_identity(operation.item)
      if (!list.cross_table)
        throw Error("List is missing cross table.")

      return list.cross_table.destroy({
        where: fields,
        force: true
      })
    }

    default:
      throw new Error("Not implemented.")
  }
}

function update_list<T>(identity: any, seed: any, list: Property, table: TableClient<T>) {
  const value = seed[list.name]
  if (Array.isArray(value)) {
    return Promise.all(value.map(item => perform_operation(identity, list, item)))
  }
  else {
    return perform_operation(identity, list, value)
  }
}

function update_lists<T>(identity: any, seed: any, trellis: Trellis, table: TableClient<T>) {
  let promise = Promise.resolve()
  for (let list of trellis.get_lists()) {
    if (seed[list.name])
      promise = promise.then(() => update_list(identity, seed, list, table))
  }

  return promise
}

function post_process<T>(result: any, identity: any, seed: any, trellis: Trellis, table: TableClient<T>): Promise<T> {
  processFields(result.dataValues, trellis)
  return update_lists(identity, seed, trellis, table)
    .then(() => result.dataValues)
}

export function create<T>(seed: any, trellis: Trellis, table: TableClient<T>): Promise<T> {
  const newSeed = prepare_seed(seed, trellis)

  return table.create(newSeed)
    .then(result => post_process(result, trellis.get_identity(result), seed, trellis, table))
}

export function create_or_update<T>(seed: any, trellis: Trellis, table: TableClient<T>): Promise<T> {
  const newSeed = prepare_seed(seed, trellis)

  return table.upsert(newSeed)
    .then(result => post_process(result, trellis.get_identity(result), seed, trellis, table))
}

export function update<T>(seed: any, trellis: Trellis, table: TableClient<T>, changes?: any): Promise<T> {
  const primary_key = trellis.primary_keys[0].name
  const identity = trellis.get_identity(seed)
  const newSeed = prepare_seed(changes || seed, trellis)

  const filter: any = typeof identity === 'object'
    ? identity
    : { [primary_key]: identity }

  return table.update(newSeed, filter)
    .then((result: any) => post_process(result[1][0], identity, changes, trellis, table))

}