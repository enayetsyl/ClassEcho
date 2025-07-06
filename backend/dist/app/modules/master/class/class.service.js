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
exports.ClassServices = void 0;
const class_model_1 = require("./class.model");
const app_error_1 = __importDefault(require("../../../errors/app-error"));
const http_status_1 = __importDefault(require("http-status"));
const getAllClasses = () => __awaiter(void 0, void 0, void 0, function* () {
    const docs = yield class_model_1.Class.find().sort('name');
    return docs.map(doc => ({
        _id: doc.id, // string
        name: doc.name,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    }));
});
const createClass = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield class_model_1.Class.findOne({ name: data.name });
    if (existing) {
        throw new app_error_1.default(http_status_1.default.BAD_REQUEST, 'Class name already exists');
    }
    const doc = yield class_model_1.Class.create(data);
    return {
        _id: doc.id,
        name: doc.name,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
});
const updateClass = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield class_model_1.Class.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    return {
        _id: doc.id,
        name: doc.name,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
});
const deleteClass = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const deleted = yield class_model_1.Class.findByIdAndDelete(id);
    if (!deleted) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
});
exports.ClassServices = {
    getAllClasses,
    createClass,
    updateClass,
    deleteClass,
};
