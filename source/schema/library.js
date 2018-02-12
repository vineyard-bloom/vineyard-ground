"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
class Library {
    constructor() {
        const guid = new type_1.Primitive('guid');
        this.types = {
            long: new type_1.Primitive('long'),
            bignumber: new type_1.Primitive('bignumber'),
            bool: new type_1.Primitive('bool'),
            char: new type_1.Primitive('char'),
            colossal: new type_1.Primitive('colossal'),
            date: new type_1.Primitive('date'),
            datetime: new type_1.Primitive('datetime'),
            float: new type_1.Primitive('float'),
            guid: guid,
            int: new type_1.Primitive('int'),
            json: new type_1.Primitive('json'),
            short: new type_1.Primitive('short'),
            string: new type_1.Primitive('string'),
            time: new type_1.Primitive('time'),
            text: new type_1.Primitive('text'),
            uuid: guid,
        };
    }
    add_type(type) {
        if (this.types[type.name])
            throw new Error('Library already has a type named ' + type.name + '.');
        this.types[type.name] = type;
    }
}
exports.Library = Library;
//# sourceMappingURL=library.js.map