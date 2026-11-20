import { describe, it, expect, beforeEach, vi } from "vitest";
import { storePlaygroundDraft, getPlaygroundDraft } from "../lib/pitch/playgroundDraft";

// Node 22+ injects its own experimental `localStorage` global ahead of
// jsdom's, and without --localstorage-file it throws on access. Stub a real
// in-memory implementation so the module's window-guarded paths execute.
const store = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() { return store.size; },
});

describe("playgroundDraft", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a draft through store/get", () => {
    storePlaygroundDraft({
      formation: "4-3-3",
      style: "balanced",
      color: "#10b981",
      size: 11,
      names: ["Salah", "Kane"],
    });
    const draft = getPlaygroundDraft();
    expect(draft?.formation).toBe("4-3-3");
    expect(draft?.names).toEqual(["Salah", "Kane"]);
  });

  it("returns null when nothing is stored", () => {
    expect(getPlaygroundDraft()).toBeNull();
  });

  it("returns null and clears an expired draft", () => {
    localStorage.setItem(
      "sw_playground_draft",
      JSON.stringify({
        formation: "4-3-3",
        style: "balanced",
        color: "#10b981",
        size: 11,
        names: [],
        savedAt: Date.now() - 25 * 60 * 60 * 1000, // 25h ago, past the 24h TTL
      }),
    );
    expect(getPlaygroundDraft()).toBeNull();
    expect(localStorage.getItem("sw_playground_draft")).toBeNull();
  });

  it("returns null for corrupt or malformed data rather than throwing", () => {
    localStorage.setItem("sw_playground_draft", "{not json");
    expect(getPlaygroundDraft()).toBeNull();

    localStorage.setItem("sw_playground_draft", JSON.stringify({ formation: "4-3-3" }));
    expect(getPlaygroundDraft()).toBeNull();

    localStorage.setItem(
      "sw_playground_draft",
      JSON.stringify({ formation: "4-3-3", style: "balanced", color: "#10b981", size: 99, names: [], savedAt: Date.now() }),
    );
    expect(getPlaygroundDraft()).toBeNull();
  });
});
