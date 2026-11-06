import { pool } from "../db/db.js";
import { RequestHandler } from "express";
import { asyncErrorHandler } from "../errors/asyncError.js";
import { ApiError } from "../errors/apiError.js";
import { DatabaseTasks } from "../types/types.js";

export const createTask: RequestHandler = asyncErrorHandler(
  async (req, res, next): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ApiError(403, "Please login to continue"));
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new ApiError(400, "Please provide all the fields"));
    }

    const { title, body } = req.body;
    if (!title || !body) {
      return next(new ApiError(400, "Please provide all the fields"));
    }

    const task = await pool.query<DatabaseTasks>(
      `INSERT INTO tasks (user_id, title, body)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, title, body, status, priority, created_at
        `,
      [userId, title, body],
    );

    if (!task.rows[0]) {
      return next(new ApiError(500, "Internal server error"));
    }

    const populate = await pool.query<DatabaseTasks>(
      `SELECT tasks.id, users.full_name, tasks.title, tasks.body, tasks.status, tasks.priority, tasks.created_at
        FROM tasks
        RIGHT JOIN users
        ON tasks.user_id = users.id
        WHERE tasks.id = $1 AND tasks.user_id = $2
        `,
      [task.rows[0].id, userId],
    );

    if (!populate.rows[0]) {
      return next(new ApiError(500, "Internal server error"));
    }

    res.status(201).json({
      success: true,
      message: "Task added successfully",
      data: populate.rows[0],
    });
  },
);

export const getAllTasks: RequestHandler = asyncErrorHandler(
  async (req, res, next): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ApiError(403, "Please login to continue"));
    }

    const tasks = await pool.query<DatabaseTasks>(
      `SELECT tasks.id, tasks.user_id, users.full_name, tasks.title, tasks.body, tasks.status, tasks.priority, tasks.created_at, tasks.updated_at
        FROM tasks
        RIGHT JOIN users
        ON tasks.user_id = users.id
        WHERE tasks.user_id = $1
        ORDER BY created_at DESC
        `,
      [userId],
    );

    if (!tasks.rows) {
      return next(new ApiError(404, "You do not have any task"));
    }

    res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      results: tasks.rowCount,
      data: tasks.rows,
    });
  },
);

export const getOneTask: RequestHandler = asyncErrorHandler(
  async (req, res, next): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ApiError(403, "Please login to continue"));
    }

    const taskId = req.params.taskId;
    if (!taskId) {
      return next(
        new ApiError(403, "Please provide the id of the task you want"),
      );
    }

    const task = await pool.query<DatabaseTasks>(
      `SELECT id, user_id, title, body, status, priority, created_at, updated_at
        FROM tasks
        WHERE id = $1 AND user_id = $2
        `,
      [taskId, userId],
    );

    if (!task.rows[0]) {
      return next(new ApiError(404, "Tasks not found"));
    }

    res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: task.rows[0],
    });
  },
);

export const updateTask: RequestHandler = asyncErrorHandler(
  async (req, res, next): Promise<void> => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(
        new ApiError(400, "Please provide the fields you to update."),
      );
    }

    const { title, body, status, priority } = req.body;
    if (!title && !body && !status && !priority) {
      return next(
        new ApiError(
          400,
          "Please provide values for the fields you want to update",
        ),
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      return next(new ApiError(403, "Please login to continue."));
    }

    const taskId = req.params.taskId;
    if (!taskId) {
      return next(
        new ApiError(403, "Please provide the id of the task you want."),
      );
    }

    const task = await pool.query<DatabaseTasks>(
      `SELECT id, user_id, title, body, status, priority, created_at, updated_at
        FROM tasks
        WHERE id = $1 AND user_id = $2
        `,
      [taskId, userId],
    );

    if (!task.rows[0]) {
      return next(new ApiError(404, "Tasks not found"));
    }

    const result = await pool.query<DatabaseTasks>(
      `UPDATE tasks
        SET 
        title = COALESCE($1, title), 
        body = COALESCE($2, body),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        updated_at = NOW()
        WHERE id = $5 AND user_id = $6
        RETURNING id, user_id, title, body, status, priority
        `,
      [title, body, status, priority, taskId, userId],
    );

    if (!result.rows[0]) {
      return next(new ApiError(500, "Internal server error"));
    }

    res.status(200).json({
      success: true,
      message: "Task update successful",
      data: result.rows[0],
    });
  },
);

export const deleteTask: RequestHandler = asyncErrorHandler(
  async (req, res, next): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ApiError(403, "Please login to continue."));
    }

    const taskId = req.params.taskId;
    if (!taskId) {
      return next(
        new ApiError(403, "Please provide the id of the task you want."),
      );
    }

    const task = await pool.query<DatabaseTasks>(
      `SELECT id, user_id
        FROM tasks
        WHERE id = $1 AND user_id = $2
        `,
      [taskId, userId],
    );

    if (!task.rows[0]) {
      return next(new ApiError(404, "Tasks not found"));
    }

    const result = await pool.query<DatabaseTasks>(
      `DELETE FROM tasks
        WHERE id = $1 AND user_id = $2
        RETURNING id, user_id, title, body, status, priority, created_at, updated_at
        `,
      [taskId, userId],
    );

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: result.rows[0],
    });
  },
);
