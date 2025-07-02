"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmin = void 0;
// src/app/utils/seed-super-admin.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = require("../modules/user/user.model");
const config_1 = __importDefault(require("../../config"));
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const email = config_1.default.super_admin_email;
    const password = config_1.default.super_admin_password;
    const name = 'Super Admin';
    const exists = yield user_model_1.User.findOne({ email });
    if (exists) {
        console.log('Super admin already exists.');
        return;
    }
    const saltRounds = Number(config_1.default.bcrypt_salt_rounds) || 10;
    const passwordHash = yield bcrypt_1.default.hash(password, saltRounds);
    yield user_model_1.User.create({
        name,
        email,
        passwordHash,
        roles: ['Admin', 'SeniorAdmin', 'Management'],
        active: true,
        mustChangePassword: false,
    });
    console.log('Super admin created successfully!');
});
exports.seedSuperAdmin = seedSuperAdmin;
