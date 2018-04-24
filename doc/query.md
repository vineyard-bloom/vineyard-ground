[Documentation](index.md)

# Queries

Queries are chainable, allowing for processes like:

    model.Character
      .filter({health: 20})
      .expand('inventory')
      .expand('race')
      .select(['id', 'inventory', 'race.name'])

Since queries are chainable, they are not actually executed until either the `exec` or `then` method is called.


#### Functions

##### `exec`
Executes the query.  This is only needed when `then` may not be called.

Returns `Promise`

##### `expand`
Changes a returned foreign key field to be returned as an object instead of a scalar key value.

Parameters

*  path `string` Path to the foreign key field to be expanded into an object


Returns `QueryBuilder`

##### `filter`
Filters a result set using a dictionary of key value pairs.
Maps to a SQL `WHERE` clause.
Currently this function only uses AND logic and does not support OR logic.
It also does not support null checks such as `WHERE field IS NULL`

Parameters

*  options `any` 

Returns `QueryBuilder`

##### `first`
Returns the first record in a result set

Parameters

* *(optional)* options `any` 

Returns `QueryBuilder`

##### `range`
Truncates a result set.
Maps to a SQL `LIMIT` clause.

Parameters

* *(optional)* start `` The offset of the truncation.

* *(optional)* length `` The maximum number or records to return



Returns `QueryBuilder`

##### `select`


Parameters

*  options `any` 

Returns `QueryBuilder`

##### `sort`
Sorts a result set.
Maps to a SQL `ORDER BY` clause

Parameters

*  args `string[]` An array of field names and optional 'asc' or 'desc' modifiers




Returns `QueryBuilder`

##### `then`
Executes the query and attaches a handler to the promise resolution.

Parameters

*  callback `ThenableCallback` 

Returns `Promise`

