"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayName = void 0;
const displayName = (obj) => {
    var _a, _b, _c;
    return (_c = (_b = (_a = obj === null || obj === void 0 ? void 0 : obj.name) !== null && _a !== void 0 ? _a : obj === null || obj === void 0 ? void 0 : obj.fullName) !== null && _b !== void 0 ? _b : obj === null || obj === void 0 ? void 0 : obj.title) !== null && _c !== void 0 ? _c : ((obj === null || obj === void 0 ? void 0 : obj.firstName) && (obj === null || obj === void 0 ? void 0 : obj.lastName) ? `${obj.firstName} ${obj.lastName}` : '');
};
exports.displayName = displayName;
