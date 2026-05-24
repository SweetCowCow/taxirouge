// 事件池。MVP 版本：6 個 passenger-narrative + 2 個 boss-node event。
// 每事件至少 1 個 combat-bearing（to-combat）或 resource-modifying（delta）選項。

import type { ResourceDelta } from "@/lib/run/types";

export type EventChoice = {
  label: string;
  outcome: "ok" | "to-combat";
  delta?: ResourceDelta;
  rewardCardId?: string;
  resolutionText?: string;
};

export type NarrativeEvent = {
  id: string;
  kind: "narrative" | "boss";
  title: string;
  opening: string;
  choices: EventChoice[];
};

export const NARRATIVE_EVENTS: NarrativeEvent[] = [
  {
    id: "old-lady-temple",
    kind: "narrative",
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
    kind: "narrative",
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
    kind: "narrative",
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
  {
    id: "highway-payphone",
    kind: "narrative",
    title: "高架下的公共電話",
    opening:
      "重慶北路高架橋下，一支早該停話的公共電話正在響。你停車，下去，話筒被誰留在電話台上，貼著一張小小的便利貼：「請接。」",
    choices: [
      {
        label: "接起來",
        outcome: "ok",
        delta: { mindDelta: -3 },
        rewardCardId: "g-talisman",
        resolutionText: "對方沒說話，只哼了一段你媽以前哼給你聽的調子。等你回神，駕駛座上多了一個香火袋。",
      },
      {
        label: "掛回去就走",
        outcome: "ok",
        delta: { fuelDelta: -1 },
        resolutionText: "你把話筒放回去。電話又響了一次，比剛才急。你已經發動引擎了。",
      },
      {
        label: "等下一響",
        outcome: "to-combat",
        resolutionText: "電話響了第三次。同時後車門被打開了。你沒看到誰，但車子重了一點。",
      },
    ],
  },
  {
    id: "elderly-passenger-address",
    kind: "narrative",
    title: "客人說了一個你沒聽過的地址",
    opening:
      "後座的老先生說：「萬華區，福地路 39 巷 13 號。」福地路在哪？導航沒這條街。但他講得很慢，像怕你聽錯。",
    choices: [
      {
        label: "照他指示開",
        outcome: "to-combat",
        resolutionText: "你按他指的方向轉了三個彎。轉到第四個的時候，路燈全暗了，後座的呼吸聲不見了。",
      },
      {
        label: "說沒聽過這條路，請他下車",
        outcome: "ok",
        delta: { fuelDelta: -3, mindDelta: -2 },
        resolutionText: "他沉默了幾秒，然後說「沒關係，我下車」。他下車的時候你看了後照鏡，後座沒人。",
      },
    ],
  },
  {
    id: "rain-couple",
    kind: "narrative",
    title: "雨夜要過夜的情侶",
    opening:
      "敦化南路。一對年輕情侶縮在騎樓底下，全身濕透。他們攔下你，問能不能載他們到淡水。你看看油錶，看看天色。",
    choices: [
      {
        label: "答應載到淡水",
        outcome: "ok",
        delta: { fuelDelta: -8, mindDelta: 4 },
        resolutionText: "他們在後座聊著，聊著就睡著了。淡水到的時候你輕聲叫醒他們，男生塞了五百多的小費給你。",
      },
      {
        label: "拒絕，太遠了",
        outcome: "ok",
        resolutionText: "你說對不起。他們點點頭走進雨裡，沒有回頭。",
      },
    ],
  },
];

export const BOSS_EVENTS: NarrativeEvent[] = [
  {
    id: "boss-last-call-3am",
    kind: "boss",
    title: "凌晨四點半，最後一單",
    opening:
      "派車單跳出來。地址是你父親三十年前住過的舊家，那棟早就拆了。客人姓黃，跟你同姓。「老黃，再載我最後一趟好不好？」對講機那頭，是你的聲音。",
    choices: [
      {
        label: "接這單，去看看",
        outcome: "to-combat",
        resolutionText: "你按下接單。引擎發動。後照鏡裡，後座已經坐了一個人。",
      },
    ],
  },
  {
    id: "boss-mirror-self",
    kind: "boss",
    title: "後照鏡裡的你",
    opening:
      "中山北路一段。你停在紅燈前，後照鏡裡看見自己。但鏡裡的你已經在看你了，而且在笑。你沒笑。",
    choices: [
      {
        label: "對鏡裡的自己說話",
        outcome: "to-combat",
        resolutionText: "你張開嘴。鏡裡的人比你早張開了一秒。「老黃，今晚換我開吧。」",
      },
    ],
  },
];

export function pickRandomNarrativeEvent(rand: () => number = Math.random): NarrativeEvent {
  return NARRATIVE_EVENTS[Math.floor(rand() * NARRATIVE_EVENTS.length)]!;
}

export function pickRandomBossEvent(rand: () => number = Math.random): NarrativeEvent {
  return BOSS_EVENTS[Math.floor(rand() * BOSS_EVENTS.length)]!;
}

export function findEventById(id: string): NarrativeEvent | undefined {
  return [...NARRATIVE_EVENTS, ...BOSS_EVENTS].find((e) => e.id === id);
}
