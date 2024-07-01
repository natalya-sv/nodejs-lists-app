"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("../../constants");
dotenv_1.default.config();
const secret = process.env.SECRET_JWT;
//checks if user is authorized
const isAuth = (req, res, next) => {
    try {
        const authHeader = req.get("Authorization");
        if (!authHeader) {
            throw new Error(constants_1.AUTH_NOT_PROVIDED);
        }
        const token = authHeader.split(" ")[1];
        const decodedToken = (0, jsonwebtoken_1.verify)(token, secret);
        if (!decodedToken) {
            const error = new Error(constants_1.USER_NOT_AUTH);
            throw error;
        }
        req.userId = decodedToken.userId;
        next();
    }
    catch (err) {
        throw err;
    }
};
exports.isAuth = isAuth;
