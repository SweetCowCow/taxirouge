// 結局文字池（task 4.2）。三種結局各 3 段；每局隨機抽一段。

import type { EndingType } from "./types";

export const ENDING_TEXTS: Record<EndingType, string[]> = {
  cleared: [
    "天快亮了。你把計程錶按掉，車子停在自家樓下。後座沒人，今晚的客人都送到了。你抽出一根菸，沒點燃。",
    "車子駛回車行的路上，廣播裡傳來 ICRT 的 jazz。你看見遠處的天空轉成牛奶藍，原來夜晚也會結束。",
    "結算今晚的車資。後座有人不知何時放下一張舊舊的千元鈔，沒留名字。你沒問，把錢摺好放進胸前口袋。",
  ],
  breakdown: [
    "油錶見底。引擎熄火在山道彎口，遠處有不知名的霧。你打開車門想下去看看，但門外沒有風。",
    "汽油剩最後一滴的時候，你聽見後座有人輕輕說：「下車吧。」你回頭，沒人。車子靜悄悄地滑進路邊。",
    "他們找到你的車是兩個禮拜後的事了。油箱裡沒有油，行車紀錄器裡只有六個小時的雨聲。",
  ],
  vanished: [
    "你看著後照鏡。鏡裡的人在笑，但你沒有在笑。然後鏡裡的人開始對你說話。",
    "回家路上你發現自己一直繞著同一個圓環。第三圈的時候，你已經想不起自己為什麼要開車。",
    "你停在天橋下抽菸。抬頭看，天橋上有人。他從天橋上向你揮手。你也揮了。但你的手沒有動。",
  ],
};

export function pickEndingText(type: EndingType, rand: () => number = Math.random): string {
  const pool = ENDING_TEXTS[type];
  return pool[Math.floor(rand() * pool.length)] ?? "";
}
