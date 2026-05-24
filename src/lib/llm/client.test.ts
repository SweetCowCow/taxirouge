import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { llmComplete, NotEnabledError } from "./client";

describe("llmComplete", () => {
  let originalFetch: typeof globalThis.fetch;
  let fetchCalled: boolean;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchCalled = false;
    globalThis.fetch = (async () => {
      fetchCalled = true;
      throw new Error("fetch should not have been called");
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("throws NotEnabledError in friend-playtest phase", async () => {
    await expect(
      llmComplete({ messages: [{ role: "user", content: "ping" }] }),
    ).rejects.toBeInstanceOf(NotEnabledError);
  });

  it("makes no network request when invoked", async () => {
    await expect(
      llmComplete({ messages: [{ role: "user", content: "ping" }] }),
    ).rejects.toThrow();
    expect(fetchCalled).toBe(false);
  });
});
