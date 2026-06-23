import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from "./auth.validator";
import { sendSuccess, sendError } from "../../utils/response";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || "Validation failed", 400);
        return;
      }

      const result = await this.authService.register(parsed.data);
      sendSuccess(res, result, 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || "Validation failed", 400);
        return;
      }

      const result = await this.authService.login(parsed.data);
      sendSuccess(res, result, 200);
    } catch (error: unknown) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = RefreshTokenSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || "Validation failed", 400);
        return;
      }

      const result = await this.authService.refresh(parsed.data.refreshToken);
      sendSuccess(res, result, 200);
    } catch (error: unknown) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = RefreshTokenSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || "Validation failed", 400);
        return;
      }

      await this.authService.logout(parsed.data.refreshToken);
      sendSuccess(res, { message: "Successfully logged out" }, 200);
    } catch (error: unknown) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }

      const profile = await this.authService.getProfile(req.user.userId);
      sendSuccess(res, profile, 200);
    } catch (error: unknown) {
      next(error);
    }
  };
}
