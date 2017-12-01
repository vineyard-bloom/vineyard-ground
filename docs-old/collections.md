[Documentation](index.md)

# Collections

#### `create(seed): Promise<T>`
    
Creates a new entity and saves it to the database.  Returns a copy of the new entity.

#### `update(seed, changes): Promise<T>`

Updates a record.  

`seed` can be either an id or an object with an id.

`changes` is a dictionary of property key/value pairs to be changed.

#### `all(): Query<T>`

Returns a query containing all items in that collection.

#### `filter(options): Query<T>`

Returns a query containing all items in the collection that match the key/value pairs in `options`

#### `first(options?): Query<T>`

Returns the first item in the collection, optionally filtered by key/value pairs.

#### `get(identity): Query<T>`

Returns a single item that matches the provided id.  Shorthand for `.filter({id: x}).first()`
