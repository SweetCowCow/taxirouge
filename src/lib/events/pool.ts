// 事件池（task 6.2 會擴展）。B 階段先放 3 個敘事事件 + 1 個 boss 事件，
// 讓 task 4.1 的「走完一條最短路徑」可達。

import type { ResourceDelta } from "@/lib/run/types";

export type EventChoice = {
  label: string;
  /** outcome=ok 表示直接結算節點；to-combat 表示進戰鬥 */
  outcome: "ok" | "to-combat";
  delta?: ResourceDelta;
  rewardCardId?: string;
  /** 玩家看到的結算文字 */
  resolutionText?: string;
};

export type NarrativeEvent = {
  id: string;
  title: string;
  opening: string;
  choices: EventChoice[];
};

export const NARRATIVE_EVENTS: NarrativeEvent[] = [
  {
    id: "old-lady-temple",
    title: "廟口的老太太",
    opening:
      "凌晨一點，行天宮對面。老太太搬不動行李，揮手要你下車幫忙。你打開後車廂，行李袋很輕，輕得不像有衣服在裡面。",
    choices: [
      {
        label: "幫她搬上車",
        outcome: "ok",
        delta: { mindDelta: -3 },
        resolutionText: "她沒上車，向你鞠了個躬，往廟裡走進去。你關上後車廂時聞到了線香。",
      },
      {
        label: "假裝沒看到，繼續開",
        outcome: "ok",
        delta: { fuelDelta: -2 },
        resolutionText: "你猛踩油門。後照鏡裡她還在揮手，揮了很久。",
      },
    ],
  },
  {
    id: "drunk-late-night",
    title: "醉漢攔車",
    opening:
      "南京東路四段。一個男人喝得歪歪倒倒，站在路中央。他笑著對你比手勢——是計程車的手勢，但他的手裡握著別的東西。",
    choices: [
      {
        label: "停下來讓他上車",
        outcome: "to-combat",
        resolutionText: "他坐進後座。你才剛掛入排檔，他就湊過來，呼吸臭得不像酒。",
      },
      {
        label: "繞過去不理",
        outcome: "ok",
        delta: { mindDelta: -2 },
        resolutionText: "你變道閃過。他朝車窗砸了一拳，但你聽見的不是手骨的聲音。",
      },
    ],
  },
  {
    id: "convenience-store",
    title: "便利商店補給",
    opening:
      "信義區某 7-11 後巷。你下車買關東煮，回到車旁看見一個小女孩站在駕駛座旁邊，她看著儀表板，沒看你。",
    choices: [
      {
        label: "上車前先問她",
        outcome: "ok",
        delta: { mindDelta: -1, fuelDelta: 4 },
        resolutionText: "「叔叔，我也想夜班。」你笑了一下，她也笑了。你回到車上的時候，她已經不在了。",
      },
      {
        label: "直接上車開走",
        outcome: "ok",
        delta: { mindDelta: -4 },
        resolutionText: "你發動引擎。她的影子在後照鏡裡停了很久才散去。",
      },
    ],
  },
];

export function pickRandomNarrativeEvent(rand: () => number = Math.random): NarrativeEvent {
  return NARRATIVE_EVENTS[Math.floor(rand() * NARRATIVE_EVENTS.length)]!;
}
