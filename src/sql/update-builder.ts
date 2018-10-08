import {Trellis} from "vineyard-schema"
import {delimit, Flattener, TrellisSqlGenerator, Token} from "./sql-building";

function getFieldName(f: any) {
  return f.field.name
}

function getValue(f: any) {
  return f.value
}

export class UpdateBuilder extends TrellisSqlGenerator {

  constructor(trellis: Trellis) {
    super(trellis)
  }

  private prepareFieldsAndValues(seed: any) {
    return []
  }

  formatAssignment(assignment: any) {
    return [
      'SET',
      this.builder.quote(assignment.field.name),
      '=',
      {value: assignment.value}
    ]
  }

  formatAssignments(assignments: any[]) {
    return assignments.map(a => this.formatAssignment(a))
  }

  buildConditions(seed: any) {
    return this.trellis.primary_keys.map(k => {
      const value = seed[k.name]
      if (!value)
        throw new Error('')

      return [
        this.builder.quote(k.name),
        '=',
        {value: value}
      ]
    })
  }

  buildCreate(seed: any) {
    const assignments = this.prepareFieldsAndValues(seed)
    const fields = delimit(assignments.map(getFieldName), ', ')
    const values = delimit(assignments.map(getValue), ', ')

    return ['INSERT INTO',
      this.getTableName(),
      '(', fields, ')',
      'VALUES',
      '(', values, ')']
  }

  buildUpdate(seed: any) {
    const assignments = this.prepareFieldsAndValues(seed)
    const assignmentClause = delimit(this.formatAssignments(assignments), ', ')
    const conditionClause = delimit(this.buildConditions(seed), 'AND')

    return ['UPDATE',
      this.getTableName(),
      assignmentClause,
      'WHERE', conditionClause
    ]
  }
}