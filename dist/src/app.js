"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = require("mongoose");
const dotenv_1 = __importDefault(require("dotenv"));
const category_1 = require("./routes/category");
const user_1 = require("./routes/user");
dotenv_1.default.config();
const databaseUrl = process.env.MONGODB_URI;
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(category_1.router);
app.use(user_1.router);
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
app.use((error, req, res, next) => {
    const status = 500;
    const message = error.message;
    const data = error;
    console.log("error", error);
    res.status(status).json({ message: message, data: data });
});
(0, mongoose_1.connect)(databaseUrl)
    .then((res) => {
    app.listen(3000, () => console.log("Server ready on port 3000"));
})
    .catch((err) => {
    console.log("error database connection", err);
});
exports.default = app;
