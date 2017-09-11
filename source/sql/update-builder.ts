import {Trellis} from "vineyard-schema"
import {delimit, Flattener, TrellisSqlBuilder, Token} from "./sql-building";

function getFieldName(f) {
  return f.field.name
}

function getValue(f) {
  return f.value
}

export class UpdateBuilder extends TrellisSqlBuilder {

  constructor(trellis: Trellis) {
    super(trellis)
  }

  private prepareFieldsAndValues(seed) {
    return []
  }

  formatAssignment(assignment) {
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

  buildConditions(seed) {
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

  buildCreate(seed) {
    const assignments = this.prepareFieldsAndValues(seed)
    const fields = delimit(assignments.map(getFieldName), ', ')
    const values = delimit(assignments.map(getValue), ', ')

    return ['INSERT INTO',
      this.getTableName(),
      '(', fields, ')',
      'VALUES',
      '(', values, ')']
  }

  buildUpdate(seed) {
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