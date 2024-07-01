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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.addCategory = exports.getCategories = void 0;
const constants_1 = require("./../../constants");
const category_1 = require("../models/category");
const express_validator_1 = require("express-validator");
const constants_2 = require("../../constants");
const utils_1 = require("../../utils");
const getCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req === null || req === void 0 ? void 0 : req.userId;
        if (userId) {
            const categories = yield category_1.Category.find({ userId: userId });
            res
                .status(200)
                .json({ message: constants_2.GET_CATEGORIES_SUCCESS, categories: categories });
        }
        else {
            throw new Error(constants_2.USER_NOT_FOUND);
        }
    }
    catch (error) {
        next(error);
    }
});
exports.getCategories = getCategories;
const addCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, icon } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(constants_2.ENTER_VALID_INPUT);
            if (errors.array()[0].type === "field") {
                error.message = (0, utils_1.generateFieldValidationErrorMessage)(errors.array());
            }
            throw error;
        }
        const newCategory = new category_1.Category({
            title: title,
            icon: icon,
            userId: req.userId,
        });
        const result = yield newCategory.save();
        if (result) {
            res.status(201).json({
                message: constants_2.POST_CATEGORIES_SUCCESS,
                category: newCategory,
            });
        }
        else {
            throw new Error(constants_1.POST_CATEGORY_ERROR);
        }
    }
    catch (err) {
        next(err);
    }
});
exports.addCategory = addCategory;
const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, icon } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(constants_2.ENTER_VALID_INPUT);
            if (errors.array()[0].type === "field") {
                error.message = (0, utils_1.generateFieldValidationErrorMessage)(errors.array());
            }
            throw error;
        }
        const categoryId = req.params.categoryId;
        const category = yield category_1.Category.findById(categoryId);
        if (!category) {
            const error = new Error(constants_1.CATEGORY_NOT_FOUND);
            throw error;
        }
        category.title = title !== null && title !== void 0 ? title : category.title;
        category.icon = icon !== null && icon !== void 0 ? icon : category.icon;
        const updatedCategory = yield category.save();
        res
            .status(200)
            .json({ message: constants_2.PUT_CATEGORIES_SUCCESS, goal: updatedCategory });
    }
    catch (err) {
        next(err);
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = req.params.categoryId;
        const category = yield category_1.Category.findById(categoryId);
        if (!category) {
            const error = new Error(constants_1.CATEGORY_NOT_FOUND);
            throw error;
        }
        if (category.userId.toString() !== req.userId) {
            const error = new Error(constants_1.NOT_AUTHORIZED);
            throw error;
        }
        yield category_1.Category.findByIdAndRemove(categoryId);
        res.status(200).json({ message: constants_2.DELETE_CATEGORIES_SUCCESS });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteCategory = deleteCategory;
