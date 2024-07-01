"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const user_2 = require("../controllers/user");
const constants_1 = require("../../constants");
exports.router = express_1.default.Router();
exports.router.post("/signup", [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage(constants_1.ENTER_VALID_EMAIL)
        .custom((email, { req: Request }) => {
        return user_1.User.findOne({ email: email }).then((userDoc) => {
            if (userDoc) {
                return Promise.reject(constants_1.EMAIL_EXISTS);
            }
        });
    })
        .normalizeEmail(),
    (0, express_validator_1.body)("password").trim().isLength({ min: 7 }),
    (0, express_validator_1.body)("username").trim().not().isEmpty(),
    user_2.createUser,
]);
exports.router.post("/login", user_2.login);
