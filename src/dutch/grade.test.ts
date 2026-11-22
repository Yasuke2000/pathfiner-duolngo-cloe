import { describe, expect, it } from "vitest";
import { acceptedAnswers, editDistance, judge, normalize, stripLead } from "./grade";
import type { Term } from "./types";

describe("normalize", () => {
  it("folds case, accents and punctuation", () => {
    expect(normalize("  Kopiëren!  ")).toBe("kopieren");
    expect(normalize("Hoe laat is het?")).toBe("hoe laat is het");
    expect(normalize("the key (on a keyboard)")).toBe("the key on a keyboard");
  });
});

describe("stripLead", () => {
  it("drops articles and the infinitive 'to'", () => {
    expect(stripLead("het bestand")).toBe("bestand");
    expect(stripLead("de map")).toBe("map");
    expect(stripLead("to save")).toBe("save");
  });
});

describe("editDistance", () => {
  it("counts single edits", () => {
    expect(editDistance("bestand", "bestand")).toBe(0);
    expect(editDistance("bestnd", "bestand")).toBe(1);
    expect(editDistance("kat", "hond")).toBe(4);
  });
});

describe("acceptedAnswers", () => {
  const term: Term = {
    nl: "dag",
    en: "hello / bye",
    altNl: ["salut"],
  };

  it("accepts each slash-separated option on its own", () => {
    const acc = acceptedAnswers(term, "nl>en");
    expect(acc).toContain("hello");
    expect(acc).toContain("bye");
    expect(acc).toContain("hello / bye");
  });

  it("includes Dutch alternatives in the other direction", () => {
    expect(acceptedAnswers(term, "en>nl")).toEqual(expect.arrayContaining(["dag", "salut"]));
  });

  it("offers the version without a parenthetical gloss", () => {
    const t: Term = { nl: "de klasse", en: "the class (OOP)" };
    expect(acceptedAnswers(t, "nl>en")).toContain("the class");
  });
});

describe("judge", () => {
  const accepted = ["het bestand"];

  it("accepts an exact answer", () => {
    expect(judge("het bestand", accepted).verdict).toBe("correct");
  });

  it("accepts a noun typed without its article", () => {
    expect(judge("bestand", accepted).verdict).toBe("correct");
  });

  it("forgives a single slip but says so", () => {
    const j = judge("bestnd", accepted);
    expect(j.verdict).toBe("typo");
    expect(j.expected).toBe("het bestand");
  });

  it("rejects a different word and reports the right one", () => {
    const j = judge("de map", accepted);
    expect(j.verdict).toBe("wrong");
    expect(j.expected).toBe("het bestand");
  });

  it("rejects an empty answer", () => {
    expect(judge("   ", accepted).verdict).toBe("wrong");
  });

  it("is case- and accent-insensitive", () => {
    expect(judge("KOPIEREN", ["kopiëren"]).verdict).toBe("correct");
  });

  it("does not forgive a slip in a very short word", () => {
    // "ja" vs "je" is a real distinction, not a typo.
    expect(judge("je", ["ja"]).verdict).toBe("wrong");
  });
});
