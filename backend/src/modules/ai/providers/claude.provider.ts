import { AIProvider, InterviewPlanDto, AIProviderResponse } from "./provider.interface";

export class ClaudeProvider implements AIProvider {
  constructor(config: { apiKey: string; baseUrl?: string; model?: string }) {}

  async generateInterview(
    systemPrompt: string,
    userPrompt: string
  ): Promise<AIProviderResponse<InterviewPlanDto>> {
    throw new Error("Claude Provider is not implemented yet.");
  }

  async evaluateAnswer(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async generateFollowup(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async generateReport(): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
