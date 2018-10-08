import {Schema, TrellisMap, Types, load_schema, LibraryImplementation} from 'vineyard-schema'
import {SequelizeTables} from './types'

export class SchemaClass implements Schema{
  trellises: TrellisMap = {}
  library: LibraryImplementation = new LibraryImplementation()
  tables: SequelizeTables = {}

  constructor(definitions: any = undefined) {
    if (definitions) {
      this.define(definitions)
    }
  }

  define(definitions: any) {
    load_schema(definitions, this.trellises, this.library)
  }

  add_type(type: Types) {
    this.library.add_type(type)
  }
}
