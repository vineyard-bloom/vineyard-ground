"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = require("bignumber.js");
function to_lower_snake_case(text) {
    if (text.length == 1)
        return text;
    const result = text[0].toLowerCase() + text.substr(1).replace(/[A-Z]+/g, i => '_' + i.toLowerCase());
    return result;
}
exports.to_lower_snake_case = to_lower_snake_case;
function to_lower(text) {
    return text[0].toLowerCase() + text.substr(1);
}
exports.to_lower = to_lower;
function processFields(result, trellis) {
    for (let i in trellis.properties) {
        const property = trellis.properties[i];
        switch (property.type.name) {
            case 'long':
                result[i] = parseInt(result[i]);
                break;
            case 'bignumber':
            case 'colossal':
                result[i] = new bignumber_js_1.BigNumber(result[i]);
                break;
            case 'datetime':
            case 'date': {
                const value = result[i];
                if (value && typeof value === 'string')
                    result[i] = new Date(value);
                break;
            }
        }
    }
    return result;
}
exports.processFields = processFields;
//# sourceMappingURL=utility.js.map