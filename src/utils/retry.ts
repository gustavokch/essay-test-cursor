export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  attempt: number = 1
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempt >= config.maxAttempts) {
      throw error;
    }

    // Calculate delay with exponential backoff: initialDelay * 2^(attempt-1)
    const exponentialDelay = config.initialDelayMs * Math.pow(2, attempt - 1);
    // Cap at maxDelayMs
    const delay = Math.min(exponentialDelay, config.maxDelayMs);

    console.log(
      `⚠️  Attempt ${attempt} failed. Retrying in ${delay / 1000}s... (${attempt + 1}/${config.maxAttempts})`
    );

    await sleep(delay);

    return retryWithExponentialBackoff(fn, config, attempt + 1);
  }
}

