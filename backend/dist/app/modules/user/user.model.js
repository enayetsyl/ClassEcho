"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    roles: {
        type: [String],
        required: true,
        enum: ['Admin', 'SeniorAdmin', 'Teacher', 'Management'],
        default: ['Teacher'],
    },
    active: {
        type: Boolean,
        default: true,
    },
    mustChangePassword: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetTokenExpires: {
        type: Date,
        default: null,
    },
    // Optional profile fields
    phone: {
        type: String,
        default: null,
    },
    dateOfBirth: {
        type: Date,
        default: null,
    },
    profileImageUrl: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});
exports.User = (0, mongoose_1.model)('User', UserSchema);
