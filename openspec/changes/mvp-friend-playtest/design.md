## Context

本變更是「台灣怪奇夜行錄」的首個落地版本，目標 B 階段（朋友試玩）。設計文件 `台灣怪奇夜行錄_設計文件.md` 提供完整 v1 願景，本次只取「能完整玩通一局 + 視覺氛圍到位」的最小切片。

關鍵約束：
- **時程**：1.5-2 週 side project，必須能切出 Day 6-7 跑得起第一個可玩 milestone
- **單人開發**：所有架構決策都要降低自己未來維護負擔
- **B→C 平滑升級**：B 階段架構不能 C 階段砍掉重寫
- **部署目標**：Zeabur（不是 Vercel），LLM 來源是 Zeabur AI Hub（不是 Anthropic 直連）
- **內容主要靠手寫**：B 階段不接 LLM 即時生成，事件全部寫成 TypeScript 常數

利害關係人：開發者（使用者本人）為主，朋友試玩者為次要。

## Goals / Non-Goals

**Goals:**

- 建立一個可在 1.5-2 週內做完、且能順利進入 C 階段擴展的程式架構
- 讓「一局完整體驗」（發車 → 5-6 節點 → 王戰 → 結局 → 車行紀事）跑得通
- 視覺氛圍達到「朋友打開第一眼會想多看兩眼」的水準
- 內容資料與程式碼分離，方便日後從常數遷移到 DB
- LLM 接入點預留，但 B 階段完全用靜態文字

**Non-Goals:**

- 後端服務、資料庫、Auth、雲端存檔（C 階段範圍）
- LLM 即時呼叫、批次生成、模板配對、人工審核（C 階段範圍）
- 戰鬥平衡精算（採粗略平衡 + 隱形難度補償，輸了不檢討）
- 完整音效系統（時間有餘可加環境雨聲，非必要）
- 多角色、組牌介面、卡牌升級（v1.5+ 範圍）
- Twinkle Hub / data.gov.tw 接入（C 階段範圍）

## Decisions

### 採用 Next.js (App Router) 單一 repo，部署 Zeabur

**選擇**：Next.js 15 App Router + React 19 + Tailwind CSS 4 + TypeScript，全部塞同一個 repo，部署到 Zeabur。

**理由**：
- B 階段純前端就夠（無 API routes 使用），但 C 階段一定需要 API routes（審核後台、LLM 中繼、登入回呼），先用 Next.js 避免之後重寫
- App Router 的 Server Components 在 C 階段可承擔事件資料的 SSR，B 階段就先用 Client Components
- Zeabur 對 Next.js 有原生支援（zero-config），不需要寫 Dockerfile

**替代方案**：
- Vite + React 純 SPA：開發更快，但 C 階段加後端時要重寫整個部署設定
- Astro：靜態優先很適合敘事內容，但 C 階段的互動審核後台不直觀
- 直接寫 Phaser 或 Pixi：對「卡牌敘事 + 大量文字 UI」反而是阻力

### IndexedDB 作為本地存檔，包一層 wrapper

**選擇**：用 IndexedDB 而非 localStorage，但封裝成 `save-state.ts` 的同步介面（背後 async），讓遊戲邏輯不直接碰 IDB。

**理由**：
- localStorage 限制 5MB，車行紀事累積結局文字會逼近上限
- IndexedDB 支援結構化資料、容量大（瀏覽器配額制）
- 包 wrapper 是為 C 階段準備：未來把存檔換成 Postgres / cloud sync 時，遊戲邏輯零修改

**替代方案**：
- localStorage：簡單但容量不夠
- 直接用 idb 第三方套件：可，但 wrapper 仍要寫（用來抽象 cloud sync），那不如自己封裝

### LLM SDK 走 OpenAI 相容介面，B 階段不啟用

**選擇**：建立 `src/lib/llm/client.ts`，使用 `openai` npm 套件，base URL、API key、model name 全部從環境變數讀取。B 階段不寫任何呼叫程式碼，只保留 wrapper。

**理由**：
- Zeabur AI Hub 提供 OpenAI 相容 endpoint，未來只要在 env var 設定 base URL 即可
- 避免綁定特定 model provider，C 階段要換模型只改 env
- B 階段寫 wrapper 而不接呼叫的成本是 30 分鐘，但 C 階段省下整個 SDK 抽象設計

**替代方案**：
- 直接用 `@anthropic-ai/sdk`：與 Zeabur AI Hub 不相容，被否決
- 用 Vercel AI SDK：抽象更高但過度設計，且 B 階段用不到 streaming

### 內容資料寫 TypeScript 常數，不用 JSON

**選擇**：5-7 個事件、18 張卡牌、2 個王戰、結局文字池全部寫成 TypeScript 模組，匯出強型別物件。

**理由**：
- 編譯期型別檢查可在 build 時就抓到「事件選項指向不存在的下一個節點」等錯誤
- IDE 提供 jump-to-definition / refactor 工具，比 JSON 友善
- C 階段要遷到 DB 時，現有資料結構就是 schema 參考，直接寫遷移 script

**替代方案**：
- JSON：可，但失去型別檢查
- MDX：對長篇敘事友善，但「事件 + 選項分支 + 機制連動」用 MDX 反而麻煩

### 戰鬥引擎用純函數狀態機，UI 與邏輯解耦

**選擇**：`combat/engine.ts` 匯出 pure functions：`(state, action) => newState`。所有戰鬥規則寫在這層，React 元件只負責顯示與派發 action。

**理由**：
- 純函數可單元測試（B 階段時程內最少寫 2-3 個關鍵測試）
- 之後加「重播」「Undo」「自動戰鬥」等功能只需追加 action，不動 UI
- 隱性難度補償等暗藏機制也寫在引擎層，UI 完全不知情

**替代方案**：
- Redux / Zustand 全域 state：B 階段資料量還沒到需要，且增加學習曲線
- 把戰鬥邏輯寫在元件裡：快但日後重構代價高

### 單局採顯式狀態機（XState-style 但手刻）

**選擇**：`run/state-machine.ts` 定義單局所有狀態與轉移：`idle → driving → at-node → in-event/in-combat → node-result → driving → boss → ending`，每個轉移都標明觸發條件與下個狀態。手刻而不引入 XState。

**理由**：
- 顯式狀態機讓「隨時中斷存檔」可實作：序列化 current state 即可
- XState 對只有 ~8 個狀態的場景過度設計
- 之後加新節點類型（v1.5 的特殊事件）只是擴充 transition table

### 視覺架構：Design Tokens + Tailwind + 手刻關鍵動效

**選擇**：把 P5+Yakuza 風格的核心 token（色票、字體、陰影、邊框圓角）寫進 `src/styles/design-tokens.css` 與 Tailwind config，UI 元件用 Tailwind utility class。關鍵動效（卡牌進場、節點切換、雙軸資源變動）用 Framer Motion。

**理由**：
- Design tokens 集中管理，視覺微調快
- Framer Motion 對 React 整合佳，B 階段只用 4-5 種動效就夠
- 不引入 shadcn/ui — 該套件偏「商務 SaaS 感」，與本遊戲氛圍衝突

**替代方案**：
- 全部用 CSS Modules：可，但 Tailwind 開發速度更快
- 用 GSAP：能力更強但學習曲線高，B 階段用不到

### 卡牌 AI 生圖：先建風格手冊再橫向複製

**選擇**：Week 1 內先用 **gpt-image-2（OpenAI 官方端點直連）** 產 3-5 張 reference，固定 style prompt suffix（色調、構圖、濾鏡、negative），寫成 `docs/card-prompt-style-guide.md`。其餘 13-15 張全部套同一份 prompt 骨架，只變更主體描述。

**為何不走 Zeabur AI Hub**：AI Hub 目前未上架 gpt-image-2 標準介面，僅提供 Gemini 系列圖像模型（Gemini 3 Pro Image = nanobanana 2 等）。故 B 階段圖像生成走 OpenAI 官方端點，環境變數 `OPENAI_API_KEY` 存於 `.env.local`。LLM client wrapper 預留切換點，必要時可改走 AI Hub Gemini 作備援。

**理由**：
- 場景縮圖卡牌（discuss 選 C）最容易風格飄移，先建手冊是必要保險
- 18 張全用同一 prompt 骨架可確保視覺一致性
- 手冊本身是長期資產，C 階段加新卡也用得上

### 卡牌 4 系初版內容分配

**選擇**：車技（直接傷害 / 位移）5 張、行頭（debuff / 控場）5 張、路況（抽牌 / 閃避）4 張、話術（談判 / 收服）4 張，共 18 張。每張至少有 1 個機制效果 + 1 句 flavor text。

**理由**：
- 18 張剛好填滿一個 12-15 張的起始牌組 + 戰鬥中獲得 3-6 張新卡的設計
- 各系張數略有差距是刻意：車技 / 行頭最常用，話術 / 路況偏特殊機制

### 部署到 Zeabur 不寫 Dockerfile

**選擇**：用 Zeabur 對 Next.js 的 zero-config 部署，repo 內不寫 Dockerfile。若未來需要客製化 build 步驟（例如 LLM 預生成）再加。

**理由**：
- B 階段 build process 是標準 `next build`，沒有客製需求
- 寫 Dockerfile 增加維護成本與 build 時間

## Implementation Contract

**Behavior（玩家觀察到的行為）：**
- 打開首頁可看到「今晚開車嗎？」入口，按下進入單局
- 進入單局後右上角顯示時間（23:00 起跳），主畫面顯示節點地圖或當前事件
- 在節點上點擊「前方有人招手」會進入該節點（敘事事件或戰鬥）
- 戰鬥畫面顯示敵人、雙軸資源（油錶 / 精神）、手牌（5 張）、神識能量
- 玩家可拖曳或點擊出牌，扣除神識，產生效果
- 回合結束後敵人依固定行為樹反擊
- 戰鬥結束跳獎勵畫面（二選一卡牌或跳過拿錢）
- 油錶或精神歸零跳出失敗結局文字，並存進車行紀事
- 通關王戰跳出通關結局文字，並存進車行紀事
- 任何節點完成後關閉瀏覽器再開啟，回到上次節點完成後的狀態
- 「車行紀事」頁面可瀏覽歷次結局文字
- 每個事件結尾有「回報問題」按鈕（C 階段才接 webhook，B 階段先 console.log）

**核心介面與資料形狀：**
- `CardDefinition`：`{ id, name, school, cost, effects, flavorText, artPath }`
- `EnemyDefinition`：`{ id, name, hp, behaviorPattern, attackTarget: 'fuel'|'mind' }`
- `RunState`：`{ runId, startedAt, currentTime, currentNodeIndex, nodes, resources: {fuel, mind}, deck, hand, discard, codexEntries }`
- `NodeDefinition`：`{ id, type: 'passenger'|'gas-station'|'boss', eventId?, enemyId? }`
- `EventDefinition`：`{ id, openingText, choices: [{ text, outcome }] }`
- `EndingTemplate`：`{ id, condition: 'breakdown'|'vanished'|'cleared', textPool: string[] }`
- `CombatAction`：`{ type: 'play-card'|'end-turn', payload }`
- `combatReducer(state: CombatState, action: CombatAction): CombatState` — 純函數
- `runReducer(state: RunState, event: RunEvent): RunState` — 純函數
- LLM wrapper 介面：`llmComplete({ system, messages, model? }): Promise<string>` — B 階段 throw `NotEnabledError`

**失敗模式：**
- IndexedDB 寫入失敗（瀏覽器無痕模式 / 儲存空間不足）→ UI 顯示「無法存檔，本局結束將無法保留進度」紅字提示，但不阻擋遊戲繼續
- 圖片載入失敗 → 顯示卡牌名稱 + 系別色塊（design token 中定義的 fallback 樣式）
- 找不到下一個節點（資料錯誤）→ 強制結束本局並顯示「老黃今晚開到了不存在的路」結局
- LLM wrapper 在 B 階段被呼叫 → 立刻 throw（防止意外呼叫產生費用）

**驗收條件（reviewer 如何確認契約滿足）：**
1. `pnpm dev`（或 `npm run dev`）啟動成功，首頁可開啟
2. 從首頁可完整跑完一局（無論勝負），跑完後車行紀事頁面有新增一筆
3. 戰鬥中油錶歸零會出現「失蹤」結局文字，精神歸零會出現「瘋了」結局文字
4. 任一節點完成後重新整理瀏覽器，狀態回到該節點完成後（不會跳回節點開始）
5. 戰鬥引擎 `combatReducer` 有至少 3 個單元測試覆蓋：抽牌、出牌扣神識、敵人反擊
6. 18 張卡牌在卡牌目錄頁面（或單局內展示）皆有對應的場景縮圖（圖檔存在）
7. `pnpm build` 通過，無 TypeScript 錯誤
8. Zeabur 部署成功，朋友打開 URL 能玩

**Scope 邊界：**

**In scope:**
- B 階段定義範圍內所有功能（見 proposal What Changes 與 Non-Goals）
- 上述 6 個 capability 對應的程式碼
- Zeabur 部署設定（不寫 Dockerfile）
- 卡牌 AI 生圖風格手冊與 18 張卡牌實際生圖

**Out of scope:**
- Auth、Database、後端 API
- LLM 實際呼叫（wrapper 介面有但不啟用）
- Twinkle Hub / data.gov.tw 接入
- 戰鬥平衡精算（粗略平衡即可）
- 4 種以上敵人類型（只做衝撞 / 詛咒 / 對話 3 種）
- 多角色、組牌、卡牌升級
- 全套單元測試（只覆蓋戰鬥引擎核心）

## Risks / Trade-offs

- **AI 生圖風格不一致** → 卡牌看起來像拼貼。對策：Week 1 先建風格手冊並產 3-5 張 reference 定調；若 gpt-image-2 結果不理想，切到 AI Hub Gemini 3 Pro Image（nanobanana 2），再不行就降級為「純色塊 + 大字 + 系別 icon」（仍維持 P5 美學）
- **P5 視覺風太搶眼 → 蓋過敘事氛圍** → 對策：靠文字克制平衡視覺熱度；UI 動效保留但克制（不要每次出牌都全螢幕特效）
- **時程估太樂觀，Day 7 玩不通** → 對策：Day 5 結束時若戰鬥還跑不通就先砍敘事節點（只留王戰），把「能玩通」放在最優先
- **IndexedDB wrapper 與遊戲狀態耦合過深** → C 階段加 cloud sync 還是要重寫。對策：wrapper 只匯出 `loadRun() / saveRun(state) / listCodex()` 等 high-level API，內部實作可換
- **戰鬥引擎純函數但 React state 同步出 bug** → 對策：用單一 `useReducer` 持有戰鬥 state，避免散落多個 `useState`
- **手寫 5-7 個事件來不及** → 對策：Week 2 開始就動筆，先把骨架（場景 + 選項 + 結果）填完，敘事潤色放最後
- **Zeabur AI Hub 未來介面變動** → 對策：wrapper 已隔離，env var 切換即可

## Migration Plan

本變更為首次部署，無既有版本可回退。部署步驟：

1. push 到 GitHub repo（或 Zeabur 連接的 Git 來源）
2. 在 Zeabur dashboard 建立 Next.js service，指向 repo
3. 等待 zero-config build 完成
4. 取得預設 Zeabur 子網域 URL
5. （可選）綁定自訂網域（用 `zeabur-domain-url` skill 處理）

回退策略：B 階段內容皆靜態，無 DB 狀態。要回退只需在 Zeabur dashboard 切回上一次 deployment。

## Open Questions

（已於 2026-05-25 解決，列為決策紀錄）

- ~~主角名~~ → **老黃（黃進財）**，全部敘事與結局文字以此為準
- ~~生圖工具~~ → **gpt-image-2 via OpenAI 官方端點**；備援為 AI Hub Gemini 3 Pro Image
- ~~環境音效 / BGM~~ → 採用，**全部使用 CC0 授權**素材（OpenGameArt CC0 Music 主 BGM、Freesound CC0 標籤環境音）；時間有餘才加入
