"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickFields = pickFields;
function pickFields(source, fields) {
    const result = {};
    fields.forEach((field) => {
        if (source[field] !== undefined) {
            result[field] = source[field];
        }
    });
    return result;
}
