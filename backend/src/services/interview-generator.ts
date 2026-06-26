import { prisma } from "../config/prisma";
import { AiService } from "./ai.service";
import { buildGenerateInterviewPrompt } from "../modules/ai/prompts/generateInterview.prompt";
import { retry } from "../utils/retry";
import { QuestionType } from "@prisma/client";

export class InterviewGenerator {
  private aiService: AiService;

  constructor() {
    this.aiService = new AiService();
  }

  /**
   * Generates and stores the complete interview plan for an existing interview setup.
   */
  async generate(interviewId: string, userId: string): Promise<any> {
    // 1. Find the interview setup in DB
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      throw Object.assign(new Error("Interview setup not found"), { statusCode: 404 });
    }

    if (interview.userId !== userId) {
      throw Object.assign(new Error("You do not have access to this interview"), { statusCode: 403 });
    }

    // Accept CREATED or PENDING (for backwards compatibility)
    if (interview.status !== "CREATED" && interview.status !== "PENDING") {
      throw Object.assign(
        new Error(`Interview plan has already been processed or is in progress (status: ${interview.status})`),
        { statusCode: 409 }
      );
    }

    // 2. Transition status to GENERATING
    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: "GENERATING" },
    });

    try {
      // Infer core skills from role and preferredLanguage
      const skills = this.inferSkills(interview.role, interview.preferredLanguage);

      // Build prompt using prompt builder
      const { systemPrompt, userPrompt } = buildGenerateInterviewPrompt({
        role: interview.role,
        experienceLevel: interview.experienceLevel,
        skills,
        targetCompany: interview.companyName,
        jobDescription: interview.jobDescription,
      });

      // Call AI service with retry logic (retry once on parse/network failure)
      const planResult = await retry(
        () => this.aiService.generateInterview(userId, interviewId, systemPrompt, userPrompt),
        1 // Retry 1 time (2 attempts total)
      );

      // 3. Store in DB inside a Prisma transaction
      const savedPlan = await prisma.$transaction(async (tx) => {
        // Create InterviewPlan
        const plan = await tx.interviewPlan.create({
          data: {
            interviewId: interview.id,
            difficulty: planResult.difficulty,
            estimatedDuration: planResult.estimatedDuration,
          },
        });

        // Create rounds and questions
        for (const roundData of planResult.rounds) {
          const round = await tx.interviewRound.create({
            data: {
              interviewPlanId: plan.id,
              name: roundData.name,
            },
          });

          // Map round name to QuestionType enum
          let questionType: QuestionType = QuestionType.TECHNICAL;
          if (roundData.name === "Introduction") {
            questionType = QuestionType.INTRODUCTION;
          } else if (roundData.name === "Coding") {
            questionType = QuestionType.CODING;
          } else if (roundData.name === "Behavioral") {
            questionType = QuestionType.BEHAVIORAL;
          }

          if (roundData.questions && roundData.questions.length > 0) {
            await tx.generatedQuestion.createMany({
              data: roundData.questions.map((q) => ({
                roundId: round.id,
                type: questionType,
                topic: q.topic || null,
                difficulty: q.difficulty || null,
                question: q.question,
                metadata: q.metadata ? JSON.parse(JSON.stringify(q.metadata)) : null,
              })),
            });
          }
        }

        // Update interview status to READY
        await tx.interview.update({
          where: { id: interviewId },
          data: { status: "READY" },
        });

        return plan;
      });

      // Retrieve full plan to return
      const fullPlan = await prisma.interviewPlan.findUnique({
        where: { id: savedPlan.id },
        include: {
          rounds: {
            include: {
              questions: true,
            },
          },
        },
      });

      return fullPlan;
    } catch (error: any) {
      console.error("💥 Generation failed:", error.stack || error.message);
      
      // Update status to FAILED in case of failure
      await prisma.interview.update({
        where: { id: interviewId },
        data: { status: "FAILED" },
      }).catch((dbErr) => console.error("Failed to update status to FAILED:", dbErr));

      throw error;
    }
  }

  /**
   * Helper function to infer relevant technical skills based on candidate role and language.
   */
  private inferSkills(role: string, preferredLanguage: string): string[] {
    const roleLower = role.toLowerCase();
    const skills = new Set<string>();

    if (preferredLanguage) {
      skills.add(preferredLanguage);
    }

    if (roleLower.includes("frontend") || roleLower.includes("react") || roleLower.includes("web") || roleLower.includes("ui")) {
      ["JavaScript", "TypeScript", "React", "HTML5", "CSS3"].forEach((s) => skills.add(s));
    } else if (roleLower.includes("backend") || roleLower.includes("node") || roleLower.includes("api") || roleLower.includes("server")) {
      ["Node.js", "Express", "REST APIs", "PostgreSQL", "SQL"].forEach((s) => skills.add(s));
    } else if (roleLower.includes("fullstack") || roleLower.includes("full stack")) {
      ["JavaScript", "TypeScript", "React", "Node.js", "REST APIs", "SQL"].forEach((s) => skills.add(s));
    } else {
      skills.add(role);
    }

    return Array.from(skills);
  }
}
