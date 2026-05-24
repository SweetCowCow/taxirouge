// B 階段（朋友試玩版）禁用 LLM。介面與環境變數先到位，之後 C 階段移除 throw 即可啟用。
// 走 OpenAI 相容介面：Zeabur AI Hub 與 OpenAI 官方端點都符合。

export class NotEnabledError extends Error {
  constructor(message = "LLM client is reserved for the cloud phase (C-stage) and is disabled in friend-playtest builds") {
    super(message);
    this.name = "NotEnabledError";
  }
}

export type LlmMessage = { role: "system" | "user" | "assistant"; content: string };

export type LlmCompleteArgs = {
  system?: string;
  messages: LlmMessage[];
  model?: string;
};

type LlmEnv = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

function readEnv(): LlmEnv {
  // Server-side only — process.env access is intentional. Client code 不應呼叫此模組。
  return {
    baseUrl: process.env.ZEABUR_AI_HUB_BASE_URL ?? "",
    apiKey: process.env.ZEABUR_AI_HUB_API_KEY ?? "",
    model: process.env.LLM_MODEL ?? "gpt-4o-mini",
  };
}

/**
 * OpenAI-compatible completion call. RESERVED — always throws `NotEnabledError` in B-stage.
 *
 * Returns the assistant message content as a string. C-stage will replace the throw with
 * a fetch to `${baseUrl}/chat/completions`.
 */
export async function llmComplete(_args: LlmCompleteArgs): Promise<string> {
  // 取一次 env 主要是為了讓 dead-code-elimination 不會把這條路徑整個剃掉，
  // 也順便讓未來開啟時不必到處改 import。
  void readEnv();
  throw new NotEnabledError();
}
