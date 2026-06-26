import { z } from "zod";

export const StrengthsSchema = z.object({
  label: z.string().min(1, "Strength label is required"),
  score: z.number().int().min(0).max(100),
});

export const ImprovementsSchema = z.object({
  label: z.string().min(1, "Improvement area is required"),
  description: z.string().min(1, "Description is required"),
});

export const SkillsSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  score: z.number().int().min(0).max(100),
});

export const ReportSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  strengths: z.array(StrengthsSchema),
  improvements: z.array(ImprovementsSchema),
  skills: z.array(SkillsSchema),
  roadmap: z.array(z.string().min(1, "Roadmap item cannot be empty")),
});

export type ReportValidation = z.infer<typeof ReportSchema>;
