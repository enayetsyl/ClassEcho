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
exports.SubjectServices = void 0;
const subject_model_1 = require("./subject.model");
const app_error_1 = __importDefault(require("../../../errors/app-error"));
const http_status_1 = __importDefault(require("http-status"));
const getAllSubjects = () => __awaiter(void 0, void 0, void 0, function* () {
    const docs = yield subject_model_1.Subject.find().sort('name');
    return docs.map(doc => ({
        _id: doc.id,
        name: doc.name,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    }));
});
const createSubject = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield subject_model_1.Subject.findOne({ name: data.name });
    if (existing) {
        throw new app_error_1.default(http_status_1.default.BAD_REQUEST, 'Subject name already exists');
    }
    const doc = yield subject_model_1.Subject.create(data);
    return {
        _id: doc.id,
        name: doc.name,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
});
const updateSubject = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield subject_model_1.Subject.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Subject not found');
    }
    return {
        _id: doc.id,
        name: doc.name,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
});
const deleteSubject = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const deleted = yield subject_model_1.Subject.findByIdAndDelete(id);
    if (!deleted) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Subject not found');
    }
});
exports.SubjectServices = {
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
};
