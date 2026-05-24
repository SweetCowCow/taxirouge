// Smoke test：確認 llmComplete() 立刻 throw 且不發網路請求。
// 不引入 testing framework — 用一個簡單的可執行斷言，由 `pnpm tsx` 或 build 過程觸發。
// 之後加 vitest 時可直接改成 it/expect。

import { llmComplete, NotEnabledError } from "./client";

export async function smokeTest_llmComplete_throws_NotEnabledError(): Promise<void> {
  const originalFetch = globalThis.fetch;
  let fetchCalled = false;
  globalThis.fetch = (async () => {
    fetchCalled = true;
    throw new Error("fetch should not have been called");
  }) as typeof fetch;

  try {
    await llmComplete({ messages: [{ role: "user", content: "ping" }] });
    throw new Error("Expected NotEnabledError, got resolved promise");
  } catch (e) {
    if (!(e instanceof NotEnabledError)) {
      throw new Error(`Expected NotEnabledError, got ${(e as Error).message}`);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }

  if (fetchCalled) {
    throw new Error("llmComplete must not perform any network request in B-stage");
  }
}
