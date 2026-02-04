import { Logger } from "#/shared/libs/logger.lib";
import { NextFunction, Request, Response } from "express";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  Logger.error(`[${new Date().toISOString()}] ${err}`);

  res.status(500).json({
    message: "Internal Server Error",
  });
}
