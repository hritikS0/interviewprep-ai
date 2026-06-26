import { prisma } from "../../config/prisma";
import type { CreateInterviewInput, InterviewResponse } from "./interview.types";

export class InterviewService {
  async createInterview(
    userId: string,
    data: CreateInterviewInput
  ): Promise<{ interviewId: string; status: string }> {
    const interview = await prisma.interview.create({
      data: {
        userId,
        role: data.role,
        experienceLevel: data.experienceLevel,
        interviewType: data.interviewType,
        difficulty: data.difficulty,
        preferredLanguage: data.preferredLanguage,
        duration: data.duration,
        companyName: data.companyName || null,
        jobDescription: data.jobDescription || null,
      },
    });

    return {
      interviewId: interview.id,
      status: interview.status,
    };
  }

  async getInterviews(userId: string): Promise<InterviewResponse[]> {
    const interviews = await prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return interviews;
  }

  async getInterviewById(
    id: string,
    userId: string
  ): Promise<any> {
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        interviewPlan: {
          include: {
            rounds: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      throw Object.assign(new Error("Interview not found"), { statusCode: 404 });
    }

    if (interview.userId !== userId) {
      throw Object.assign(new Error("You do not have access to this interview"), {
        statusCode: 403,
      });
    }

    return interview;
  }

  async deleteInterview(id: string, userId: string): Promise<void> {
    const interview = await prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw Object.assign(new Error("Interview not found"), { statusCode: 404 });
    }

    if (interview.userId !== userId) {
      throw Object.assign(new Error("You do not have access to this interview"), {
        statusCode: 403,
      });
    }

    if (interview.status !== "PENDING") {
      throw Object.assign(
        new Error("Cannot delete an interview that has already started"),
        { statusCode: 409 }
      );
    }

    await prisma.interview.delete({
      where: { id },
    });
  }
}
