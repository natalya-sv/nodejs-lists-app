"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const category_1 = require("../controllers/category");
const isAuth_1 = require("../middleware/isAuth");
const express_validator_1 = require("express-validator");
exports.router = express_1.default.Router();
exports.router.get("/categories", isAuth_1.isAuth, category_1.getCategories);
exports.router.post("/categories", [
    (0, express_validator_1.body)("title").trim().isLength({ min: 3 }),
    (0, express_validator_1.body)("icon").trim().isLength({ min: 3 }),
], isAuth_1.isAuth, category_1.addCategory);
exports.router.put("/categories/:categoryId", [
    (0, express_validator_1.body)("title").trim().isLength({ min: 3 }),
    (0, express_validator_1.body)("icon").trim().isLength({ min: 3 }),
], isAuth_1.isAuth, category_1.updateCategory);
exports.router.delete("/categories/:categoryId", isAuth_1.isAuth, category_1.deleteCategory);
