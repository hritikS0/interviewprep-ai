import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendError } from "../utils/response";
import { UserRole } from "@prisma/client";

export interface SupabaseTokenPayload {
  sub: string;
  email?: string;
  role?: string;
  user_metadata?: {
    name?: string;
    role?: UserRole;
  };
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
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

    const decoded = jwt.verify(token, env.JWT_SECRET) as SupabaseTokenPayload;

    req.user = {
      userId: decoded.sub,
      email: decoded.email || "",
      role: decoded.user_metadata?.role || UserRole.USER,
    };

    next();
  } catch (error) {
    sendError(res, "Unauthorized: Invalid or expired token", 401);
  }
};
