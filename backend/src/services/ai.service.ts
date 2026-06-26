import { prisma } from "../config/prisma";
import { ProviderResolver } from "../modules/ai/providers/provider.resolver";
import { ProviderFactory } from "../modules/ai/providers/provider.factory";
import { InterviewPlanDto } from "../modules/ai/providers/provider.interface";

export class AiService {
  private resolver: ProviderResolver;
  private factory: ProviderFactory;

  constructor() {
    this.resolver = new ProviderResolver();
    this.factory = new ProviderFactory();
  }

  /**
   * Orchestrates the call to the resolved AI provider.
   * Logs every request (latency, success/failure, prompt/completion tokens) in the AIRequest table.
   */
  async generateInterview(
    userId: string,
    interviewId: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<InterviewPlanDto> {
    const startTime = Date.now();
    let resolvedConfig;
    
    try {
      resolvedConfig = await this.resolver.resolve(userId);
    } catch (error: any) {
      // If resolver fails, log failure as UNKNOWN configuration resolution failure
      const latencyMs = Date.now() - startTime;
      await prisma.aIRequest.create({
        data: {
          interviewId,
          userId,
          provider: "UNKNOWN",
          model: "UNKNOWN",
          latencyMs,
          success: false,
          error: error.message || "Configuration resolution failed",
        },
      });
      throw error;
    }

    const providerInstance = this.factory.create(resolvedConfig);

    try {
      const response = await providerInstance.generateInterview(systemPrompt, userPrompt);
      const latencyMs = Date.now() - startTime;

      // Log successful request
      await prisma.aIRequest.create({
        data: {
          interviewId,
          userId,
          provider: resolvedConfig.provider,
          model: resolvedConfig.model || "default",
          latencyMs,
          promptTokens: response.promptTokens ?? null,
          completionTokens: response.completionTokens ?? null,
          success: true,
        },
      });

      return response.result;
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;

      // Log failed request
      await prisma.aIRequest.create({
        data: {
          interviewId,
          userId,
          provider: resolvedConfig.provider,
          model: resolvedConfig.model || "default",
          latencyMs,
          success: false,
          error: error.message || "AI Provider execution failed",
        },
      });

      throw error;
    }
  }
}
