import { RequestHandler } from "express";
import { ApiError } from "../errors/apiError.js";
import { asyncErrorHandler } from "../errors/asyncError.js";
import { pool } from "../db/db.js";
import { DatabaseUsers, UpdateUser, Users } from "../types/types.js";
import bcrypt from "bcryptjs";
import { genToken } from "../utils/genJWT.js";

export const register: RequestHandler = asyncErrorHandler(
  async (req, res, next): Promise<void> => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new ApiError(400, "Please provide all the fields"));
    }

    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return next(new ApiError(400, "All fields are required"));
    }

    if (!email.includes("@gmail.com")) {
      return next(new ApiError(400, "Please enter a valid gmail address"));
    }

    const result = await pool.query<Users>(
      `
        SELECT id, email FROM users 
        WHERE email = $1
        `,
      [email],
    );
    const userExists = result.rows[0];
    if (userExists) {
      return next(new ApiError(409, "User already exists"));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result2 = await pool.query<DatabaseUsers>(
      `
        INSERT INTO users (full_name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, full_name, email, role
        `,
      [fullName, email, passwordHash],
    );
    const user = result2.rows[0];
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  },
);

export const login: RequestHandler = asyncErrorHandler(
  async (req, res, next): Promise<void> => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new ApiError(400, "Please provide all the fields"));
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ApiError(400, "All fields are required"));
    }

    const result = await pool.query<DatabaseUsers>(
      `SELECT id, email, password_hash
        FROM users
        WHERE email = $1
        `,
      [email],
    );
    const user = result.rows[0];
    if (!user) {
      return next(new ApiError(401, "Incorrect email or password"));
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return next(new ApiError(401, "Incorrect email or password"));
    }

    const token = genToken(user, res);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
    });
  },
);

export const update: RequestHandler = asyncErrorHandler(
  async (req, res, next): Promise<void> => {
    const id = req.user?.id;
    if (!id) {
      return next(new ApiError(403, "Please login to continue"));
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new ApiError(400, "Please provide all the fields"));
    }

    const { fullName, email, passwordHash } = req.body;
    if (!fullName && !email && !passwordHash) {
      return next(new ApiError(400, "Please update at least one field"));
    }

    const result = await pool.query<UpdateUser>(
      `SELECT id, email,password_hash
         FROM users
         WHERE id = $1
        `,
      [id],
    );
    const user = result.rows[0];
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    const result2 = await pool.query<DatabaseUsers>(
      `UPDATE users 
         SET 
         full_name = COALESCE($1, full_name), 
         email = COALESCE($2, email), 
         password_hash = COALESCE($3, password_hash),
         updated_at = NOW()
         WHERE id = $4

         RETURNING id, full_name, email, updated_at
        `,
      [fullName, email, passwordHash, id],
    );
    const updatedUser = result2.rows[0];

    res.status(200).json({
      success: true,
      message: "Profile update successfull",
      data: updatedUser,
    });
  },
);

export const deleteUser: RequestHandler = asyncErrorHandler(
  async (req, res, next): Promise<void> => {
    const id = req.user?.id;
    if (!id) {
      return next(new ApiError(403, "Please login to continue"));
    }

    const result = await pool.query<Users>(
      `SELECT id, email
        FROM users
        WHERE id = $1
        `,
      [id],
    );
    if (!result.rows[0]) {
      return next(new ApiError(401, "Please login to continue"));
    }

    const result2 = await pool.query<DatabaseUsers>(
      `DELETE FROM users
      WHERE id = $1
      RETURNING id, full_name, email
        `,
      [id],
    );

    if (!result2.rows[0]) {
      return next(new ApiError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result2.rows[0],
    });
  },
);

export const profile: RequestHandler = asyncErrorHandler(
  async (req, res, next): Promise<void> => {
    const id = req.user?.id;
    if (!id) {
      return next(new ApiError(403, "Please login to continue"));
    }

    const result = await pool.query<DatabaseUsers>(
      `SELECT id, full_name, email, role
        FROM users
        WHERE id = $1 AND email = $2
        `,
      [id, req.user?.email],
    );

    if (!result.rows[0]) {
      return next(new ApiError(403, "Please login to continue"));
    }

    res.status(200).json({
      success: true,
      message: `Welcome back ${result.rows[0].full_name}`,
      id: result.rows[0].id,
      name: result.rows[0].full_name,
      email: result.rows[0].email,
      role: result.rows[0].role,
    });
  },
);

export const getAllUsers: RequestHandler = asyncErrorHandler(
  async (req, res, next): Promise<void> => {
    const id = req.user?.id;
    const email = req.user?.email;

    if (!id) {
      return next(new ApiError(403, "Please login to continue"));
    }

    if (!email) {
      return next(new ApiError(403, "Please login to continue"));
    }

    // const result = await pool.query<DatabaseUsers>(
    //   `SELECT id, email
    //   FROM users
    //   WHERE id = $1 AND email = $2
    //   `,
    //   [id, email],
    // );

    // if (!result.rows[0]) {
    //   return next(new ApiError(404, "Please login to continue"));
    // }

    const result = await pool.query<DatabaseUsers>(
      `SELECT id, full_name, email, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      `,
    );

    if (!result.rows) {
      return next(new ApiError(404, "Users not found"));
    }

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      results: result.rowCount,
      data: result.rows,
    });
  },
);

export const getOneUser: RequestHandler = asyncErrorHandler(
  async (req, res, next) => {
    const id = req.user?.id;
    const email = req.user?.email;
    const userId = req.params.userId;

    if (!id) {
      return next(new ApiError(403, "Please login to continue"));
    }

    if (!email) {
      return next(new ApiError(403, "Please login to continue"));
    }

    if (!userId) {
      return next(
        new ApiError(400, "Please provide the user id in your request"),
      );
    }

    const result = await pool.query<DatabaseUsers>(
      `SELECT id, full_name, email, role
      FROM users
      WHERE id = $1
      `,
      [userId],
    );

    if (!result.rows[0]) {
      return next(new ApiError(404, "Users not found"));
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result.rows[0],
    });
  },
);
