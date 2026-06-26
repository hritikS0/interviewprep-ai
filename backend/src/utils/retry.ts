/**
 * Retries an asynchronous function a specified number of times before throwing the final error.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries = 1,
  delayMs = 0
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return retry(fn, retries - 1, delayMs);
  }
}
