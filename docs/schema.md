[Documentation](index.md)

# Vineyard Schema

Vineyard Schema is a library for defining data structures and their relationships.  The definition for a schema is normally stored in a JSON file.

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
            character: {
                type: "Character",
            },
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