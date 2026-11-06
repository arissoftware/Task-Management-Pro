import { Router } from "express";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getOneTask,
  updateTask,
} from "../controllers/tasks.controller.js";
import { authenticate } from "../middlewares/auth.js";

const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.post("/create", createTask);
taskRouter.get("/", getAllTasks);
taskRouter.get("/:taskId", getOneTask);
taskRouter.patch("/:taskId", updateTask);
taskRouter.delete("/:taskId", deleteTask);

export default taskRouter;
