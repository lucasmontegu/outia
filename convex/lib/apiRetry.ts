/**
 * Exponential backoff retry logic for external API calls.
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 10000 } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on 4xx errors (client errors)
      if (lastError.message.includes("4")) {
        const statusMatch = lastError.message.match(/(\d{3})/);
        if (statusMatch) {
          const status = parseInt(statusMatch[1], 10);
          if (status >= 400 && status < 500 && status !== 429) {
            throw lastError;
          }
        }
      }

      if (attempt < maxRetries) {
        const delay = Math.min(
          baseDelayMs * Math.pow(2, attempt) + Math.random() * 500,
          maxDelayMs
        );
        await sleep(delay);
        console.warn(
          `Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`
        );
      }
    }
  }

  throw lastError ?? new Error("All retry attempts failed");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
