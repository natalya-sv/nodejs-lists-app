import express from "express";
import bodyParser from "body-parser";
import { connect } from "mongoose";
import dotenv from "dotenv";
import { router as categoriesRouter } from "../src/routes/category-routes.js";
import { router as subcategoryRouter } from "../src/routes/subcategory-routes.js";
import { router as subcategoryItemsRouter } from "../src/routes/subcategory-item-routes.js";
import { router as userRouter } from "../src/routes/user-routes.js";
import { router as testRouter } from "../src/routes/test-data.js";
import path from "path";

const __dirname = path.resolve();

import cors from "cors";
import hbs from "express-hbs";

dotenv.config();
const backendUrl = process.env.BACKEND_URL;
const app = express();

const isDev = process.env.NODE_ENV === "development";

const databaseUrl = isDev
  ? process.env.MONGODB_URI_DEV
  : process.env.MONGODB_URI;

app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      backendUrl,
      /^https:\/\/nodejs-lists-*\.vercel\.app$/,
    ],
    credentials: true,
  }),
);
app.use((req, res, next) => {
  const origin = req.headers;
  console.log("origin", origin);
});
app.use(express.urlencoded({ extended: false }));
app.use(categoriesRouter);
app.use(userRouter);
app.use(subcategoryRouter);
app.use(subcategoryItemsRouter);
app.use(testRouter);

app.use((error, req, res) => {
  const status = 500;
  const message = error.message;
  const data = error;
  console.log("error:", error);
  res.status(status).json({ message: message, data: data });
});
app.engine(
  "hbs",
  hbs.express4({
    partialsDir: __dirname + "/src/views",
  }),
);
app.set("view engine", "hbs");
app.set("views", __dirname + "/src/views");

connect(databaseUrl)
  .then(() => {
    if (isDev) {
      console.log("Development mode response");
    } else {
      console.log("Production mode response");
    }
    app.listen(8080, () => console.log("Server ready on port 8080"));
  })
  .catch((err) => {
    console.log("error database connection", err);
  });
export default app;
