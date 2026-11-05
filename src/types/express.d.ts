import { DatabaseUsers } from "./types.ts";

declare global {
  namespace Express {
    interface Request {
      user?: DatabaseUsers;
    }
  }
}

export {};
