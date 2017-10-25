[Documentation](index.md)

# Queries

Queries are chainable, allowing for processes like:

    model.Character
      .filter({health: 20})
      .expand('inventory')
      .expand('race')
      .select(['id', 'inventory', 'race.name'])

Since queries are chainable, they are not actually executed until either the `exec` or `then` method is called.

#### `then(handler: any): Promise<any>`

Executes the query and attaches a handler to the promise resolution.

#### `exec(): Promise<any>`

Executes the query.  This is only needed when `then` is not called.

#### `filter(options): Query<T>`

Returns a query containing all items in the current query that match the key/value pairs in `options`

#### `first(options?): Query<T>`

Returns the first item in the current query, optionally filtered by key/value pairs.

#### `expand(path: string): Query<T2>`

Causes entities returned by the query to have the specified related entities expanded instead of being returned as scalar identity values.

For example, while this

    model.Employee.first()
    
would return

    {
      id: 23103013,
      name: "Bob",
      company: 31414515
    }

adding an expansion

    model.Employee.first().expand('company')

would return

    {
      id: 23103013,
      name: "Bob",
      company: {
        id: 31414515,
        name: "Bob's Burger Joint"
      }
    }