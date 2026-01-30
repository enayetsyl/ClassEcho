"use strict";
// src/app/modules/quran/student/quran-student.controller.ts
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
exports.QuranStudentControllers = void 0;
const catch_async_1 = __importDefault(require("../../../utils/catch-async"));
const send_response_1 = __importDefault(require("../../../utils/send-response"));
const quran_student_service_1 = require("./quran-student.service");
const listStudents = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const filters = {};
    if (query.class)
        filters.class = query.class;
    if (query.supervision === 'true')
        filters.supervision = true;
    if (query.supervision === 'false')
        filters.supervision = false;
    if (query.active === 'true')
        filters.active = true;
    if (query.active === 'false')
        filters.active = false;
    if (query.search)
        filters.search = query.search;
    const options = {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
    };
    const result = yield quran_student_service_1.QuranStudentServices.listStudents(filters, options);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran students retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
}));
const getStudentById = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const student = yield quran_student_service_1.QuranStudentServices.getStudentById(id);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran student retrieved successfully',
        data: student,
    });
}));
const createStudent = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield quran_student_service_1.QuranStudentServices.createStudent(req.body);
    (0, send_response_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Quran student created successfully',
        data: student,
    });
}));
const updateStudent = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const student = yield quran_student_service_1.QuranStudentServices.updateStudent(id, req.body);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran student updated successfully',
        data: student,
    });
}));
const deleteStudent = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield quran_student_service_1.QuranStudentServices.deleteStudent(id);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran student deactivated successfully',
    });
}));
const bulkImportStudents = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { students } = req.body;
    const result = yield quran_student_service_1.QuranStudentServices.bulkImportStudents(students);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Bulk import completed: ${result.created} created, ${result.errors.length} errors`,
        data: result,
    });
}));
exports.QuranStudentControllers = {
    listStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkImportStudents,
};
