import { describe, it, expect, beforeEach } from "vitest";
import { storePlaygroundDraft, getPlaygroundDraft } from "../lib/pitch/playgroundDraft";

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
