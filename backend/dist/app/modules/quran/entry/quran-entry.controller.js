"use strict";
// src/app/modules/quran/entry/quran-entry.controller.ts
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
exports.QuranEntryControllers = void 0;
const catch_async_1 = __importDefault(require("../../../utils/catch-async"));
const send_response_1 = __importDefault(require("../../../utils/send-response"));
const quran_entry_service_1 = require("./quran-entry.service");
const listEntries = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const filters = {};
    if (query.studentId)
        filters.studentId = query.studentId;
    if (query.class)
        filters.class = query.class;
    if (query.supervision === 'true')
        filters.supervision = true;
    if (query.supervision === 'false')
        filters.supervision = false;
    if (query.startDate)
        filters.startDate = query.startDate;
    if (query.endDate)
        filters.endDate = query.endDate;
    if (query.ustadName)
        filters.ustadName = query.ustadName;
    const options = {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
    };
    const result = yield quran_entry_service_1.QuranEntryServices.listEntries(filters, options);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran entries retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
}));
const getEntryById = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const entry = yield quran_entry_service_1.QuranEntryServices.getEntryById(id);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran entry retrieved successfully',
        data: entry,
    });
}));
const createEntry = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const entry = yield quran_entry_service_1.QuranEntryServices.createEntry(req.body);
    (0, send_response_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Quran entry created successfully',
        data: entry,
    });
}));
const updateEntry = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const entry = yield quran_entry_service_1.QuranEntryServices.updateEntry(id, req.body);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran entry updated successfully',
        data: entry,
    });
}));
const deleteEntry = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield quran_entry_service_1.QuranEntryServices.deleteEntry(id);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran entry deleted successfully',
    });
}));
const getEntriesByStudent = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.params;
    const query = req.query;
    const options = {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
    };
    const result = yield quran_entry_service_1.QuranEntryServices.getEntriesByStudent(studentId, options);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran entries for student retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
}));
const bulkImportEntries = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { entries } = req.body;
    const result = yield quran_entry_service_1.QuranEntryServices.bulkImportEntries(entries);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Bulk import completed: ${result.created} created, ${result.errors.length} errors`,
        data: result,
    });
}));
exports.QuranEntryControllers = {
    listEntries,
    getEntryById,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntriesByStudent,
    bulkImportEntries,
};
