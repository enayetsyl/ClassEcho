"use strict";
// src/app/modules/quran/student/quran-student.service.ts
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
exports.QuranStudentServices = exports.bulkImportStudents = exports.deleteStudent = exports.updateStudent = exports.getStudentById = exports.listStudents = exports.createStudent = void 0;
const quran_student_model_1 = require("./quran-student.model");
const app_error_1 = __importDefault(require("../../../errors/app-error"));
const http_status_1 = __importDefault(require("http-status"));
const pagination_1 = require("../../../utils/pagination");
const mapStudent = (doc) => {
    var _a, _b, _c, _d;
    const id = (_d = (_a = doc.id) !== null && _a !== void 0 ? _a : (_c = (_b = doc._id) === null || _b === void 0 ? void 0 : _b.toString) === null || _c === void 0 ? void 0 : _c.call(_b)) !== null && _d !== void 0 ? _d : doc._id;
    return {
        _id: id != null ? String(id) : '',
        studentId: doc.studentId,
        nameEn: doc.nameEn,
        nameBn: doc.nameBn,
        class: doc.class,
        supervision: doc.supervision,
        active: doc.active,
        notes: doc.notes,
        photo: doc.photo,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
};
const createStudent = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const existing = yield quran_student_model_1.QuranStudent.findOne({ studentId: data.studentId });
    if (existing) {
        throw new app_error_1.default(http_status_1.default.BAD_REQUEST, `Student with ID ${data.studentId} already exists`);
    }
    const doc = yield quran_student_model_1.QuranStudent.create({
        studentId: data.studentId,
        nameEn: data.nameEn,
        nameBn: (_a = data.nameBn) !== null && _a !== void 0 ? _a : '',
        class: data.class,
        supervision: (_b = data.supervision) !== null && _b !== void 0 ? _b : false,
        active: (_c = data.active) !== null && _c !== void 0 ? _c : true,
        notes: (_d = data.notes) !== null && _d !== void 0 ? _d : '',
        photo: (_e = data.photo) !== null && _e !== void 0 ? _e : '',
    });
    return mapStudent(doc);
});
exports.createStudent = createStudent;
const listStudents = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { page, limit, skip, sortBy, sortOrder } = pagination_1.paginationHelper.calculatePagination(options);
    const query = {};
    if (filters.class)
        query.class = filters.class;
    if (typeof filters.supervision === 'boolean')
        query.supervision = filters.supervision;
    if (typeof filters.active === 'boolean')
        query.active = filters.active;
    if ((_a = filters.search) === null || _a === void 0 ? void 0 : _a.trim()) {
        const search = filters.search.trim();
        query.$or = [{ nameEn: new RegExp(search, 'i') }, { nameBn: new RegExp(search, 'i') }];
    }
    const allowedSort = ['studentId', 'nameEn', 'class', 'createdAt'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'studentId';
    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
    const [docs, total] = yield Promise.all([
        quran_student_model_1.QuranStudent.find(query).sort(sort).skip(skip).limit(limit).lean(),
        quran_student_model_1.QuranStudent.countDocuments(query),
    ]);
    const totalPage = Math.ceil(total / limit);
    const data = docs.map(mapStudent);
    return { data, meta: { page, limit, total, totalPage } };
});
exports.listStudents = listStudents;
const getStudentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield quran_student_model_1.QuranStudent.findById(id);
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Quran student not found');
    }
    return mapStudent(doc);
});
exports.getStudentById = getStudentById;
const updateStudent = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data.studentId !== undefined) {
        const existing = yield quran_student_model_1.QuranStudent.findOne({ studentId: data.studentId, _id: { $ne: id } });
        if (existing) {
            throw new app_error_1.default(http_status_1.default.BAD_REQUEST, `Student with ID ${data.studentId} already exists`);
        }
    }
    const doc = yield quran_student_model_1.QuranStudent.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Quran student not found');
    }
    return mapStudent(doc);
});
exports.updateStudent = updateStudent;
/** Soft delete: set active = false */
const deleteStudent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield quran_student_model_1.QuranStudent.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Quran student not found');
    }
});
exports.deleteStudent = deleteStudent;
const bulkImportStudents = (students) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = [];
    let created = 0;
    for (const row of students) {
        try {
            yield (0, exports.createStudent)(row);
            created += 1;
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            errors.push(`Student ID ${row.studentId} (${row.nameEn}): ${msg}`);
        }
    }
    return { created, errors };
});
exports.bulkImportStudents = bulkImportStudents;
exports.QuranStudentServices = {
    createStudent: exports.createStudent,
    listStudents: exports.listStudents,
    getStudentById: exports.getStudentById,
    updateStudent: exports.updateStudent,
    deleteStudent: exports.deleteStudent,
    bulkImportStudents: exports.bulkImportStudents,
};
