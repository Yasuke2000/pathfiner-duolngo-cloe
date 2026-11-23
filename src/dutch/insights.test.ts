import { describe, expect, it } from "vitest";
import { ALL_CODE_QUESTIONS, CODE_UNITS, conceptOf } from "./code";
import { CONCEPT_BY_ID, CONCEPTS } from "./concepts";
import {
  conceptStats,
  kindStats,
  missedQuestions,
  questionsFor,
  recentMistakes,
  summarise,
  weakConcepts,
} from "./insights";
import { LOG_LIMIT, recordAnswer, type DutchSave } from "./progress";

const T0 = new Date(2026, 2, 10, 12, 0, 0).getTime();
const DAY = 86_400_000;
const fresh = (): DutchSave => ({ terms: {}, xp: 0, lessons: 0 });
const detail = (given: string, expected: string, kind = "code") => ({ kind, asked: "Wat drukt dit af?", given, expected });

describe("concept tags", () => {
  it("gives every code question a known concept", () => {
    for (const q of ALL_CODE_QUESTIONS) {
      expect(CONCEPT_BY_ID.has(conceptOf(q)), `${q.id} -> ${conceptOf(q)}`).toBe(true);
    }
  });

  it("has questions for every concept, and both high- and low-level ones", () => {
    for (const c of CONCEPTS) expect(questionsFor(c.id).length, c.id).toBeGreaterThan(0);
    const high = ALL_CODE_QUESTIONS.filter((q) => CONCEPT_BY_ID.get(conceptOf(q))?.level === "high");
    const low = ALL_CODE_QUESTIONS.filter((q) => CONCEPT_BY_ID.get(conceptOf(q))?.level === "low");
    expect(high.length).toBeGreaterThanOrEqual(15);
    expect(low.length).toBeGreaterThanOrEqual(15);
  });

  it("covers C and JavaScript as well as Java", () => {
    const langs = new Set(ALL_CODE_QUESTIONS.map((q) => q.lang));
    for (const l of ["java", "c", "javascript", "python", "sql", "css", "bash", "powershell", "json", "yaml", "log", "prompt"]) {
      expect(langs.has(l as never), l).toBe(true);
    }
    expect(CODE_UNITS.length).toBeGreaterThanOrEqual(11);
  });

  it("covers operations and AI, not only programming", () => {
    const byLevel = (level: string) =>
      ALL_CODE_QUESTIONS.filter((q) => CONCEPT_BY_ID.get(conceptOf(q))?.level === level).length;
    expect(byLevel("ops")).toBeGreaterThanOrEqual(25);
    expect(byLevel("ai")).toBeGreaterThanOrEqual(10);
  });
});

describe("conceptStats / weakConcepts", () => {
  const pointers = questionsFor("pointers");
  const loops = questionsFor("loops");

  function practised(): DutchSave {
    let s = fresh();
    // Pointers go badly: every question wrong twice.
    for (const q of pointers) {
      s = recordAnswer(s, `code:${q.id}`, false, T0, detail("5", q.answer));
      s = recordAnswer(s, `code:${q.id}`, false, T0 + 1, detail("", q.answer));
    }
    // Loops go well.
    for (const q of loops) s = recordAnswer(s, `code:${q.id}`, true, T0, detail(q.answer, q.answer));
    for (const q of loops) s = recordAnswer(s, `code:${q.id}`, true, T0 + 1, detail(q.answer, q.answer));
    return s;
  }

  it("reports accuracy per concept, and null where nothing was answered", () => {
    const stats = conceptStats(practised().terms);
    const by = (id: string) => stats.find((c) => c.concept.id === id)!;
    expect(by("pointers")).toMatchObject({ attempted: pointers.length, answers: pointers.length * 2, correct: 0, pct: 0 });
    expect(by("loops").pct).toBe(100);
    expect(by("recursion").pct).toBeNull();
    expect(by("recursion").attempted).toBe(0);
  });

  it("flags the concept that goes wrong and not the one that goes well", () => {
    const weak = weakConcepts(practised().terms).map((c) => c.concept.id);
    expect(weak).toEqual(["pointers"]);
  });

  it("does not flag a concept on a single answer", () => {
    const s = recordAnswer(fresh(), `code:${pointers[0].id}`, false, T0, detail("x", "y"));
    expect(weakConcepts(s.terms)).toEqual([]);
  });

  it("lists the missed questions with what she last answered", () => {
    const missed = missedQuestions(practised());
    expect(missed.map((m) => m.question.id).sort()).toEqual(pointers.map((q) => q.id).sort());
    expect(missed[0].wrong).toBe(2);
    expect(missed[0].lastGiven).toBe(""); // the second time she chose "I don't know"
    expect(missed[0].concept?.id).toBe("pointers");
  });
});

describe("the mistake log", () => {
  it("records what was asked, answered and expected — only for wrong answers", () => {
    let s = recordAnswer(fresh(), "contact:hallo", true, T0, detail("hello", "hello", "choose"));
    s = recordAnswer(s, "computer:de map", false, T0 + 5, { kind: "type", asked: "the folder", given: "de kaart", expected: "de map" });
    expect(s.log).toEqual([
      { t: T0 + 5, id: "computer:de map", kind: "type", asked: "the folder", given: "de kaart", expected: "de map" },
    ]);
  });

  it("returns the newest mistakes first and never grows without bound", () => {
    let s = fresh();
    for (let i = 0; i < LOG_LIMIT + 25; i++) s = recordAnswer(s, `w${i}`, false, T0 + i, detail(`a${i}`, "b", "type"));
    expect(s.log).toHaveLength(LOG_LIMIT);
    const recent = recentMistakes(s, 3);
    expect(recent.map((m) => m.id)).toEqual([`w${LOG_LIMIT + 24}`, `w${LOG_LIMIT + 23}`, `w${LOG_LIMIT + 22}`]);
  });

  it("tallies accuracy per exercise type, worst first", () => {
    let s = fresh();
    s = recordAnswer(s, "a", false, T0, detail("de", "het", "article"));
    s = recordAnswer(s, "b", false, T0, detail("de", "het", "article"));
    s = recordAnswer(s, "c", true, T0, detail("x", "x", "choose"));
    s = recordAnswer(s, "d", false, T0, detail("y", "x", "choose"));
    expect(kindStats(s)).toEqual([
      { kind: "article", n: 2, ok: 0, pct: 0 },
      { kind: "choose", n: 2, ok: 1, pct: 50 },
    ]);
  });
});

describe("summarise", () => {
  it("is empty for someone who has not started", () => {
    expect(summarise(null, T0)).toEqual({
      answers: 0, correct: 0, pct: null, activeDays14: 0, lastActive: null, daysSince: null,
    });
  });

  it("counts active days and how long ago she last practised", () => {
    let s = recordAnswer(fresh(), "a", true, T0 - 5 * DAY);
    s = recordAnswer(s, "b", false, T0 - 3 * DAY);
    s = recordAnswer(s, "c", true, T0 - 3 * DAY);
    const sum = summarise(s, T0);
    expect(sum.activeDays14).toBe(2);
    expect(sum.daysSince).toBe(3);
    expect(sum.answers).toBe(3);
    expect(sum.pct).toBe(67);
  });
});
