# Card Prompt Style Guide v0.1

> 為「台灣怪奇夜行錄（taxirouge）」的 18 張卡牌統一生圖風格。
> 所有卡牌都套同一份固定 suffix，只變更主體描述（subject），確保整套視覺一致。

## 1. Chosen image generator

**gpt-image-2 via OpenAI 官方端點**（B 階段）。備援：AI Hub Gemini 3 Pro Image（nano banana 2）。

呼叫參數：`size=1024x768` (4:3)、`quality=hd`、`background=transparent`（如支援）。

## 2. Fixed prompt suffix

每張卡的 prompt 結尾固定附加以下字串：

```
scene vignette of a taipei taxi driver at night,
photographic realism, slight grain, dramatic chiaroscuro,
sodium-vapor streetlights, neon signs in Traditional Chinese,
shallow depth of field, 4:3 cinematic crop,
strong red & deep blue accents on dark background,
mood: late-night urban gothic, faintly supernatural,
no on-card UI, no text, no captions, no logos.
```

## 3. Color palette keywords

- `deep midnight blue (#07080c)` — 背景主色
- `taipei sodium amber (#f0b429)` — 路燈
- `persona-5 blood red (#c8102e)` — 危險點綴
- `cold neon pink (#ff4d8d)` — 夜店、招牌
- `pavement gray (#6f7a8c)` — 中性面
- `talisman gold (#b88746)` — 護身、廟口

整張圖控制在 4-5 個主要色調內，避免雜色。

## 4. Composition keywords

- `eye-level shot` 或 `slight low-angle` — 計程車駕駛視角
- `subject at center-left or center-right`，留 negative space 給 UI
- 主體佔畫面 40-60%
- 背景模糊處理（bokeh），保留可辨識的台北元素（霓虹、機車、騎樓）
- 雨夜為主，偶爾濕路反光

## 5. Negative prompt（一律附加）

```
no anime style, no chibi, no kawaii,
no western fantasy, no high-fantasy armor,
no modern graphic design, no flat illustration,
no text overlays, no watermark,
no oversaturated colors, no neon overload,
no clean studio lighting, no perfect symmetry,
avoid generic Asian aesthetic — must read as Taipei specifically.
```

## 6. Reference card examples

### 6.1 `v-brake` 急踩煞車・鎖喉式

**Subject prompt:**
```
through-the-windshield POV from a taxi at night, sudden brake light reflection on wet asphalt,
silhouette of a pedestrian frozen mid-step in front of the bumper,
motion blur on the rear-view mirror, rain droplets on glass
```

### 6.2 `d-pray` 代念阿彌陀・送行式

**Subject prompt:**
```
interior rear-seat view of a taxi at 3am, an empty back seat with a single white envelope
and a smoldering incense stick on the upholstery,
driver's right hand visible holding a paper amulet,
soft amber dashboard light, deep blue night outside the side window
```

### 6.3 `g-amulet` 媽祖香火・定神咒

**Subject prompt:**
```
close-up of a Mazu temple incense bag hanging from a taxi rear-view mirror,
fine cinematic grain, blurred neon signage behind in Traditional Chinese reading "夜",
rain streaks on the windshield, warm gold glow against cold blue rain
```

## 7. Generation record

每張生成的圖必須記錄：
- `cardId`
- `model`（gpt-image-2 / gemini-3-pro-image）
- `styleGuideVersion`（目前 0.1）
- `seed`（若工具支援）
- `subjectPrompt`（不含 suffix）
- `negativePrompt`
- `timestamp`

記錄存於 `docs/card-gen-records.json`（task 5.3 完成時建立）。

## 8. 風格定調圖（待產）

Week 1 內先用上述 3 張 reference 各產 1 張，3 張並排審視後決定 styleGuide v0.2 是否需要微調。**通過 v0.2 後才能批次產其餘 15 張**。
