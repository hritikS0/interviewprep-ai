import { UserRole } from "@prisma/client";

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSuccessResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
}
