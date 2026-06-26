import { AIProvider } from "./provider.interface";
import { ResolvedProviderConfig } from "./provider.resolver";
import { NvidiaProvider } from "./nvidia.provider";
import { OpenaiProvider } from "./openai.provider";
import { GeminiProvider } from "./gemini.provider";
import { ClaudeProvider } from "./claude.provider";
import { GroqProvider } from "./groq.provider";

export class ProviderFactory {
  /**
   * Instantiates the correct AIProvider class based on the resolved configuration.
   */
  create(config: ResolvedProviderConfig): AIProvider {
    const providerName = config.provider.toUpperCase();

    switch (providerName) {
      case "NVIDIA":
        return new NvidiaProvider({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          model: config.model,
        });
      case "OPENAI":
        return new OpenaiProvider({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          model: config.model,
        });
      case "GEMINI":
        return new GeminiProvider({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          model: config.model,
        });
      case "CLAUDE":
        return new ClaudeProvider({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          model: config.model,
        });
      case "GROQ":
        return new GroqProvider({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          model: config.model,
        });
      default:
        throw Object.assign(
          new Error(`Unsupported AI provider: ${config.provider}`),
          { statusCode: 400 }
        );
    }
  }
}
