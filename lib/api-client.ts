import type { StringKey } from "@/lib/i18n";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

/** POSTs JSON and returns the parsed response, throwing ApiError on non-2xx. */
export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.error || `Server responded with ${res.status}`, res.status);
  }
  return res.json();
}

/**
 * Picks the translated message to show for a failed request: specific copy
 * for oversized uploads and rate limits, otherwise the caller's fallback.
 */
export function errorMessageKey(err: unknown, fallback: StringKey): StringKey {
  if (err instanceof ApiError) {
    if (err.status === 413) return "errors.tooLarge";
    if (err.status === 429) return "errors.rateLimited";
  }
  return fallback;
}

export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
