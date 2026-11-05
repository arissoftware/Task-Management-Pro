import { ApiError } from "../errors/apiError.js";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: ApiError | Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message,
  });
};
