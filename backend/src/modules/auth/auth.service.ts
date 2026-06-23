import bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repository";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { AuthSuccessResponse, UserResponse, TokenRefreshResponse } from "./auth.types";
import { UserRole, User } from "@prisma/client";

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  private mapToUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<AuthSuccessResponse> {
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await this.authRepository.createUser({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshTokenString = generateRefreshToken({ userId: user.id, role: user.role });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.createRefreshToken({
      token: refreshTokenString,
      userId: user.id,
      expiresAt,
    });

    return {
      user: this.mapToUserResponse(user),
      accessToken,
      refreshToken: refreshTokenString,
    };
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthSuccessResponse> {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshTokenString = generateRefreshToken({ userId: user.id, role: user.role });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.createRefreshToken({
      token: refreshTokenString,
      userId: user.id,
      expiresAt,
    });

    return {
      user: this.mapToUserResponse(user),
      accessToken,
      refreshToken: refreshTokenString,
    };
  }

  async refresh(refreshTokenString: string): Promise<TokenRefreshResponse> {
    // Validate signature & expiration of refresh token
    try {
      verifyRefreshToken(refreshTokenString);
    } catch (err) {
      throw new Error("Invalid or expired refresh token");
    }

    const storedToken = await this.authRepository.findRefreshToken(refreshTokenString);
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new Error("Invalid or expired refresh token");
    }

    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      role: storedToken.user.role,
    });

    return {
      accessToken,
    };
  }

  async logout(refreshTokenString: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(refreshTokenString);
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error("User profile not found");
    }
    return this.mapToUserResponse(user);
  }
}
