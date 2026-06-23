import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt";
import { sendError } from "../utils/response";

// Extend the Express Request interface globally
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Missing or invalid authorization token", 401);
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      sendError(res, "Missing token", 401);
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    sendError(res, "Unauthorized: Invalid or expired token", 401);
  }
};
