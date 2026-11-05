import jwt from "jsonwebtoken";
import "dotenv/config";
import { DatabaseUsers, Payload } from "../types/types.js";
import { Response } from "express";
import { ENV } from "./env.js";

export const genToken = (user: DatabaseUsers, res: Response) => {
  const payload: Payload = {
    id: user.id,
    email: user.email,
  };
  const token = jwt.sign(payload, ENV.JWT_SECRET);

  res.cookie("token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  return token;
};
