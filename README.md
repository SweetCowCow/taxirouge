# taxirouge — 台灣怪奇夜行錄

> 一名台北中年計程車司機，老黃（黃進財），開夜班。
> 23:00 到 05:00 之間，會載到不該載的客人。

Rogue-like 卡牌敘事網頁遊戲。場景設定於現代台北的午夜街道，融合都會社會派氛圍與本土民俗怪談。

## ⚠️ 內容提醒

- 全文使用**正體中文（台灣用語）**
- 含**超自然元素**、**死亡描寫**與**低度暴力**
- 主題偏向都會孤獨、人性與台北夜間勞動現場的觀察
- 非娛樂向喜劇，氣氛接近社會派怪談

## 技術棧

- Next.js 16（App Router）+ React 19 + TypeScript
- Tailwind CSS v4（design tokens）
- 本機存檔：IndexedDB（無後端 DB）
- 部署：Zeabur（zero-config Next.js）

## 開發

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # 生產建置
```

需要的環境變數請參考 `.env.local.example`。

## 授權

- **程式碼**：MIT（見 `LICENSE`）
- **遊戲文本與美術**：作者保留，未經同意請勿商用
- **第三方素材**：
  - BGM／音效：採用 CC0 授權素材（[OpenGameArt CC0](https://opengameart.org/content/cc0-music-0)、[Freesound CC0](https://freesound.org/) 標籤）— 即便 CC0 不要求，仍會於 `docs/credits.md` 列出來源

## 開發狀態

🚧 **MVP 階段 — 朋友試玩版**。預計 1.5-2 週完成可玩 demo，之後再評估是否進入 C 階段（資料管線 + 內容審核 + 雲端 LLM）。

## 致謝

- 視覺語言參考：Persona 5（介面節奏）、Yakuza 系列（夜景氛圍）
