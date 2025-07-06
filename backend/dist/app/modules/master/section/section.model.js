"use strict";
// src/app/modules/master/section/section.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = void 0;
const mongoose_1 = require("mongoose");
const SectionSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
}, {
    timestamps: true,
});
exports.Section = (0, mongoose_1.model)('Section', SectionSchema);
