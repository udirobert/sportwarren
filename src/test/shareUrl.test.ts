import { describe, it, expect } from "vitest";
import {
  decodeFormationFromUrl,
  generateShareCaption,
  generateChallengeCaption,
  suggestCounterFormation,
  buildChallengeSharePath,
  decodeChallengeSlugFromUrl,
} from "@/lib/pitch/shareUrl";

describe("shareUrl", () => {
  describe("decodeFormationFromUrl", () => {
    it("decodes valid formation params", () => {
      const sp = new URLSearchParams(
        "formation=4-3-3&style=attacking&color=%2310b981&size=11&names=Salah,Kane,Saka"
      );
      const result = decodeFormationFromUrl(sp);
      expect(result.formation).toBe("4-3-3");
      expect(result.style).toBe("attacking");
      expect(result.color).toBe("#10b981");
      expect(result.size).toBe(11);
      expect(result.names).toEqual(["Salah", "Kane", "Saka"]);
    });

    it("rejects invalid formation", () => {
      const sp = new URLSearchParams("formation=9-9-9");
      const result = decodeFormationFromUrl(sp);
      expect(result.formation).toBeUndefined();
    });

    it("rejects invalid squad size", () => {
      const sp = new URLSearchParams("size=99");
      const result = decodeFormationFromUrl(sp);
      expect(result.size).toBeUndefined();
    });

    it("accepts valid squad sizes", () => {
      for (const size of ["5", "6", "7", "11"]) {
        const sp = new URLSearchParams(`size=${size}`);
        const result = decodeFormationFromUrl(sp);
        expect(result.size).toBe(parseInt(size));
      }
    });

    it("handles missing params gracefully", () => {
      const sp = new URLSearchParams();
      const result = decodeFormationFromUrl(sp);
      expect(result).toEqual({});
    });

    it("handles color with or without hash", () => {
      const withHash = new URLSearchParams("color=%23ff0000");
      expect(decodeFormationFromUrl(withHash).color).toBe("#ff0000");

      const withoutHash = new URLSearchParams("color=ff0000");
      expect(decodeFormationFromUrl(withoutHash).color).toBe("#ff0000");
    });

    it("rejects invalid color", () => {
      const sp = new URLSearchParams("color=not-a-color");
      const result = decodeFormationFromUrl(sp);
      expect(result.color).toBeUndefined();
    });

    it("decodes names with special characters", () => {
      const sp = new URLSearchParams("names=Mbapp%C3%A9,M%C3%BCller");
      const result = decodeFormationFromUrl(sp);
      expect(result.names).toEqual(["Mbappé", "Müller"]);
    });

    it("filters empty names", () => {
      const sp = new URLSearchParams("names=A,,B,");
      const result = decodeFormationFromUrl(sp);
      expect(result.names).toEqual(["A", "B"]);
    });
  });

  describe("generateShareCaption", () => {
    it("generates caption with player names", () => {
      const caption = generateShareCaption("4-3-3", [
        "Salah",
        "Kane",
        "Saka",
        "Rice",
        "Rodri",
      ]);
      expect(caption).toContain("4-3-3");
      expect(caption).toContain("Salah");
      expect(caption).toContain("Kane");
      expect(caption).toContain("Saka");
      expect(caption).toContain("2 more");
    });

    it("generates caption without names", () => {
      const caption = generateShareCaption("4-4-2", []);
      expect(caption).toContain("4-4-2");
      expect(caption).toContain("SportWarren");
    });

    it("generates caption with fewer than 3 names", () => {
      const caption = generateShareCaption("3-5-2", ["Tunde", "Kofi"]);
      expect(caption).toContain("3-5-2");
    });
  });

  describe("challenge URL encoding/decoding", () => {
    it("decodes challenge params with vs_ prefix", () => {
      const sp = new URLSearchParams(
        "formation=4-3-3&style=counter&color=%2310b981&size=11&names=Salah,Kane&vs_f=4-4-2&vs_s=balanced&vs_c=%23ef4444&vs_n=Tunde,Kofi&flow=counter"
      );
      const result = decodeFormationFromUrl(sp);
      expect(result.formation).toBe("4-3-3");
      expect(result.vs_formation).toBe("4-4-2");
      expect(result.vs_style).toBe("balanced");
      expect(result.vs_color).toBe("#ef4444");
      expect(result.vs_names).toEqual(["Tunde", "Kofi"]);
      expect(result.flow).toBe("challenge_received");
    });

    it("does not set flow without vs_formation", () => {
      const sp = new URLSearchParams("formation=4-3-3&flow=counter");
      const result = decodeFormationFromUrl(sp);
      expect(result.flow).toBeUndefined();
    });

    it("ignores vs_formation with invalid value", () => {
      const sp = new URLSearchParams("formation=4-3-3&vs_f=9-9-9");
      const result = decodeFormationFromUrl(sp);
      expect(result.vs_formation).toBeUndefined();
      expect(result.flow).toBeUndefined();
    });
  });

  describe("buildChallengeSharePath / decodeChallengeSlugFromUrl", () => {
    it("builds a short challenge path from a slug", () => {
      expect(buildChallengeSharePath("aB3xY9")).toBe("/?challenge=aB3xY9");
    });

    it("URI-encodes the slug", () => {
      expect(buildChallengeSharePath("a b")).toBe("/?challenge=a%20b");
    });

    it("round-trips through decode", () => {
      const path = buildChallengeSharePath("aB3xY9");
      const sp = new URLSearchParams(path.split("?")[1]);
      expect(decodeChallengeSlugFromUrl(sp)).toBe("aB3xY9");
    });

    it("rejects a missing or malformed slug", () => {
      expect(decodeChallengeSlugFromUrl(new URLSearchParams())).toBeNull();
      expect(decodeChallengeSlugFromUrl(new URLSearchParams("challenge=ab"))).toBeNull(); // too short
      expect(decodeChallengeSlugFromUrl(new URLSearchParams("challenge=has spaces"))).toBeNull();
    });
  });

  describe("generateChallengeCaption", () => {
    it("generates challenge caption", () => {
      const caption = generateChallengeCaption("4-4-2", "4-3-3");
      expect(caption).toContain("4-4-2");
      expect(caption).toContain("4-3-3");
    });
  });

  describe("suggestCounterFormation", () => {
    it("suggests 4-5-1 against 4-3-3", () => {
      expect(suggestCounterFormation("4-3-3")).toBe("4-5-1");
    });

    it("suggests 4-3-3 against 4-4-2", () => {
      expect(suggestCounterFormation("4-4-2")).toBe("4-3-3");
    });

    it("suggests 5-3-2 against 3-4-3", () => {
      expect(suggestCounterFormation("3-4-3")).toBe("5-3-2");
    });

    it("returns 4-3-3 as default for unknown formations", () => {
      // small-sided formations not in the counter map
      expect(suggestCounterFormation("1-2-1")).toBe("4-3-3");
    });
  });
});
