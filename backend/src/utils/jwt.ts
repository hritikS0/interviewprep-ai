import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "@prisma/client";

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

export const generateToken = (userId: string, role: UserRole): string => {
  return generateAccessToken({ userId, role });
};

export const verifyToken = (token: string): TokenPayload => {
  return verifyAccessToken(token);
};
