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
exports.SubjectControllers = void 0;
const catch_async_1 = __importDefault(require("../../../utils/catch-async"));
const send_response_1 = __importDefault(require("../../../utils/send-response"));
const subject_service_1 = require("./subject.service");
const getAllSubjects = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subjects = yield subject_service_1.SubjectServices.getAllSubjects();
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Subjects retrieved successfully',
        data: subjects,
    });
}));
const createSubject = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newSubject = yield subject_service_1.SubjectServices.createSubject(req.body);
    (0, send_response_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Subject created successfully',
        data: newSubject,
    });
}));
const updateSubject = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedSubject = yield subject_service_1.SubjectServices.updateSubject(id, req.body);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Subject updated successfully',
        data: updatedSubject,
    });
}));
const deleteSubject = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield subject_service_1.SubjectServices.deleteSubject(id);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Subject deleted successfully',
    });
}));
exports.SubjectControllers = {
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
};
