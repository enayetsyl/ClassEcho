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
exports.SectionControllers = void 0;
const catch_async_1 = __importDefault(require("../../../utils/catch-async"));
const send_response_1 = __importDefault(require("../../../utils/send-response"));
const section_service_1 = require("./section.service");
const getAllSections = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sections = yield section_service_1.SectionServices.getAllSections();
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Sections retrieved successfully',
        data: sections,
    });
}));
const createSection = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newSection = yield section_service_1.SectionServices.createSection(req.body);
    (0, send_response_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Section created successfully',
        data: newSection,
    });
}));
const updateSection = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedSection = yield section_service_1.SectionServices.updateSection(id, req.body);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Section updated successfully',
        data: updatedSection,
    });
}));
const deleteSection = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield section_service_1.SectionServices.deleteSection(id);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Section deleted successfully',
    });
}));
exports.SectionControllers = {
    getAllSections,
    createSection,
    updateSection,
    deleteSection,
};
