export interface IntroductionQuestionDto {
  id: string;
  question: string;
}

export interface TechnicalQuestionDto {
  id: string;
  topic: string;
  difficulty: string;
  question: string;
  expectedAnswerPoints: string[];
  followUpPossible: boolean;
}

export interface CodingProblemDto {
  title: string;
  difficulty: string;
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: { input: string; output: string }[];
  starterCode: { javascript: string; java: string; python: string };
  hiddenTestCases: { input: string; output: string }[];
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
}

export interface BehavioralQuestionDto {
  competency: string;
  question: string;
  whatToEvaluate: string;
}

export interface IntroductionRoundDto {
  name: "Introduction";
  questions: IntroductionQuestionDto[];
}

export interface TechnicalRoundDto {
  name: "Technical";
  questions: TechnicalQuestionDto[];
}

export interface CodingRoundDto {
  name: "Coding";
  problem: CodingProblemDto;
}

export interface BehavioralRoundDto {
  name: "Behavioral";
  questions: BehavioralQuestionDto[];
}

export type InterviewRoundDto =
  | IntroductionRoundDto
  | TechnicalRoundDto
  | CodingRoundDto
  | BehavioralRoundDto;

export interface InterviewPlanDto {
  role: string;
  difficulty: string;
  estimatedDuration: string;
  rounds: InterviewRoundDto[];
}

export interface AIProviderResponse<T> {
  result: T;
  promptTokens?: number;
  completionTokens?: number;
}

export interface AIProvider {
  generateInterview(
    systemPrompt: string,
    userPrompt: string
  ): Promise<AIProviderResponse<InterviewPlanDto>>;
  evaluateAnswer(): Promise<any>;
  generateFollowup(): Promise<any>;
  generateReport(
    systemPrompt: string,
    userPrompt: string
  ): Promise<AIProviderResponse<any>>;
}
