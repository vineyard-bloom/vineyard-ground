import {Type, Type_Category, List_Type} from './type'

export class Trellis_Type extends Type {
  trellis: Trellis

  constructor(name: string, trellis: Trellis) {
    super(name)
    this.trellis = trellis
  }

  get_category(): Type_Category {
    return Type_Category.trellis
  }

  get_other_trellis_name(): string {
    return this.trellis.name
  }
}

export interface Property {
  name: string
  type: Type
  trellis: Trellis
  is_nullable: boolean
  "default": any
  is_unique: boolean

  get_path(): string

  is_reference(): boolean

  is_list(): boolean
}

export class StandardProperty implements Property {
  name: string
  type: Type
  trellis: Trellis
  is_nullable: boolean = false
  "default": any
  is_unique: boolean = false

  constructor(name: string, type: Type, trellis: Trellis) {
    this.name = name
    this.type = type
    this.trellis = trellis
  }

  get_path(): string {
    return this.trellis.name + '.' + this.name
  }

  is_reference(): boolean {
    return this.type.get_category() == Type_Category.trellis
      || this.type.get_category() == Type_Category.list
      || this.type.get_category() == Type_Category.incomplete
  }

  is_list(): boolean {
    return this.type.get_category() == Type_Category.list
  }
}

export class Reference extends StandardProperty {
  other_property: Property

  constructor(name: string, type: Type, trellis: Trellis, other_property?: Property) {
    super(name, type, trellis)
    if (other_property)
      this.other_property = other_property
  }

  get_other_trellis(): Trellis {
    return this.type.get_category() == Type_Category.trellis
      ? (this.type as Trellis_Type).trellis
      : ((this.type as List_Type).child_type as Trellis_Type).trellis
  }
}

function get_key_identity(data: any, name: string) {
  const id = data[name]
  if (id)
    return id

  if (typeof data === 'object')
    throw new Error('Cannot retrieve identity from object because primary key "'
      + name + '" is missing.')

  return data
}

export interface ITrellis {
  name: string
  properties: { [name: string]: Property }
  primary_keys: Property[]
  parent?: Trellis | null
}

export class Trellis implements ITrellis {
  name: string
  properties: { [name: string]: Property } = {}
  primary_keys: Property[] = []
  parent: Trellis | null = null

  // Deprecated
  primary_key: Property

  private lists: Reference[]
  additional: any = {}

  constructor(name: string) {
    this.name = name
  }

  get_lists(): Reference[] {
    if (this.lists)
      return this.lists

    const result: Reference[] = []
    for (let name in this.properties) {
      const property = this.properties [name]
      if (property.is_list())
        result.push(property as Reference)
    }

    this.lists = result
    return result
  }

  get_identity(data: any) {
    if (!data)
      throw new Error("Identity cannot be empty.")

    if (this.primary_keys.length > 1) {
      const result: { [name: string]: any } = {}
      for (let i = 0; i < this.primary_keys.length; ++i) {
        const property = this.primary_keys[i]
        result[property.name] = get_key_identity(data, property.name)
      }
      return result
    }

    return get_key_identity(data, this.primary_keys[0].name)
  }

  getIdentity(data: any) {
    return this.get_identity(data)
  }
}

export function getIdentity(trellis: ITrellis, data: any) {
  if (!data)
    throw new Error("Identity cannot be empty.")

  if (trellis.primary_keys.length > 1) {
    const result: { [name: string]: any } = {}
    for (let i = 0; i < trellis.primary_keys.length; ++i) {
      const property = trellis.primary_keys[i]
      result[property.name] = get_key_identity(data, property.name)
    }
    return result
  }

  return get_key_identity(data, trellis.primary_keys[0].name)
}
