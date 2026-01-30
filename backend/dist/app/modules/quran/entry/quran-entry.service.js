"use strict";
// src/app/modules/quran/entry/quran-entry.service.ts
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
exports.QuranEntryServices = exports.bulkImportEntries = exports.getEntriesByStudent = exports.deleteEntry = exports.updateEntry = exports.getEntryById = exports.listEntries = exports.createEntry = void 0;
const mongoose_1 = require("mongoose");
const quran_entry_model_1 = require("./quran-entry.model");
const quran_student_model_1 = require("../student/quran-student.model");
const app_error_1 = __importDefault(require("../../../errors/app-error"));
const http_status_1 = __importDefault(require("http-status"));
const pagination_1 = require("../../../utils/pagination");
const defaultTest = {
    given: false,
    tanbih: 0,
    fath: 0,
    note: '',
};
const defaultTajweedNotes = {
    harf: '',
    ghunna: '',
    madd: '',
    other: '',
};
function mergeTest(partial) {
    return Object.assign(Object.assign({}, defaultTest), partial);
}
function mergeTajweed(partial) {
    return Object.assign(Object.assign({}, defaultTajweedNotes), partial);
}
function mapEntry(doc) {
    return {
        _id: doc.id,
        student: doc.student,
        reportDate: doc.reportDate,
        newTest: doc.newTest,
        recentTest: doc.recentTest,
        olderTest: doc.olderTest,
        tajweedNotes: doc.tajweedNotes,
        generalNote: doc.generalNote,
        ustadName: doc.ustadName,
        signature: doc.signature,
        testsGiven: doc.testsGiven,
        testsMissed: doc.testsMissed,
        totalTanbih: doc.totalTanbih,
        totalFath: doc.totalFath,
        totalMistakes: doc.totalMistakes,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
const createEntry = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const student = yield quran_student_model_1.QuranStudent.findById(data.studentId);
    if (!student) {
        throw new app_error_1.default(http_status_1.default.BAD_REQUEST, 'Quran student not found');
    }
    const doc = yield quran_entry_model_1.QuranEntry.create({
        student: new mongoose_1.Types.ObjectId(data.studentId),
        reportDate: new Date(data.reportDate),
        newTest: mergeTest(data.newTest),
        recentTest: mergeTest(data.recentTest),
        olderTest: mergeTest(data.olderTest),
        tajweedNotes: mergeTajweed(data.tajweedNotes),
        generalNote: (_a = data.generalNote) !== null && _a !== void 0 ? _a : '',
        ustadName: (_b = data.ustadName) !== null && _b !== void 0 ? _b : '',
        signature: (_c = data.signature) !== null && _c !== void 0 ? _c : '',
    });
    const populated = yield doc.populate('student');
    return mapEntry(populated);
});
exports.createEntry = createEntry;
const listEntries = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { page, limit, skip, sortBy, sortOrder } = pagination_1.paginationHelper.calculatePagination(options);
    const query = {};
    if (filters.studentId) {
        query.student = new mongoose_1.Types.ObjectId(filters.studentId);
    }
    if (filters.class || typeof filters.supervision === 'boolean') {
        const studentQuery = {};
        if (filters.class)
            studentQuery.class = filters.class;
        if (typeof filters.supervision === 'boolean')
            studentQuery.supervision = filters.supervision;
        const students = yield quran_student_model_1.QuranStudent.find(studentQuery).select('_id').lean();
        const studentIds = students.map((s) => s._id);
        if (studentIds.length === 0) {
            return { data: [], meta: { page, limit, total: 0, totalPage: 0 } };
        }
        query.student = { $in: studentIds };
    }
    if (filters.startDate || filters.endDate) {
        query.reportDate = {};
        if (filters.startDate)
            query.reportDate.$gte = new Date(filters.startDate);
        if (filters.endDate)
            query.reportDate.$lte = new Date(filters.endDate);
    }
    if ((_a = filters.ustadName) === null || _a === void 0 ? void 0 : _a.trim()) {
        query.ustadName = new RegExp(filters.ustadName.trim(), 'i');
    }
    const allowedSort = ['reportDate', 'createdAt', 'totalMistakes', 'ustadName'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'reportDate';
    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
    const [docs, total] = yield Promise.all([
        quran_entry_model_1.QuranEntry.find(query).populate('student').sort(sort).skip(skip).limit(limit),
        quran_entry_model_1.QuranEntry.countDocuments(query),
    ]);
    const totalPage = Math.ceil(total / limit);
    const data = docs.map(mapEntry);
    return { data, meta: { page, limit, total, totalPage } };
});
exports.listEntries = listEntries;
const getEntryById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield quran_entry_model_1.QuranEntry.findById(id).populate('student');
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Quran entry not found');
    }
    return mapEntry(doc);
});
exports.getEntryById = getEntryById;
const updateEntry = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield quran_entry_model_1.QuranEntry.findById(id);
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Quran entry not found');
    }
    if (data.newTest !== undefined)
        doc.newTest = mergeTest(data.newTest);
    if (data.recentTest !== undefined)
        doc.recentTest = mergeTest(data.recentTest);
    if (data.olderTest !== undefined)
        doc.olderTest = mergeTest(data.olderTest);
    if (data.tajweedNotes !== undefined)
        doc.tajweedNotes = mergeTajweed(data.tajweedNotes);
    if (data.generalNote !== undefined)
        doc.generalNote = data.generalNote;
    if (data.ustadName !== undefined)
        doc.ustadName = data.ustadName;
    if (data.signature !== undefined)
        doc.signature = data.signature;
    yield doc.save();
    const populated = yield doc.populate('student');
    return mapEntry(populated);
});
exports.updateEntry = updateEntry;
const deleteEntry = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield quran_entry_model_1.QuranEntry.findByIdAndDelete(id);
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Quran entry not found');
    }
});
exports.deleteEntry = deleteEntry;
const getEntriesByStudent = (studentId, options) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield quran_student_model_1.QuranStudent.findById(studentId);
    if (!student) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Quran student not found');
    }
    return (0, exports.listEntries)({ studentId }, options);
});
exports.getEntriesByStudent = getEntriesByStudent;
const bulkImportEntries = (entries) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = [];
    let created = 0;
    for (let i = 0; i < entries.length; i++) {
        try {
            yield (0, exports.createEntry)(entries[i]);
            created += 1;
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            errors.push(`Row ${i + 1} (studentId ${entries[i].studentId}): ${msg}`);
        }
    }
    return { created, errors };
});
exports.bulkImportEntries = bulkImportEntries;
exports.QuranEntryServices = {
    createEntry: exports.createEntry,
    listEntries: exports.listEntries,
    getEntryById: exports.getEntryById,
    updateEntry: exports.updateEntry,
    deleteEntry: exports.deleteEntry,
    getEntriesByStudent: exports.getEntriesByStudent,
    bulkImportEntries: exports.bulkImportEntries,
};
