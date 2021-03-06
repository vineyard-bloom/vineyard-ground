import {Property, Trellis} from "../source/types";

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
}

export interface TableChange {
  type: ChangeType.createTable | ChangeType.deleteTable
  trellis: Trellis
  property?: undefined
}