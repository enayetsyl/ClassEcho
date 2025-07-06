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
exports.ClassControllers = void 0;
const catch_async_1 = __importDefault(require("../../../utils/catch-async"));
const send_response_1 = __importDefault(require("../../../utils/send-response"));
const class_service_1 = require("./class.service");
const getAllClasses = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const classes = yield class_service_1.ClassServices.getAllClasses();
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Classes retrieved successfully',
        data: classes,
    });
}));
const createClass = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newClass = yield class_service_1.ClassServices.createClass(req.body);
    (0, send_response_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Class created successfully',
        data: newClass,
    });
}));
const updateClass = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedClass = yield class_service_1.ClassServices.updateClass(id, req.body);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Class updated successfully',
        data: updatedClass,
    });
}));
const deleteClass = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield class_service_1.ClassServices.deleteClass(id);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Class deleted successfully',
    });
}));
exports.ClassControllers = {
    getAllClasses,
    createClass,
    updateClass,
    deleteClass,
};
