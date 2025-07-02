"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const isProd = process.env.NODE_ENV === 'production';
// Start with console only
const transportList = [
    new winston_1.transports.Console({
        format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
    })
];
if (!isProd) {
    // In dev (or any non-prod) create logs/ and add file transports
    const logsDir = path_1.default.resolve(process.cwd(), 'logs');
    if (!fs_1.default.existsSync(logsDir)) {
        fs_1.default.mkdirSync(logsDir, { recursive: true });
    }
    transportList.push(new winston_1.transports.File({ filename: path_1.default.join(logsDir, 'error.log'), level: 'error' }), new winston_1.transports.File({ filename: path_1.default.join(logsDir, 'combined.log') }));
}
const logger = (0, winston_1.createLogger)({
    level: isProd ? 'info' : 'debug',
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json()),
    transports: transportList,
    exitOnError: false,
});
exports.default = logger;
