import { AIProvider, InterviewPlanDto, AIProviderResponse } from "./provider.interface";
import { parseAIResponse } from "../../../utils/parseAIResponse";
import { InterviewPlanSchema } from "../validators/interview.schema";

export class NvidiaProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: { apiKey: string; baseUrl?: string; model?: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://integrate.api.nvidia.com/v1";
    this.model = config.model || "meta/llama-3.1-70b-instruct";
  }

  async generateInterview(
    systemPrompt: string,
    userPrompt: string
  ): Promise<AIProviderResponse<InterviewPlanDto>> {
    if (!this.apiKey) {
      throw Object.assign(
        new Error("Missing NVIDIA API Key. Please configure your key in settings or set the platform key."),
        { statusCode: 400 }
      );
    }

    const url = `${this.baseUrl.replace(/\/$/, "")}/chat/completions`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 3000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw Object.assign(
          new Error(`NVIDIA NIM API error (${response.status}): ${errorText}`),
          { statusCode: response.status }
        );
      }

      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      
      if (!content) {
        throw Object.assign(new Error("NVIDIA NIM returned an empty response"), { statusCode: 502 });
      }

      // Parse, clean up markdown tags, and validate against Zod schema
      const result = parseAIResponse(content, InterviewPlanSchema);

      return {
        result,
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw Object.assign(new Error("NVIDIA NIM API request timed out after 60 seconds"), { statusCode: 504 });
      }
      throw error;
    }
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
