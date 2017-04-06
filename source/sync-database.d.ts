/// <reference types="es6-promise" />
import { Schema } from 'vineyard-schema';
import knex = require("knex");
export declare function sync_database(db: knex, schema: Schema): Promise<any>;
