"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./app/routes"));
const not_found_1 = __importDefault(require("./app/middlewares/not-found"));
const global_error_handler_1 = __importDefault(require("./app/middlewares/global-error-handler"));
const app = (0, express_1.default)();
//parsers
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({ origin: ['http://localhost:5173', 'http://localhost:3000', 'https://class-echo.vercel.app'], credentials: true }));
// application routes
app.use('/api/v1', routes_1.default);
app.get('/', (req, res) => {
    res.send('Hello from ClassEcho server');
});
app.use(global_error_handler_1.default);
//Not Found
app.use(not_found_1.default);
exports.default = app;
