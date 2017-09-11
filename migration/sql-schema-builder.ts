import {Schema} from "vineyard-schema"
import {Change, ChangeType} from "./types";
import {delimit, SqlBuilder} from "../source/sql/sql-building";
import {Property, Trellis} from "../../vineyard-schema/source/trellis";
import {getFieldType} from "../source/sql/field-types";

export class SqlSchemaBuilder {
  private schema: Schema
  private builder: SqlBuilder = new SqlBuilder()

  constructor(schema: Schema) {
    this.schema = schema;
  }

  /*
  CREATE TABLE "public"."bristles" (
      "id" uuid NOT NULL,
      "from" character varying(255)  NOT NULL,
      "to" character varying(255)  NOT NULL,
      "account" uuid,
      "status" integer DEFAULT 0 NOT NULL,
      "txid" character varying(255)  NOT NULL,
      "blockIndex" bigint DEFAULT 0 NOT NULL,
      "amount" numeric NOT NULL,
      "created" timestamptz NOT NULL,
      "modified" timestamptz NOT NULL,
      CONSTRAINT "bristles_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "bristles_account_fkey" FOREIGN KEY (account) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE SET NULL NOT DEFERRABLE
  ) WITH (oids = false);
   */

  createProperty(property: any) {
    const type = getFieldType(property, this.schema.library)
    return [
      this.builder.quote(property.name),
      type.name,
      property.nullable ? 'NOT NULL' : '',

    ]
  }

  private renderPropertyCreations(properties) {
    const tokens = []

    for (let name in properties) {
      tokens.push(this.createProperty(properties[name]))
    }

    return delimit(tokens, "\n,")
  }

  private createTable(trellis: Trellis) {
    return [
      'CREATE TABLE',
      trellis.name.toLowerCase(),
      '(',

      ')',
      'WITH (oids = false)',
    ]
  }

  private changeFieldNullable(property: Property) {

  }

  private changeFieldType(property: Property) {

  }

  private deleteField(property: Property) {

  }

  private deleteTable(property: Property) {

  }

  processChange(change: Change) {
    switch (change.type) {
      case ChangeType.createTable:
        return this.createTable(change.trellis)

      case ChangeType.changeFieldNullable:
        return this.changeFieldNullable(change.property)

      case ChangeType.changeFieldType:
        return this.changeFieldType(change.property)

      case ChangeType.deleteField:
        return this.deleteField(change.property)

      case ChangeType.deleteTable:
        return this.deleteTable(change.property)
    }
  }

  private buildChange(change: Change) {
    const token = this.processChange(change)
    return this.builder.flatten(token) + ';'
  }

  build(changes: Change[]): string {
    const result = changes.map(c => this.buildChange(c)).join('\n')
    return result
  }

}
