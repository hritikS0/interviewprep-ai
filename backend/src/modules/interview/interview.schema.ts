import { z } from "zod";

export const CreateInterviewSchema = z.object({
  role: z.string().trim().min(1, "Role is required"),
  experienceLevel: z.string().trim().min(1, "Experience level is required"),
  interviewType: z.string().trim().min(1, "Interview type is required"),
  difficulty: z.string().trim().min(1, "Difficulty is required"),
  preferredLanguage: z.string().trim().min(1, "Preferred language is required"),
  duration: z
    .number({ message: "Duration must be a number" })
    .int("Duration must be a whole number")
    .min(15, "Duration must be at least 15 minutes")
    .max(120, "Duration must not exceed 120 minutes"),
  companyName: z.string().trim().optional(),
  jobDescription: z.string().trim().optional(),
});

export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>;

export const SaveAnswerSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  answerText: z.string(),
});

export type SaveAnswerInput = z.infer<typeof SaveAnswerSchema>;
