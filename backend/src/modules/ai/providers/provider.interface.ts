export interface GeneratedQuestionDto {
  topic?: string | null;
  difficulty?: string | null;
  question: string;
  metadata?: any | null;
}

export interface InterviewRoundDto {
  name: "Introduction" | "Technical" | "Coding" | "Behavioral";
  questions: GeneratedQuestionDto[];
}

export interface InterviewPlanDto {
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
  generateReport(): Promise<any>;
}
