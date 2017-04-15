import { Trellis } from 'vineyard-schema';
import { Collection } from "./collection";
export interface Table_Trellis extends Trellis {
    table: any;
}
export interface Collection_Trellis<T> extends Trellis {
    table: any;
    collection: Collection<T>;
}
