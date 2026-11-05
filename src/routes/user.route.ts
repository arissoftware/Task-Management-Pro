import { Router } from "express";
import {
  deleteUser,
  login,
  profile,
  register,
  update,
} from "../controllers/users.controller.js";
import { authenticate } from "../middlewares/auth.js";

const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", login);

userRouter.use(authenticate);
userRouter.get("/profile", profile);
userRouter.patch("/update", update);
userRouter.delete("/delete", deleteUser);

export default userRouter;
