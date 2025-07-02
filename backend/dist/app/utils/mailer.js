"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../config"));
const transporter = nodemailer_1.default.createTransport({
    host: config_1.default.smtp_host,
    port: Number(config_1.default.smtp_port),
    auth: {
        user: config_1.default.smtp_user,
        pass: config_1.default.smtp_pass,
    },
    secure: config_1.default.smtp_secure === 'true',
});
exports.default = transporter;
