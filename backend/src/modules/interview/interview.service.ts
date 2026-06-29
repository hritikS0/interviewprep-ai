import { prisma } from "../../config/prisma";
import type { CreateInterviewInput, InterviewResponse } from "./interview.types";
import { AiService } from "../../services/ai.service";
import { buildGenerateReportPrompt } from "../ai/prompts/generateReport.prompt";

export class InterviewService {
  private aiService = new AiService();

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
        questions: true,
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

  async saveAnswer(
    interviewId: string,
    userId: string,
    questionText: string,
    answerText: string
  ): Promise<any> {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      throw Object.assign(new Error("Interview not found"), { statusCode: 404 });
    }

    if (interview.userId !== userId) {
      throw Object.assign(new Error("You do not have access to this interview"), {
        statusCode: 403,
      });
    }

    let question = await prisma.question.findFirst({
      where: {
        interviewId,
        questionText,
      },
    });

    if (question) {
      question = await prisma.question.update({
        where: { id: question.id },
        data: { answerText },
      });
    } else {
      question = await prisma.question.create({
        data: {
          interviewId,
          questionText,
          answerText,
        },
      });
    }

    return question;
  }

  async submitAndGradeInterview(
    interviewId: string,
    userId: string
  ): Promise<any> {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      throw Object.assign(new Error("Interview not found"), { statusCode: 404 });
    }

    if (interview.userId !== userId) {
      throw Object.assign(new Error("You do not have access to this interview"), {
        statusCode: 403,
      });
    }

    if (interview.status === "COMPLETED" && interview.report) {
      return interview;
    }

    // Fetch the generated plan and questions
    const interviewPlan = await prisma.interviewPlan.findUnique({
      where: { interviewId },
      include: {
        rounds: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!interviewPlan) {
      throw Object.assign(new Error("Interview plan not found"), { statusCode: 404 });
    }

    const allGeneratedQuestions: { question: string; type: string }[] = [];
    interviewPlan.rounds.forEach((round) => {
      round.questions.forEach((q) => {
        allGeneratedQuestions.push({
          question: q.question,
          type: q.type,
        });
      });
    });

    // Fetch the saved answers
    const answeredQuestions = await prisma.question.findMany({
      where: { interviewId },
    });

    // Map each generated question to its corresponding answer
    const questionsAndAnswers = allGeneratedQuestions.map((gq) => {
      const aq = answeredQuestions.find(
        (a) => a.questionText.trim() === gq.question.trim()
      );
      return {
        question: gq.question,
        type: gq.type,
        answer: aq ? aq.answerText || "" : "",
      };
    });

    // Build the grading/report prompts
    const { systemPrompt, userPrompt } = buildGenerateReportPrompt({
      role: interview.role,
      experienceLevel: interview.experienceLevel,
      difficulty: interviewPlan.difficulty,
      questionsAndAnswers,
    });

    // Call AiService to grade
    const reportResult = await this.aiService.generateReport(
      userId,
      interviewId,
      systemPrompt,
      userPrompt
    );

    // Save report in the database and mark interview as COMPLETED
    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: "COMPLETED",
        report: reportResult,
      },
    });

    return updatedInterview;
  }
}
