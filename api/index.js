import express from "express";
import bodyParser from "body-parser";
import { connect } from "mongoose";
import dotenv from "dotenv";
import { router as categoriesRouter } from "./routes/category.js";
import { router as userRouter } from "./routes/user.js";
import { router as subcategoryRouter } from "./routes/subcategory.js";
dotenv.config();
const databaseUrl = process.env.MONGODB_URI;
const app = express();

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(categoriesRouter);
app.use(userRouter);
app.use(subcategoryRouter);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
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

connect(databaseUrl)
  .then((res) => {
    app.listen(3000, () => console.log("Server ready on port 3000"));
  })
  .catch((err) => {
    console.log("error database connection", err);
  });
export default app;
