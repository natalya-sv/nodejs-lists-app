import express from "express";
import bodyParser from "body-parser";
import { connect } from "mongoose";
import dotenv from "dotenv";
import { router as categoriesRouter } from "./routes/category.js";
import { router as userRouter } from "../utils.js";
import { router as subcategoryRouter } from "./routes/subcategory.js";
import { router as subcategoryItemsRouter } from "./routes/subcategory-item.js";

import cors from "cors";
dotenv.config();
const databaseUrl = process.env.MONGODB_URI;
const backendUrl = process.env.BACKEND_URL;
const app = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000", backendUrl],
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: false }));
app.use(categoriesRouter);
app.use(userRouter);
app.use(subcategoryRouter);
app.use(subcategoryItemsRouter);
app.use((error, req, res) => {
  const status = 500;
  const message = error.message;
  const data = error;
  console.log("error", error);
  res.status(status).json({ message: message, data: data });
});

connect(databaseUrl)
  .then(() => {
    app.listen(8080, () => console.log("Server ready on port 8080"));
  })
  .catch((err) => {
    console.log("error database connection", err);
  });
export default app;
