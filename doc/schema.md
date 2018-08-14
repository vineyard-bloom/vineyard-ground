[Documentation](index.md)

# Vineyard Schema

Vineyard Schema is a library for defining data structures and their relationships.  The definition for a schema is normally stored in a JSON file.  Fields added as properties to the "indexes" array will be indexed.

## Defining a Schema

```
import {Schema} from 'vineyard-schema'

const schema = new Schema({
        
    Character: {
        properties: {
            name: {
                type: "string"
            },
            items: {
                type: "list",
                trellis: "Item"
            },
        }
    },
    
    Item: {
        properties: {
            name: {
                type: "string"
            },
            ability: {
                type: "string"
            }
            character: {
                type: "Character",
            },
        },
        table: {
          indexes: [
            { properties: [ "name" ] },
            { properties: [ "ability" ] }
          ]
        }
    },                
```

```
export interface Trellis_Source {
  primary_key?: string | string[]
  primary?: string | string[] // Deprecated
  properties: { [name: string]: Property_Source }
  additional?:any
}
```