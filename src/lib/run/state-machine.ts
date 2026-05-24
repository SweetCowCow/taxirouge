// Pure run-flow reducer. (state, event) => newState

import {
  CombatOutcome,
  EndingType,
  FUEL_MAX,
  MIND_MAX,
  NODE_TIME_STEP_MIN,
  ResourceDelta,
  RunEvent,
  RunModel,
  RunNode,
  RunResources,
  START_TIME,
} from "./types";

// ---- helpers ----

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function applyDelta(resources: RunResources, delta: ResourceDelta): RunResources {
  return {
    ...resources,
    fuel: clamp(resources.fuel + (delta.fuelDelta ?? 0), 0, resources.fuelMax),
    mind: clamp(resources.mind + (delta.mindDelta ?? 0), 0, resources.mindMax),
  };
}

function advanceTime(current: string, minutesStep: number = NODE_TIME_STEP_MIN): string {
  const [hh, mm] = current.split(":").map(Number);
  let total = hh * 60 + mm + minutesStep;
  total = total % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function endingFromResources(resources: RunResources): EndingType | null {
  if (resources.fuel <= 0) return "breakdown";
  if (resources.mind <= 0) return "vanished";
  return null;
}

function endingFromCombat(outcome: CombatOutcome): EndingType | null {
  if (outcome === "breakdown") return "breakdown";
  if (outcome === "vanished") return "vanished";
  return null; // victory / subdued 沒有立即結局
}

function isBossNode(nodes: RunNode[], index: number): boolean {
  return nodes[index]?.type === "boss";
}

// ---- factory ----

export function makeInitialRun(runId: string, nodes: RunNode[], now: number = Date.now()): RunModel {
  return {
    runId,
    startedAt: now,
    phase: "idle",
    currentTime: START_TIME,
    currentNodeIndex: 0,
    nodes,
    resources: { fuel: FUEL_MAX, fuelMax: FUEL_MAX, mind: MIND_MAX, mindMax: MIND_MAX },
    endingType: null,
    earnedCardIds: [],
  };
}

// ---- main reducer ----

export function runReducer(state: RunModel, event: RunEvent): RunModel {
  if (state.phase === "ending") return state;

  switch (event.type) {
    case "start-run": {
      return makeInitialRun(event.runId ?? state.runId, event.nodes, event.startedAt ?? state.startedAt);
    }

    case "depart": {
      if (state.phase !== "idle" && state.phase !== "at-node") return state;
      return { ...state, phase: "driving" };
    }

    case "arrive-node": {
      if (state.phase !== "driving") return state;
      return { ...state, phase: "at-node" };
    }

    case "enter-node": {
      if (state.phase !== "at-node") return state;
      const node = state.nodes[state.currentNodeIndex];
      if (!node) return state;
      switch (node.type) {
        case "passenger-narrative":
          return { ...state, phase: "in-event" };
        case "passenger-combat":
        case "boss":
          return { ...state, phase: "in-combat" };
        case "passenger-mixed":
          return { ...state, phase: "in-event" }; // 通常先敘事 → 切戰鬥
        case "gas-station":
          // 加油站直接結算，refill 8/10... 這裡先給定值 30
          return {
            ...state,
            phase: "node-result",
            resources: applyDelta(state.resources, { fuelDelta: 30 }),
          };
      }
    }

    case "resolve-event": {
      if (state.phase !== "in-event") return state;
      const nextResources = event.delta ? applyDelta(state.resources, event.delta) : state.resources;
      const earlyEnding = endingFromResources(nextResources);
      if (earlyEnding) {
        return { ...state, resources: nextResources, phase: "ending", endingType: earlyEnding };
      }
      if (event.outcome === "to-combat") {
        return { ...state, resources: nextResources, phase: "in-combat" };
      }
      return {
        ...state,
        resources: nextResources,
        pendingRewardCardId: event.rewardCardId,
        earnedCardIds: event.rewardCardId
          ? [...state.earnedCardIds, event.rewardCardId]
          : state.earnedCardIds,
        phase: "node-result",
      };
    }

    case "resolve-combat": {
      if (state.phase !== "in-combat") return state;
      const ending = endingFromCombat(event.outcome);
      if (ending) {
        return { ...state, phase: "ending", endingType: ending };
      }
      // victory or subdued
      return {
        ...state,
        phase: "node-result",
        pendingRewardCardId: event.earnedCardId,
        earnedCardIds: event.earnedCardId
          ? [...state.earnedCardIds, event.earnedCardId]
          : state.earnedCardIds,
      };
    }

    case "continue": {
      if (state.phase !== "node-result") return state;
      const wasBoss = isBossNode(state.nodes, state.currentNodeIndex);
      if (wasBoss) {
        return { ...state, phase: "ending", endingType: "cleared" };
      }
      // 推進時間 + 下一節點
      const nextIndex = state.currentNodeIndex + 1;
      if (nextIndex >= state.nodes.length) {
        return { ...state, phase: "ending", endingType: "cleared" };
      }
      return {
        ...state,
        currentNodeIndex: nextIndex,
        currentTime: advanceTime(state.currentTime),
        pendingRewardCardId: undefined,
        phase: "driving",
      };
    }
  }
}
