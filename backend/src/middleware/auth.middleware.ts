import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { supabaseAdmin } from "../config/supabase";
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

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const user = await verifyToken(token);

    req.user = user;
    next();
  } catch (error) {
    sendError(res, "Unauthorized: Invalid or expired token", 401);
  }
};

async function verifyToken(token: string): Promise<AuthenticatedUser> {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as SupabaseTokenPayload;
    return {
      userId: decoded.sub,
      email: decoded.email || "",
      role: decoded.user_metadata?.role || UserRole.USER,
    };
  } catch {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      throw new Error("Token verification failed");
    }

    return {
      userId: data.user.id,
      email: data.user.email || "",
      role: (data.user.user_metadata?.role as UserRole) || UserRole.USER,
    };
  }
}
