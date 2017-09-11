import {Trellis} from "vineyard-schema"
import {Property} from "vineyard-schema";

export enum ChangeType {
  createTable,
  createField,
  deleteField,
  deleteTable,
  changeFieldType,
  changeFieldNullable,
}

export interface Change {
  type: ChangeType
  trellis?: Trellis
  property?: Property
  // oldProperty?: Property
}