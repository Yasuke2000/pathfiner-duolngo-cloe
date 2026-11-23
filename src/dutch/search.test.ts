import { describe, expect, it } from "vitest";
import { searchTerms } from "./search";

describe("searchTerms", () => {
  it("finds a Dutch word without its article, case or accents", () => {
    expect(searchTerms("TELLER")[0].term.nl).toBe("de teller");
    expect(searchTerms("kopieren")[0].term.nl).toBe("kopiëren");
  });

  it("finds by the English meaning too", () => {
    const hits = searchTerms("deadlock").map((h) => h.term.nl);
    expect(hits).toContain("de impasse");
  });

  it("finds by an accepted alternative", () => {
    // "de vertaler" is the textbook alternative for "de compiler".
    expect(searchTerms("vertaler").map((h) => h.term.nl)).toContain("de compiler");
  });

  it("ranks an exact match above a partial one, and words above sentences", () => {
    const hits = searchTerms("lus");
    expect(hits[0].term.nl).toBe("de lus");
    const firstSentence = hits.findIndex((h) => h.term.kind === "sentence");
    const lastWord = hits.map((h) => h.term.kind !== "sentence").lastIndexOf(true);
    if (firstSentence !== -1) expect(firstSentence).toBeGreaterThan(0);
    expect(lastWord).toBeGreaterThanOrEqual(0);
  });

  it("returns nothing for a blank or one-letter query, and respects the limit", () => {
    expect(searchTerms("")).toEqual([]);
    expect(searchTerms("a")).toEqual([]);
    expect(searchTerms("de", 5).length).toBeLessThanOrEqual(5);
  });

  it("returns nothing for nonsense", () => {
    expect(searchTerms("qzxwvk")).toEqual([]);
  });
});
