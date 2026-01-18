/**
 * Validates OpenAI API key format
 */
export function validateOpenAIKey(apiKey: string | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!apiKey) {
    return { valid: false, error: "API key is required" };
  }

  // Remove any whitespace
  const trimmed = apiKey.trim();

  // Check if starts with sk-
  if (!trimmed.startsWith("sk-")) {
    return { valid: false, error: "API key must start with 'sk-'" };
  }

  // Check for extra spaces or newlines
  if (trimmed !== apiKey || trimmed.includes("\n") || trimmed.includes("\r")) {
    return { valid: false, error: "API key contains invalid characters (spaces/newlines)" };
  }

  // Check minimum length (sk- + at least 20 characters)
  if (trimmed.length < 23) {
    return { valid: false, error: "API key seems too short" };
  }

  return { valid: true };
}
