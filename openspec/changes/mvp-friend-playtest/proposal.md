## Why

「台灣怪奇夜行錄」是一個結合台灣開放資料、卡牌肉鴿與敘事說書的休閒網頁遊戲（詳見根目錄 `台灣怪奇夜行錄_設計文件.md`）。設計文件已完成完整 v1 規劃，但 1-2 週 side project 時程內無法涵蓋全部範圍。

本次變更鎖定 **B 階段（朋友試玩版）**：先建立「氛圍 + 敘事 + 一局完整體驗」的最小可玩切片，作為朋友試玩與設計驗證的版本。C 階段（資料管線、審核後台、雲端帳號、LLM 即時生成）將在 B 完成後另起變更。

優先做 B 是因為：在投入資料管線與 LLM 成本之前，必須先確認核心玩法（雙軸資源 × 卡牌戰鬥 × 怪談敘事）的氛圍與節奏真的吸引人。

## What Changes

- 建立 Next.js (App Router) 單一 repo 骨架，部署目標為 Zeabur
- 實作卡牌戰鬥系統：抽牌、出牌、神識消耗、3 種敵人行為樹、回合結算
- 實作雙軸資源系統：油錶（100）與精神（50），歸零分別觸發「失蹤」與「瘋了」兩種結局
- 實作單局循環：23:00 發車 → 5-6 個節點 → 王戰 → 結局，全程顯示時間軸
- 提供 4 系卡牌共 18 張（車技 / 行頭 / 路況 / 話術 各 4-5 張），含 AI 生圖場景縮圖
- 撰寫 5-7 個精品手寫敘事事件 + 2 個王戰原型 + 多段失敗結局文字
- 提供「車行紀事」基礎圖鑑，收藏每次跑完的結局文字
- 視覺風格：Persona 5 為骨（UI 動感 / 銳利配色）+ Yakuza 為皮（夜景濾鏡 / 寫實質感），卡牌走場景縮圖風格（AI 生圖：nanobanana2 / gpt-image-2）
- 存檔走 IndexedDB（本地存檔，每個節點結束自動存）
- 預留 LLM SDK wrapper（OpenAI 相容介面，目標連 Zeabur AI Hub），但 B 階段不真正呼叫；事件內容全部寫成 TypeScript 常數
- 部署到 Zeabur，丟給朋友試玩並收回饋

## Non-Goals

以下範圍**明確不在本次變更內**，全部延後到 C 階段或之後：

- 帳號登入、雲端存檔、Auth 機制（NextAuth / OAuth / magic link 等）
- 任何後端資料庫（Zeabur Postgres / Supabase 等）
- LLM 即時呼叫、Zeabur AI Hub 實際串接、批次生成管線
- 政府採購標案 / data.gov.tw / Twinkle Hub 等外部資料源接入
- 三層架構（篩選器 / 模板配對 / LLM 潤色）
- 人工審核後台、敏感詞檢查、真名偵測規則
- 每日怪奇日報首頁、地圖覆蓋（全台 368 鄉鎮）
- 多角色、組牌介面、PvP、排行榜、社群功能
- 戰鬥平衡精算（採「夠玩就好」的粗略平衡，輸了笑笑就好）
- 蓄力型、糾纏型敵人（先做衝撞 / 詛咒 / 對話 3 種）
- 卡牌升級、季節卡、事件卡（只做主流卡牌）
- 音效與 BGM（時間有餘可加，非必要）

被討論過但拒絕的方向：
- 純前端 SPA（已否決：C 階段需要 API routes 與審核後台，直接用 Next.js 一個 repo 避免之後重寫）
- 部署 Vercel（已否決：使用者明確指定 Zeabur）
- 直接接 Anthropic API（已否決：使用者指定走 Zeabur AI Hub，因此採 OpenAI 相容 SDK）
- MVP 就接 Twinkle Hub（已否決：B 階段內容全手寫，避免管線複雜度與審核負擔）

## Capabilities

### New Capabilities

- `app-shell`: Next.js (App Router) 應用骨架、路由結構、Tailwind 設定、IndexedDB 存檔層、Zeabur 部署設定，以及預留的 LLM SDK wrapper（OpenAI 相容介面，B 階段不啟用）
- `card-combat`: 卡牌戰鬥系統 — 抽牌 / 出牌 / 神識能量 / 回合結算 / 敵人行為樹（3 種類型）/ 戰鬥結束判定
- `run-flow`: 單局遊戲流程 — 從 23:00 發車到結局的整體循環，包含節點地圖（5-6 個節點 + 1 個王戰）、時間軸、節點類型（怪客 / 惡客 / 熟客 / 加油站 / 王戰）、雙軸資源（油錶 + 精神）與兩種失敗結局
- `narrative-codex`: 敘事事件系統 — 事件結構、選項分支、結局文字生成（從預寫池抽取）、車行紀事圖鑑（收藏每次結局文字）、玩家舉報按鈕
- `card-catalog`: 卡牌目錄與內容 — 4 系共 18 張卡牌的定義（效果 / 數值 / flavor text）、AI 生圖 Prompt 風格手冊、生圖資產管理
- `visual-system`: 視覺設計系統 — P5+Yakuza 風格的 design tokens（顏色 / 字體 / 間距 / 動效）、UI 元件樣式、卡牌呈現樣式、時間軸與節點地圖視覺

### Modified Capabilities

(none — 這是專案首次變更，沒有既存能力)

## Impact

- Affected specs:
  - 新增：`openspec/specs/app-shell/spec.md`
  - 新增：`openspec/specs/card-combat/spec.md`
  - 新增：`openspec/specs/run-flow/spec.md`
  - 新增：`openspec/specs/narrative-codex/spec.md`
  - 新增：`openspec/specs/card-catalog/spec.md`
  - 新增：`openspec/specs/visual-system/spec.md`
- Affected code:
  - New:
    - `package.json`
    - `next.config.ts`
    - `tsconfig.json`
    - `tailwind.config.ts`
    - `postcss.config.js`
    - `.gitignore`
    - `app/layout.tsx`
    - `app/page.tsx`（首頁 / 開新局入口）
    - `app/play/page.tsx`（單局主畫面）
    - `app/codex/page.tsx`（車行紀事）
    - `src/lib/storage/indexed-db.ts`（IndexedDB 存檔層）
    - `src/lib/storage/save-state.ts`（存檔結構與序列化）
    - `src/lib/llm/client.ts`（OpenAI 相容 SDK wrapper，B 階段不呼叫）
    - `src/lib/combat/engine.ts`（戰鬥核心引擎）
    - `src/lib/combat/enemy-ai.ts`（3 種敵人行為樹）
    - `src/lib/combat/resources.ts`（雙軸資源計算）
    - `src/lib/run/state-machine.ts`（單局狀態機）
    - `src/lib/run/map-generator.ts`（節點地圖產生）
    - `src/lib/run/time-clock.ts`（23:00→05:00 時間軸）
    - `src/lib/narrative/event-runner.ts`（敘事事件執行）
    - `src/lib/narrative/ending-generator.ts`（結局文字選取）
    - `src/lib/cards/definitions.ts`（18 張卡牌定義）
    - `src/lib/cards/schools.ts`（四系定義）
    - `src/components/combat/CombatScreen.tsx`
    - `src/components/combat/CardHand.tsx`
    - `src/components/combat/EnemyDisplay.tsx`
    - `src/components/combat/ResourceBars.tsx`
    - `src/components/map/NodeMap.tsx`
    - `src/components/map/TimeAxis.tsx`
    - `src/components/narrative/EventScreen.tsx`
    - `src/components/narrative/ChoicePanel.tsx`
    - `src/components/codex/CodexList.tsx`
    - `src/components/ui/ReportButton.tsx`（玩家舉報按鈕）
    - `src/content/events/event-001.ts` ~ `event-007.ts`（5-7 個手寫敘事事件）
    - `src/content/bosses/boss-001.ts`、`boss-002.ts`（2 個王戰）
    - `src/content/endings/breakdown.ts`、`vanished.ts`（兩種失敗結局文字池）
    - `src/content/cards/`（18 張卡牌資料檔）
    - `public/cards/`（18 張卡牌 AI 生圖資產）
    - `src/styles/design-tokens.css`（P5+Yakuza 視覺 tokens）
    - `docs/card-prompt-style-guide.md`（卡牌 AI 生圖風格手冊）
    - `zeabur.json` 或 `Dockerfile`（Zeabur 部署設定）
  - Modified:
    - `CLAUDE.md`（之後 archive 時更新進度說明）
  - Removed: (none)
