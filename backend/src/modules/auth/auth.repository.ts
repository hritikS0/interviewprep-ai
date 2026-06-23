import { prisma } from "../../config/prisma";
import { User, UserRole } from "@prisma/client";

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: {
    id: string;
    name: string;
    email: string;
    role?: UserRole;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role || UserRole.USER,
      },
    });
  }
}
