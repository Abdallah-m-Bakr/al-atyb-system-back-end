import { NextFunction, Request, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (!isProduction && err instanceof Error) {
    return res.status(500).json({ message: err.message });
  }

  return res.status(500).json({ message: "Internal server error" });
};
