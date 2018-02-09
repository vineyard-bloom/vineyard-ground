import {Type, Primitive} from "./type"

export type Type_Map = {[name: string]: Type}

export class Library {
  types: Type_Map

  constructor() {
    const guid = new Primitive('guid')

    this.types = {
      long: new Primitive('long'),
      bignumber: new Primitive('bignumber'),
      bool: new Primitive('bool'),
      char: new Primitive('char'),
      colossal: new Primitive('colossal'),
      date: new Primitive('date'),
      datetime: new Primitive('datetime'),
      float: new Primitive('float'),
      guid: guid,
      int: new Primitive('int'),
      json: new Primitive('json'),
      short: new Primitive('short'),
      string: new Primitive('string'),
      time: new Primitive('time'),
      text: new Primitive('text'),
      uuid: guid,
    }
  }

  add_type(type: Type) {
    if (this.types[type.name])
      throw new Error('Library already has a type named ' + type.name + '.')

    this.types [type.name] = type
  }
}
