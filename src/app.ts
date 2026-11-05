import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import { notFound } from "./errors/notFound.js";
import { errorHandler } from "./errors/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
