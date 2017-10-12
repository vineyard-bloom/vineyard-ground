import {ChangeType, TableChange} from "./types";
import {SqlSchemaBuilder} from "./sql-schema-builder";
import {Schema} from "../source/types";

export function generate(schema: Schema): string {
  let changes:TableChange[] = []
  for (let name in schema.trellises) {
    const trellis = schema.trellises [name]
    changes.push({
      type: ChangeType.createTable,
      trellis: trellis
    })
  }

  changes = changes.sort((a, b) => {
    if (a.trellis.table.name < b.trellis.table.name)
      return -1
    if (a.trellis.table.name > b.trellis.table.name)
      return 1
    else
      return 0
  })

  const builder = new SqlSchemaBuilder(schema)
  return builder.build(changes)
}