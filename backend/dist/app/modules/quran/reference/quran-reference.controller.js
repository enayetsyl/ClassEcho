"use strict";
// src/app/modules/quran/reference/quran-reference.controller.ts
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
exports.QuranReferenceControllers = void 0;
const catch_async_1 = __importDefault(require("../../../utils/catch-async"));
const send_response_1 = __importDefault(require("../../../utils/send-response"));
const surah_data_1 = require("./surah-data");
const juz_data_1 = require("./juz-data");
const app_error_1 = __importDefault(require("../../../errors/app-error"));
const http_status_1 = __importDefault(require("http-status"));
const listSurahs = (0, catch_async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Surahs retrieved successfully',
        data: surah_data_1.SURAH_DATA,
    });
}));
const getSurahByNumberHandler = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const number = parseInt(req.params.number, 10);
    if (isNaN(number) || number < 1 || number > 114) {
        throw new app_error_1.default(http_status_1.default.BAD_REQUEST, 'Invalid surah number (1-114)');
    }
    const surah = (0, surah_data_1.getSurahByNumber)(number);
    if (!surah) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Surah not found');
    }
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Surah retrieved successfully',
        data: surah,
    });
}));
const listJuz = (0, catch_async_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Juz list retrieved successfully',
        data: juz_data_1.JUZ_DATA,
    });
}));
const getJuzByNumberHandler = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const number = parseInt(req.params.number, 10);
    if (isNaN(number) || number < 1 || number > 30) {
        throw new app_error_1.default(http_status_1.default.BAD_REQUEST, 'Invalid juz number (1-30)');
    }
    const juz = (0, juz_data_1.getJuzByNumber)(number);
    if (!juz) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Juz not found');
    }
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Juz retrieved successfully',
        data: juz,
    });
}));
exports.QuranReferenceControllers = {
    listSurahs,
    getSurahByNumber: getSurahByNumberHandler,
    listJuz,
    getJuzByNumber: getJuzByNumberHandler,
};
