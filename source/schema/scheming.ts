import {Trellis} from "./trellis"
import {Library} from './library'
import {load_schema} from "./loading"
import {Type} from "./type";

export type Trellis_Map = {[name: string]: Trellis}

export class Schema {
  trellises: Trellis_Map = {}
  library: Library = new Library()

  constructor(definitions: any = undefined) {
    if (definitions) {
      this.define(definitions)
    }
  }

  define(definitions:any) {
    load_schema(definitions, this.trellises, this.library)
  }

  add_type(type: Type){
    this.library.add_type(type)
  }
}