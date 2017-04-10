import { Trellis } from 'vineyard-schema';
import { Collection } from "./collection";
export interface Collection_Trellis<T> extends Trellis {
    table: any;
    collection: Collection<T>;
}
