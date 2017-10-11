import {Operation, Operation_Type} from './list-operations'
import {to_lower} from "./utility"
import {Property, Trellis} from "./types";

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
  else if (property.type.name == 'json' && property.trellis['table'].sequelize.getDialect() == 'mysql') {
    return JSON.stringify(value)
  }
  else {
    if ((value === null || value === undefined) && property.is_nullable)
      return null

    if (typeof value === 'object') {
      if (property.type.name === 'colossal') {
        return value.toString()
      }

      if (['json', 'jsonb', 'date', 'datetime', 'time'].indexOf(property.type.name) == -1)
        throw new Error(property.get_path() + ' cannot be an object')
    }

    return value
  }
}

function prepare_seed(seed: any, trellis: Trellis) {
  const new_seed: any = {}

  for (let i in seed) {
    const property = trellis.properties[i]
    if (!property)
      throw new Error("Invalid property: " + trellis.name + "." + i + '.')

    if (!property.is_list()) {
      new_seed [i] = prepare_property(property, seed[i])
    }
  }

  return new_seed
}

function perform_operation(identity: any, seed: any, list: Property, sequelize: any, operation: Operation) {
  switch (operation.type) {

    case Operation_Type.add: {
      const fields: any = {}
      fields [to_lower(list.trellis.name)] = identity
      fields [to_lower(list.other_property.trellis.name)] = list.other_property.trellis.get_identity(operation.item)
      if (!list.cross_table)
        throw Error("List is missing cross table.")

      return list.cross_table.create(fields)
    }

    case Operation_Type.remove: {
      const fields: any = {}
      fields [to_lower(list.trellis.name)] = identity
      fields [to_lower(list.other_property.trellis.name)] = list.other_property.trellis.get_identity(operation.item)
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

function update_list(identity: any, seed: any, list: Property, sequelize: any) {
  const value = seed[list.name]
  if (Array.isArray(value)) {
    return Promise.all(value.map(item => perform_operation(identity, seed, list, sequelize, item)))
  }
  else {
    return perform_operation(identity, seed, list, sequelize, value)
  }
}

function update_lists(identity: any, seed: any, trellis: Trellis, sequelize: any) {
  let promise = Promise.resolve()
  for (let list of trellis.get_lists()) {
    if (seed[list.name])
      promise = promise.then(() => update_list(identity, seed, list, sequelize))
  }

  return promise
}

function post_process(result: any, identity: any, seed: any, trellis: Trellis, sequelize: any) {
  return update_lists(identity, seed, trellis, sequelize)
    .then(() => result.dataValues)
}

export function create<T>(seed: any, trellis: Trellis, sequelize: any): Promise<T> {
  const new_seed = prepare_seed(seed, trellis)

  return sequelize.create(new_seed)
    .then((result: any) => post_process(result, trellis.get_identity(result.dataValues), seed, trellis, sequelize))
}

export function create_or_update<T>(seed: any, trellis: Trellis, sequelize: any): Promise<T> {
  const new_seed = prepare_seed(seed, trellis)

  return sequelize.upsert(new_seed)
    .then((result: any) => post_process(result, trellis.get_identity(result), seed, trellis, sequelize))
}

export function update<T>(seed: any, trellis: Trellis, sequelize: any, changes?: any): Promise<T> {
  const primary_key = trellis.primary_keys[0].name
  const identity = trellis.get_identity(seed)
  const new_seed = prepare_seed(changes || seed, trellis)

  const filter: any = {}
  filter[primary_key] = identity

  return sequelize.update(new_seed, {
    where: filter,
    returning: true
  })
    .then((result: any) => post_process(result[1][0], identity, changes, trellis, sequelize))

}