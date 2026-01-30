"use strict";
// src/app/modules/quran/entry/quran-entry.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuranEntry = void 0;
const mongoose_1 = require("mongoose");
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
const QuranTestSchema = new mongoose_1.Schema({
    given: { type: Boolean, required: true, default: false },
    tanbih: { type: Number, required: true, default: 0, min: 0 },
    fath: { type: Number, required: true, default: 0, min: 0 },
    note: { type: String, default: '', trim: true },
}, { _id: false });
const TajweedNotesSchema = new mongoose_1.Schema({
    harf: { type: String, default: '', trim: true },
    ghunna: { type: String, default: '', trim: true },
    madd: { type: String, default: '', trim: true },
    other: { type: String, default: '', trim: true },
}, { _id: false });
const QuranEntrySchema = new mongoose_1.Schema({
    student: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'QuranStudent',
        required: true,
        index: true,
    },
    reportDate: {
        type: Date,
        required: true,
        index: true,
    },
    newTest: {
        type: QuranTestSchema,
        required: true,
        default: () => (Object.assign({}, defaultTest)),
    },
    recentTest: {
        type: QuranTestSchema,
        required: true,
        default: () => (Object.assign({}, defaultTest)),
    },
    olderTest: {
        type: QuranTestSchema,
        required: true,
        default: () => (Object.assign({}, defaultTest)),
    },
    tajweedNotes: {
        type: TajweedNotesSchema,
        required: true,
        default: () => (Object.assign({}, defaultTajweedNotes)),
    },
    generalNote: {
        type: String,
        default: '',
        trim: true,
    },
    ustadName: {
        type: String,
        default: '',
        trim: true,
    },
    signature: {
        type: String,
        default: '',
        trim: true,
    },
    testsGiven: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 3,
    },
    testsMissed: {
        type: Number,
        required: true,
        default: 3,
        min: 0,
        max: 3,
    },
    totalTanbih: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    totalFath: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    totalMistakes: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
});
// Compound index for listing entries by student and date
QuranEntrySchema.index({ student: 1, reportDate: -1 });
/** Compute and set testsGiven, testsMissed, totalTanbih, totalFath, totalMistakes from test data */
function computeEntryFields(doc) {
    var _a, _b;
    const tests = [doc.newTest, doc.recentTest, doc.olderTest];
    let testsGiven = 0;
    let totalTanbih = 0;
    let totalFath = 0;
    for (const t of tests) {
        if (t === null || t === void 0 ? void 0 : t.given) {
            testsGiven += 1;
            totalTanbih += (_a = t.tanbih) !== null && _a !== void 0 ? _a : 0;
            totalFath += (_b = t.fath) !== null && _b !== void 0 ? _b : 0;
        }
    }
    doc.testsGiven = testsGiven;
    doc.testsMissed = 3 - testsGiven;
    doc.totalTanbih = totalTanbih;
    doc.totalFath = totalFath;
    doc.totalMistakes = totalTanbih + totalFath;
}
QuranEntrySchema.pre('save', function (next) {
    computeEntryFields(this);
    next();
});
exports.QuranEntry = (0, mongoose_1.model)('QuranEntry', QuranEntrySchema);
