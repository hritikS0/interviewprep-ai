import { prisma } from "../../../config/prisma";
import { decrypt } from "../../../utils/crypto";
import { env } from "../../../config/env";

export interface ResolvedProviderConfig {
  provider: string;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export class ProviderResolver {
  /**
   * Resolves the active AI provider configuration for a given user.
   * If no custom configuration exists, it falls back to the default NVIDIA platform configuration.
   */
  async resolve(userId: string): Promise<ResolvedProviderConfig> {
    // 1. Fetch user's default/active provider config
    const activeConfig = await prisma.aIProviderConfig.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });

    // 2. If no configuration exists, fallback to the platform default (NVIDIA)
    if (!activeConfig) {
      return this.getPlatformDefaultConfig();
    }

    // 3. Resolve API Key based on usePlatformKey flag
    let apiKey = "";
    if (activeConfig.usePlatformKey) {
      apiKey = this.getPlatformApiKeyForProvider(activeConfig.provider);
    } else {
      if (!activeConfig.encryptedApiKey) {
        throw Object.assign(
          new Error(`API key for provider ${activeConfig.provider} is not configured. Please add an API key in your settings.`),
          { statusCode: 400 }
        );
      }
      try {
        apiKey = decrypt(activeConfig.encryptedApiKey);
      } catch (error) {
        throw Object.assign(
          new Error("Failed to decrypt custom API key. Please re-configure it in your settings."),
          { statusCode: 500 }
        );
      }
    }

    return {
      provider: activeConfig.provider.toUpperCase(),
      apiKey,
      model: activeConfig.model || undefined,
      baseUrl: activeConfig.baseUrl || undefined,
    };
  }

  private getPlatformDefaultConfig(): ResolvedProviderConfig {
    if (!env.NVIDIA_API_KEY) {
      throw Object.assign(
        new Error("Platform default NVIDIA API Key is not configured on the server."),
        { statusCode: 500 }
      );
    }
    return {
      provider: "NVIDIA",
      apiKey: env.NVIDIA_API_KEY,
      model: env.NVIDIA_MODEL,
      baseUrl: env.NVIDIA_API_URL,
    };
  }

  private getPlatformApiKeyForProvider(provider: string): string {
    const provUpper = provider.toUpperCase();
    if (provUpper === "NVIDIA") {
      if (!env.NVIDIA_API_KEY) {
        throw Object.assign(
          new Error("Platform NVIDIA API Key is not configured on the server."),
          { statusCode: 500 }
        );
      }
      return env.NVIDIA_API_KEY;
    }

    // Currently we only host NVIDIA as a platform default. Other providers require custom keys.
    throw Object.assign(
      new Error(`Platform keys are not supported for ${provider}. Please provide your own API key.`),
      { statusCode: 400 }
    );
  }
}
