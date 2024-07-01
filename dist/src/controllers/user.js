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
exports.login = exports.createUser = void 0;
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("../../constants");
dotenv_1.default.config();
const secret = process.env.SECRET_JWT;
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error(constants_1.ENTER_VALID_INPUT);
            throw error;
        }
        const { email, username, password } = req.body;
        if (password.trim().length < 7) {
            throw new Error(constants_1.PASSWORD_RULES);
        }
        const hashedPassword = yield (0, bcryptjs_1.hash)(password.trim(), 12);
        const user = new user_1.User({
            username: username,
            email: email,
            password: hashedPassword,
        });
        const createdUser = yield user.save();
        res.status(201).json({ message: constants_1.POST_USER_SUCCESS, user: createdUser });
    }
    catch (err) {
        next(err);
    }
});
exports.createUser = createUser;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let loadedUser;
        const { email, password } = req.body;
        const user = yield user_1.User.findOne({ email: email });
        if (!user) {
            const error = new Error(constants_1.USER_NOT_FOUND);
            throw error;
        }
        else {
            loadedUser = user;
            const isEqual = yield (0, bcryptjs_1.compare)(password, user.password);
            if (!isEqual) {
                const error = new Error(constants_1.PASSWORD_WPONG);
                throw error;
            }
            if (loadedUser) {
                const token = (0, jsonwebtoken_1.sign)({
                    email: loadedUser.email,
                    userId: loadedUser._id.toString(),
                }, secret, { expiresIn: "10 days" });
                res.status(200).json({
                    token: token,
                    user: {
                        id: loadedUser._id.toString(),
                        username: loadedUser.username,
                        email: loadedUser.email,
                    },
                });
            }
        }
    }
    catch (err) {
        next(err);
    }
});
exports.login = login;
