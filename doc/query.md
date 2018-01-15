[Documentation](index.md)

# Queries

Queries are chainable, allowing for processes like:

    model.Character
      .filter({health: 20})
      .expand('inventory')
      .expand('race')
      .select(['id', 'inventory', 'race.name'])

Since queries are chainable, they are not actually executed until either the `exec` or `then` method is called.
