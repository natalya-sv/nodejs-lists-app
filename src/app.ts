import express, { Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { connect } from "mongoose";
import dotenv from "dotenv";
import { router as categoriesRouter } from "./routes/category";
import { router as userRouter } from "./routes/user";

dotenv.config();
const databaseUrl = process.env.MONGODB_URI as string;
const app: Express = express();

app.use(bodyParser.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(categoriesRouter);
app.use(userRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use((error: Error, req: Request, res: Response, next: any) => {
  const status = 500;
  const message = error.message;
  const data = error;
  console.log("error", error);
  res.status(status).json({ message: message, data: data });
});

connect(databaseUrl)
  .then((res) => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log("error database connection", err);
  });
export default app;
