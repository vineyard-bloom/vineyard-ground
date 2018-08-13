import {Property, Trellis, Index} from "../source/types";

export enum ChangeType {
  createTable,
  createField,
  createIndex,
  deleteField,
  deleteTable,
  deleteIndex,
  changeFieldType,
  changeFieldNullable,
}

export interface Change {
  type: ChangeType
  trellis?: Trellis
  property?: Property
  index?: string
}

export interface TableChange {
  type: ChangeType.createTable | ChangeType.deleteTable
  trellis: Trellis
  property?: undefined
}

export interface DiffBundle {
  changes: any
  originalSchema: any
  firstCommit: string
  secondCommit: string
}
