import { RequestHandler } from "express";
import { pool } from "../db/db.js";
import { asyncErrorHandler } from "../errors/asyncError.js";
import { ApiError } from "../errors/apiError.js";
import { ENV } from "../utils/env.js";
import { DatabaseUsers, Payload } from "../types/types.js";

import jwt from "jsonwebtoken";

export const authenticate: RequestHandler = asyncErrorHandler(
  async (req, _res, next) => {
    const { token } = req.cookies;
    if (!token) {
      return next(new ApiError(401, "Please login to continue"));
    }

    const verified = jwt.verify(token, ENV.JWT_SECRET);
    if (
      typeof verified === "string" ||
      typeof verified.id !== "string" ||
      typeof verified.email !== "string"
    ) {
      return next(new ApiError(403, "You are not authorized"));
    }

    const decode: Payload = {
      id: verified.id,
      email: verified.email,
    };

    const result = await pool.query<DatabaseUsers>(
      `SELECT id, email
        FROM users
        WHERE id = $1 AND email = $2
        `,
      [decode.id, decode.email],
    );

    if (!result.rows[0]) {
      return next(new ApiError(403, "You are not authorized"));
    }

    req.user = result.rows[0];

    next();
  },
);
