import { supabase, supabaseAdmin } from "../../config/supabase";
import { AuthRepository } from "./auth.repository";
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
    const role = data.role || UserRole.USER;

    // 1. Sign up user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role,
        },
      },
    });

    if (signUpError || !signUpData.user) {
      throw new Error(signUpError?.message || "Sign up failed");
    }

    const supabaseUser = signUpData.user;
    const session = signUpData.session;

    // 2. Synchronize user profile into our public User database
    let user: User;
    try {
      user = await this.authRepository.createUser({
        id: supabaseUser.id,
        name: data.name,
        email: data.email,
        role,
      });
    } catch (dbError) {
      console.error("❌ Sync database error:", dbError);
      throw new Error("Failed to register user in application database");
    }

    return {
      user: this.mapToUserResponse(user),
      accessToken: session?.access_token || "",
      refreshToken: session?.refresh_token || "",
    };
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthSuccessResponse> {
    // 1. Authenticate with Supabase Auth
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError || !signInData.user || !signInData.session) {
      throw new Error(signInError?.message || "Authentication failed");
    }

    const supabaseUser = signInData.user;
    const session = signInData.session;

    // 2. Retrieve user details from our database
    let user = await this.authRepository.findUserById(supabaseUser.id);
    if (!user) {
      // Fallback: If user exists in Supabase Auth but not in our public database (e.g. manual cleanup/sync lag)
      const name = supabaseUser.user_metadata?.name || "User";
      const role = (supabaseUser.user_metadata?.role as UserRole) || UserRole.USER;
      
      user = await this.authRepository.createUser({
        id: supabaseUser.id,
        name,
        email: data.email,
        role,
      });
    }

    return {
      user: this.mapToUserResponse(user),
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };
  }

  async refresh(refreshToken: string): Promise<TokenRefreshResponse> {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new Error(error?.message || "Failed to refresh token");
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async logout(accessToken: string): Promise<void> {
    // Sign out user globally using the Admin SDK and their token
    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken, "global");
    if (error) {
      console.warn("⚠️ Admin global signOut failed, falling back to local signOut:", error.message);
      const { error: localSignOutError } = await supabase.auth.signOut();
      if (localSignOutError) {
        throw new Error(localSignOutError.message);
      }
    }
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error("User profile not found");
    }
    return this.mapToUserResponse(user);
  }
}
