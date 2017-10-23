export enum Type_Category {
  incomplete,
  decimal,
  primitive,
  list,
  trellis,
}

export abstract class Type {
  name: string

  constructor(name: string) {
    this.name = name
  }

  abstract get_category(): Type_Category

  abstract get_other_trellis_name(): string
}

export class Primitive extends Type {

  constructor(name: string) {
    super(name)
  }

  get_category(): Type_Category {
    return Type_Category.primitive
  }

  get_other_trellis_name(): string {
    throw Error("Primitive types do not point to a trellis.")
  }
}

export type Precision = number []

export class Decimal extends Primitive {
  precision: Precision

  constructor(name: string, precision: Precision) {
    super(name)
    this.precision = precision
  }
}

export class List_Type extends Type {
  child_type: Type

  constructor(name: string, child_type: Type) {
    super(name)
    this.child_type = child_type
  }

  get_category(): Type_Category {
    return Type_Category.list
  }

  get_other_trellis_name(): string {
    return this.child_type.get_other_trellis_name()
  }
}
