<!--
任務排序對應 design.md 規劃的兩週時程。每項任務描述包含「完成後可觀察到的行為」
與「驗收方式」。對應 spec 的 Requirement 名稱保留英文以利 analyzer 交叉檢查。
-->

## 1. 專案骨架（Day 1-2）

- [x] 1.1 建立 Next.js App Skeleton（App Router + TypeScript + Tailwind + React 19）：完成後 `pnpm dev` 啟動 `/`、`/play`、`/codex` 三條路由皆能載入無 console error；驗收：手動開啟三條路由確認且 `pnpm build` 通過。（設計決策：採用 Next.js (App Router) 單一 repo，部署 Zeabur）
- [x] 1.2 實作 Local Save Persistence via IndexedDB：建立 `src/lib/storage/indexed-db.ts` 與 `save-state.ts`，匯出 `loadRun()`、`saveRun(state)`、`listCodex()`、`appendCodex(entry)` 等 high-level API；驗收：在瀏覽器 console 手動呼叫 API 確認讀寫成功、DevTools 看得到 IndexedDB 資料庫。（設計決策：IndexedDB 作為本地存檔，包一層 wrapper）
- [x] 1.3 實作 LLM Client Wrapper Reserved for Future Use：建立 `src/lib/llm/client.ts`，匯出 `llmComplete()` 函數，從 env 讀取 base URL / API key / model，呼叫時拋出 `NotEnabledError`；驗收：撰寫一個 smoke test 確認呼叫立刻 throw，且不發出任何網路請求。（設計決策：LLM SDK 走 OpenAI 相容介面，B 階段不啟用）
- [ ] 1.4 設定 Zeabur Deployment Compatibility：確認 `pnpm build` 通過且不寫 Dockerfile；驗收：本地完整跑一次 build 無錯誤，並完成首次 Zeabur 部署使首頁可在預設 URL 開啟。（設計決策：部署到 Zeabur 不寫 Dockerfile）
- [x] 1.5 建立 Centralized Design Tokens：在 `src/styles/design-tokens.css` 與 `tailwind.config.ts` 定義 P5+Yakuza 風格的色票、字體、間距、陰影、圓角、卡牌 fallback；驗收：任意 component 取得這些 token 並渲染正確顏色。（設計決策：視覺架構：Design Tokens + Tailwind + 手刻關鍵動效）

## 2. 戰鬥系統核心（Day 3-4）

- [ ] 2.1 實作 Pure-Function Combat Reducer：在 `src/lib/combat/engine.ts` 寫 `combatReducer(state, action) => newState`，純函數、不變動入參；驗收：撰寫至少 3 個單元測試覆蓋抽牌、出牌扣神識、敵人反擊，全部通過。（設計決策：戰鬥引擎用純函數狀態機，UI 與邏輯解耦）
- [ ] 2.2 實作 Turn-Based Combat Loop：抽 5 牌、神識 3、出牌扣費、結束回合敵人反擊、回合開始重抽；驗收：在 `/play` 進入測試節點可玩完整一場戰鬥
- [ ] 2.3 實作 Three Enemy Behavior Patterns（衝撞 / 詛咒 / 對話）的行為樹資料與引擎處理；驗收：對戰三種敵人各跑一場觀察行為符合 spec
- [ ] 2.4 實作 Combat Termination Conditions：敵 HP 歸零→勝利、油錶歸零→失蹤、精神歸零→瘋了、話術收服→特殊勝利；驗收：手動觸發四種情境各一次，結束畫面與後續狀態正確
- [ ] 2.5 實作 Combat Reward Selection：勝利後跳出二選一卡牌＋跳過選項，選擇後加入牌組並寫回 RunState；驗收：勝利一場後跳獎勵介面，選一張後在卡組畫面看到新卡

## 3. 單局流程（Day 5）

- [ ] 3.1 實作 Single Run Lifecycle 狀態機於 `src/lib/run/state-machine.ts`：建立 idle / driving / at-node / in-event / in-combat / node-result / ending 狀態與轉移；驗收：撰寫一個從 idle 到 ending 的整局轉移測試通過。（設計決策：單局採顯式狀態機（XState-style 但手刻））
- [ ] 3.2 實作 Node Map with Mixed Node Types 產生器：每局產 5-6 個中間節點＋1 個王戰，至少 1 個加油站、2 個戰鬥、2 個敘事；驗收：跑 10 次產生器確認所有產出都符合分布規則
- [ ] 3.3 實作 Time Axis Display：右上角顯示當前時間 23:00 → 05:00，每完成節點推進 30-60 分；驗收：跑完一局觀察時間軸推進正確且在戰鬥畫面也可見
- [ ] 3.4 實作 Dual Resources (Fuel and Mind)：油錶 100、精神 50，含 clamping 與歸零觸發；驗收：撰寫單元測試覆蓋邊界 clamping（過量減為 0、過量補滿為 max）並通過
- [ ] 3.5 實作 Resumable Run State：每個節點完成後自動存檔，重整瀏覽器從下一個節點起頭恢復；驗收：手動測試「完成節點→重整→確認位置正確」與「節點中途關掉→重整→從該節點起頭重開」兩個情境

## 4. 第一個可玩切片（Day 6-7）

- [ ] 4.1 串接 `/play` 主畫面：呈現節點地圖、進入節點、戰鬥與事件畫面切換、結束畫面；驗收：從首頁開新局可走完一條最短路徑（含 1 戰鬥 1 事件 1 王戰）並看到結局文字
- [ ] 4.2 實作 Ending Text Generation from Predefined Pool：依結局類型（cleared/breakdown/vanished）從對應文字池抽一段，寫入 codex 條目；驗收：分別觸發三種結局各一次，codex 出現對應條目
- [ ] 4.3 實作 Codex (車行紀事) View 於 `/codex`：反時序列出 timestamp / 結局類型 / 完整文字，空狀態顯示 placeholder；驗收：未玩過時顯示 placeholder、玩過 3 局後依時序看到 3 條
- [ ] 4.4 加入 Player Report Button：每個事件結尾與結局畫面顯示按鈕，點擊後 `console.log` 結構化條目並回饋玩家「已收到」；驗收：點擊任一回報按鈕，DevTools 看到對應 log 與 UI 提示
- [ ] 4.5 達成「能從頭玩到尾」里程碑：從新局到任一結局可在 15-25 分鐘完整玩完，無 console error；驗收：使用者本人連續跑 2 場無 crash，至少各觸發 1 種勝利與 1 種失敗結局

## 5. 卡牌內容與視覺（Week 2 前段）

- [ ] 5.1 撰寫 Card Prompt Style Guide 於 `docs/card-prompt-style-guide.md`：含固定 prompt suffix、色票 keywords、構圖 keywords、negative prompt、選用工具（nanobanana2 或 gpt-image-2），並含 3 張 reference 範例的完整 prompt；驗收：依手冊產 3 張 reference 圖風格一致，肉眼可辨為同一系列。（設計決策：卡牌 AI 生圖：先建風格手冊再橫向複製）
- [ ] 5.2 完成 Four-School Card Catalog 的 18 張卡牌：車技 5、行頭 5、路況 4、話術 4，含 Card Definition Shape 所有欄位；資料寫成 TypeScript 模組匯出強型別物件；驗收：撰寫 build-time check 驗證計數分布、每張 id 唯一、所有欄位非空，check 通過。（設計決策：卡牌 4 系初版內容分配 + 內容資料寫 TypeScript 常數，不用 JSON）
- [ ] 5.3 產出 Card Illustration Asset Per Card 的 18 張場景縮圖至 `public/cards/`：套用 Card Prompt Style Guide；驗收：build-time check 驗證每張卡的 `artPath` 對應檔案存在
- [ ] 5.4 實作 Card Rendering with Scene-Vignette Illustration：卡牌呈現含插圖、雙名、費用、學派色帶；missing 時走 fallback 色塊；驗收：手動模擬一張 broken artPath，UI 看到 fallback 樣式
- [ ] 5.5 定義並套用 Predefined Starting Deck（12 張，含 4 系）：在新局初始化時載入；驗收：開新局後初始手牌/牌組組成等於 spec 定義
- [ ] 5.6 套用 Persona-5 + Yakuza Fusion Aesthetic 至首頁、play 畫面、戰鬥畫面、codex 畫面：暗背景為主、Persona 風銳利按鈕、Yakuza 風夜景濾鏡背景；驗收：使用者本人與一位朋友各看一遍，視覺一致且符合「都會夜怪談」氛圍
- [ ] 5.7 實作 Time-Axis Visual Component：時間越深視覺強調越重（色彩/透明度/動效），戰鬥畫面也可見；驗收：對比 23:00 與 02:00 兩個時刻的截圖明顯不同

## 6. 敘事內容與動效（Week 2 後段）

- [ ] 6.1 實作 Narrative Event Structure 的事件 runner：呈現 opening text 與 2-3 個選項、結算 outcome；驗收：跑一個測試事件四種 outcome 類型（資源變化、給卡、進戰鬥、直接下個節點）各一次符合預期
- [ ] 6.2 撰寫 Handwritten Event Pool：5-7 個精品 passenger-narrative 事件 + 2 個 boss-node 事件，每事件至少 1 個 combat-bearing 或 resource-modifying 選項；驗收：build-time check 計數通過、每事件至少手動跑過一次無錯誤
- [ ] 6.3 套用 Motion Treatment for Key Interactions（卡牌進手 / 出牌 / 節點切換 / 雙軸變化）以 Framer Motion 實作；驗收：四種動效各觸發一次有平滑過渡而非瞬間切換
- [ ] 6.4 文字打磨與一致性檢查：所有事件、結局、UI 微文案校稿符合「克制、留白、社會派怪談」語氣；驗收：使用者本人通讀全部文字一遍標記要改的點並改完

## 7. 部署與收尾（Day 14）

- [ ] 7.1 部署最新版本至 Zeabur 並取得對外可訪問 URL：確認 Next.js zero-config 部署成功；驗收：朋友從手機與桌機各打開一次可進入首頁並開新局
- [ ] 7.2 收集試玩回饋：將朋友試玩過程的回饋（視覺反應、卡牌氛圍、戰鬥節奏、敘事感受）記錄到 `docs/playtest-feedback.md`；驗收：至少 2 位朋友的回饋記錄成文，作為 C 階段規劃輸入
