import { z } from "zod";

export const GeneratedQuestionSchema = z.object({
  topic: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  question: z.string().min(1, "Question text is required"),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});

export const InterviewRoundSchema = z.object({
  name: z.enum(["Introduction", "Technical", "Coding", "Behavioral"]),
  questions: z.array(GeneratedQuestionSchema),
});

export const InterviewPlanSchema = z.object({
  difficulty: z.string().min(1, "Difficulty is required"),
  estimatedDuration: z.string().min(1, "Estimated duration is required"),
  rounds: z.array(InterviewRoundSchema),
});

export type GeneratedQuestionValidation = z.infer<typeof GeneratedQuestionSchema>;
export type InterviewRoundValidation = z.infer<typeof InterviewRoundSchema>;
export type InterviewPlanValidation = z.infer<typeof InterviewPlanSchema>;
