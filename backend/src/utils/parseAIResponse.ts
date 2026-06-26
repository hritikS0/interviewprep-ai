import { ZodSchema } from "zod";

export class AIResponseParseError extends Error {
  constructor(message: string, public rawResponse?: string) {
    super(message);
    this.name = "AIResponseParseError";
    Object.setPrototypeOf(this, AIResponseParseError.prototype);
  }
}

/**
 * Strips markdown code blocks, extracts the JSON object, parses it, and validates it against a Zod schema.
 */
export function parseAIResponse<T>(rawContent: string, schema: ZodSchema<T>): T {
  let cleaned = rawContent.trim();

  // Strip markdown code block wrappers (e.g. ```json ... ```)
  if (cleaned.startsWith("```")) {
    const match = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }
  }

  // Extract JSON object if there is leading/trailing text
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new AIResponseParseError("Response does not contain a valid JSON object", rawContent);
  }

  const jsonString = cleaned.substring(firstBrace, lastBrace + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error: any) {
    throw new AIResponseParseError(`Failed to parse JSON: ${error?.message || "Unknown error"}`, rawContent);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const errorDetails = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    throw new AIResponseParseError(`JSON validation failed: ${errorDetails}`, rawContent);
  }

  return result.data;
}
