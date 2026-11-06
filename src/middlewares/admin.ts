import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/apiError.js";
import { UserRole } from "../types/types.js";

export const protect = (role: UserRole) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return next(new ApiError(403, "You are not authorized"));
    }
    next();
  };
};
