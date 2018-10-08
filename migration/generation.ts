import { ChangeType, DiffBundle, TableChange } from "./types";
import {SqlSchemaBuilder} from "./sql-schema-builder";
import {Schema} from 'vineyard-schema'

export function generateInitializationSql(schema: Schema): string {
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

export function generateMigrationSql(diffBundle: DiffBundle): string {
  const builder = new SqlSchemaBuilder(diffBundle.originalSchema)
  return builder.build(diffBundle.changes)
}