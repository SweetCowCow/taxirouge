import { describe, expect, it } from "vitest";

import { makeInitialRun, runReducer } from "./state-machine";
import type { RunNode } from "./types";

const SAMPLE_NODES: RunNode[] = [
  { index: 0, type: "passenger-narrative" },
  { index: 1, type: "passenger-combat", enemyKey: "silentPassenger" },
  { index: 2, type: "gas-station" },
  { index: 3, type: "passenger-mixed" },
  { index: 4, type: "passenger-combat", enemyKey: "whisperingChild" },
  { index: 5, type: "boss", enemyKey: "drunkSalaryman" },
];

describe("runReducer — full lifecycle from idle to ending (cleared)", () => {
  it("walks idle → ... → ending=cleared after boss clear", () => {
    let state = makeInitialRun("test-run", SAMPLE_NODES, 0);
    expect(state.phase).toBe("idle");
    expect(state.currentTime).toBe("23:00");

    // node 0 (narrative)
    state = runReducer(state, { type: "depart" });
    expect(state.phase).toBe("driving");
    state = runReducer(state, { type: "arrive-node" });
    expect(state.phase).toBe("at-node");
    state = runReducer(state, { type: "enter-node" });
    expect(state.phase).toBe("in-event");
    state = runReducer(state, { type: "resolve-event", outcome: "ok", delta: { mindDelta: -3 } });
    expect(state.phase).toBe("node-result");
    expect(state.resources.mind).toBe(47);
    state = runReducer(state, { type: "continue" });
    expect(state.phase).toBe("driving");
    expect(state.currentNodeIndex).toBe(1);
    expect(state.currentTime).toBe("23:30");

    // node 1 (combat)
    state = runReducer(state, { type: "arrive-node" });
    state = runReducer(state, { type: "enter-node" });
    expect(state.phase).toBe("in-combat");
    state = runReducer(state, { type: "resolve-combat", outcome: "victory", earnedCardId: "v-nitro" });
    expect(state.phase).toBe("node-result");
    expect(state.earnedCardIds).toContain("v-nitro");
    state = runReducer(state, { type: "continue" });
    expect(state.currentNodeIndex).toBe(2);
    expect(state.currentTime).toBe("00:00");

    // node 2 (gas-station)
    state = runReducer(state, { type: "arrive-node" });
    state = runReducer(state, { type: "enter-node" });
    expect(state.phase).toBe("node-result");
    expect(state.resources.fuel).toBe(100); // refilled (already 100, clamped)
    state = runReducer(state, { type: "continue" });
    expect(state.currentNodeIndex).toBe(3);

    // node 3 (mixed → event → combat)
    state = runReducer(state, { type: "arrive-node" });
    state = runReducer(state, { type: "enter-node" });
    expect(state.phase).toBe("in-event");
    state = runReducer(state, { type: "resolve-event", outcome: "to-combat" });
    expect(state.phase).toBe("in-combat");
    state = runReducer(state, { type: "resolve-combat", outcome: "subdued" });
    expect(state.phase).toBe("node-result");
    state = runReducer(state, { type: "continue" });
    expect(state.currentNodeIndex).toBe(4);

    // node 4 (combat)
    state = runReducer(state, { type: "arrive-node" });
    state = runReducer(state, { type: "enter-node" });
    state = runReducer(state, { type: "resolve-combat", outcome: "victory" });
    state = runReducer(state, { type: "continue" });
    expect(state.currentNodeIndex).toBe(5);

    // node 5 (boss)
    state = runReducer(state, { type: "arrive-node" });
    state = runReducer(state, { type: "enter-node" });
    expect(state.phase).toBe("in-combat");
    state = runReducer(state, { type: "resolve-combat", outcome: "victory" });
    expect(state.phase).toBe("node-result");
    state = runReducer(state, { type: "continue" });
    expect(state.phase).toBe("ending");
    expect(state.endingType).toBe("cleared");
  });
});

describe("runReducer — ending paths", () => {
  it("ends with breakdown when fuel reaches 0 mid-event", () => {
    let state = makeInitialRun("r", SAMPLE_NODES, 0);
    state = runReducer(state, { type: "depart" });
    state = runReducer(state, { type: "arrive-node" });
    state = runReducer(state, { type: "enter-node" });
    state = runReducer(state, { type: "resolve-event", outcome: "ok", delta: { fuelDelta: -200 } });

    expect(state.phase).toBe("ending");
    expect(state.endingType).toBe("breakdown");
    expect(state.resources.fuel).toBe(0);
  });

  it("ends with vanished when mind reaches 0 via combat", () => {
    let state = makeInitialRun("r", SAMPLE_NODES, 0);
    state = runReducer(state, { type: "depart" });
    state = runReducer(state, { type: "arrive-node" });
    state = runReducer(state, { type: "enter-node" });
    // 跳到 in-combat
    state = runReducer(state, { type: "resolve-event", outcome: "to-combat" });
    expect(state.phase).toBe("in-combat");
    state = runReducer(state, { type: "resolve-combat", outcome: "vanished" });

    expect(state.phase).toBe("ending");
    expect(state.endingType).toBe("vanished");
  });

  it("does not mutate input state (purity)", () => {
    const state = makeInitialRun("r", SAMPLE_NODES, 0);
    const snapshot = JSON.stringify(state);
    runReducer(state, { type: "depart" });
    expect(JSON.stringify(state)).toBe(snapshot);
  });
});
