import { z } from "zod";

const IntroductionQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1, "Question text is required"),
});

const TechnicalQuestionSchema = z.object({
  id: z.string(),
  topic: z.string(),
  difficulty: z.string(),
  question: z.string().min(1, "Question text is required"),
  expectedAnswerPoints: z.array(z.string()),
  followUpPossible: z.boolean(),
});

const CodingProblemSchema = z.object({
  title: z.string(),
  difficulty: z.string(),
  problemStatement: z.string(),
  inputFormat: z.string(),
  outputFormat: z.string(),
  constraints: z.array(z.string()),
  examples: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
    })
  ),
  starterCode: z.object({
    javascript: z.string(),
    java: z.string(),
    python: z.string(),
  }),
  hiddenTestCases: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
    })
  ),
  expectedTimeComplexity: z.string(),
  expectedSpaceComplexity: z.string(),
});

const BehavioralQuestionSchema = z.object({
  competency: z.string(),
  question: z.string().min(1, "Question text is required"),
  whatToEvaluate: z.string(),
});

const InterviewRoundSchema = z.discriminatedUnion("name", [
  z.object({
    name: z.literal("Introduction"),
    questions: z.array(IntroductionQuestionSchema),
  }),
  z.object({
    name: z.literal("Technical"),
    questions: z.array(TechnicalQuestionSchema),
  }),
  z.object({
    name: z.literal("Coding"),
    problem: CodingProblemSchema,
  }),
  z.object({
    name: z.literal("Behavioral"),
    questions: z.array(BehavioralQuestionSchema),
  }),
]);

export const InterviewPlanContentSchema = z.object({
  role: z.string(),
  difficulty: z.string(),
  estimatedDuration: z.string(),
  rounds: z.array(InterviewRoundSchema),
});

export const InterviewPlanResponseSchema = z.object({
  interviewPlan: InterviewPlanContentSchema,
});

export type InterviewPlanContent = z.infer<typeof InterviewPlanContentSchema>;
export type InterviewRoundContent = z.infer<typeof InterviewRoundSchema>;
export type IntroductionQuestion = z.infer<typeof IntroductionQuestionSchema>;
export type TechnicalQuestion = z.infer<typeof TechnicalQuestionSchema>;
export type CodingProblem = z.infer<typeof CodingProblemSchema>;
export type BehavioralQuestion = z.infer<typeof BehavioralQuestionSchema>;
