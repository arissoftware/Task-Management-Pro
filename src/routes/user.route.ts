import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getOneUser,
  login,
  profile,
  register,
  update,
} from "../controllers/users.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { protect } from "../middlewares/admin.js";

const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", login);

userRouter.use(authenticate);
userRouter.get("/profile", profile);
userRouter.patch("/update", update);
userRouter.delete("/delete", deleteUser);

userRouter.use(protect("ADMIN"));
userRouter.get("/", getAllUsers);
userRouter.get("/:userId", getOneUser);

export default userRouter;
