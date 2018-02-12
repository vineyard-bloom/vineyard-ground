"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
class Trellis_Type extends type_1.Type {
    constructor(name, trellis) {
        super(name);
        this.trellis = trellis;
    }
    get_category() {
        return type_1.Type_Category.trellis;
    }
    get_other_trellis_name() {
        return this.trellis.name;
    }
}
exports.Trellis_Type = Trellis_Type;
// export interface Property {
//   name: string
//   type: Type
//   trellis: Trellis
//   is_nullable: boolean
//   "default": any
//   is_unique: boolean
//
//   get_path(): string
//
//   is_reference(): boolean
//
//   is_list(): boolean
// }
class StandardProperty {
    constructor(name, type, trellis) {
        this.is_nullable = false;
        this.is_unique = false;
        this.name = name;
        this.type = type;
        this.trellis = trellis;
    }
    get_path() {
        return this.trellis.name + '.' + this.name;
    }
    is_reference() {
        return this.type.get_category() == type_1.Type_Category.trellis
            || this.type.get_category() == type_1.Type_Category.list
            || this.type.get_category() == type_1.Type_Category.incomplete;
    }
    is_list() {
        return this.type.get_category() == type_1.Type_Category.list;
    }
    get_other_trellis() {
        return this.type.get_category() == type_1.Type_Category.trellis
            ? this.type.trellis
            : this.type.child_type.trellis;
    }
}
exports.StandardProperty = StandardProperty;
class Reference extends StandardProperty {
    constructor(name, type, trellis, other_property) {
        super(name, type, trellis);
        if (other_property)
            this.other_property = other_property;
    }
}
exports.Reference = Reference;
function get_key_identity(data, name) {
    const id = data[name];
    if (id || id === 0)
        return id;
    if (typeof data === 'object')
        throw new Error('Cannot retrieve identity from object because primary key "'
            + name + '" is missing.');
    return data;
}
// export interface ITrellis {
//   name: string
//   properties: { [name: string]: Property }
//   primary_keys: Property[]
//   parent?: Trellis | null
// }
class TrellisImplementation {
    constructor(name) {
        this.properties = {};
        this.primary_keys = [];
        this.softDelete = false;
        this.additional = {};
        this.name = name;
    }
    get_lists() {
        if (this.lists)
            return this.lists;
        const result = [];
        for (let name in this.properties) {
            const property = this.properties[name];
            if (property.is_list())
                result.push(property);
        }
        this.lists = result;
        return result;
    }
    get_identity(data) {
        if (!data)
            throw new Error("Identity cannot be empty.");
        if (this.primary_keys.length > 1) {
            const result = {};
            for (let i = 0; i < this.primary_keys.length; ++i) {
                const property = this.primary_keys[i];
                result[property.name] = get_key_identity(data, property.name);
            }
            return result;
        }
        return get_key_identity(data, this.primary_keys[0].name);
    }
    getIdentity(data) {
        return this.get_identity(data);
    }
}
exports.TrellisImplementation = TrellisImplementation;
function getIdentity(trellis, data) {
    if (!data)
        throw new Error("Identity cannot be empty.");
    if (trellis.primary_keys.length > 1) {
        const result = {};
        for (let i = 0; i < trellis.primary_keys.length; ++i) {
            const property = trellis.primary_keys[i];
            result[property.name] = get_key_identity(data, property.name);
        }
        return result;
    }
    return get_key_identity(data, trellis.primary_keys[0].name);
}
exports.getIdentity = getIdentity;
//# sourceMappingURL=trellis.js.map