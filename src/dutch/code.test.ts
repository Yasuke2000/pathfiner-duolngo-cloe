import { describe, expect, it } from "vitest";
import { ALL_CODE_QUESTIONS, CODE_UNITS } from "./code";
import { buildCodeLesson, codeId, expectedOf } from "./lesson";
import { review, type ProgressMap } from "./srs";

const NOW = 1_700_000_000_000;

describe("the code questions themselves", () => {
  it("has units across several languages", () => {
    expect(CODE_UNITS.length).toBeGreaterThanOrEqual(4);
    expect(ALL_CODE_QUESTIONS.length).toBeGreaterThanOrEqual(30);
    const langs = new Set(ALL_CODE_QUESTIONS.map((q) => q.lang));
    expect(langs.has("java")).toBe(true);
    expect(langs.has("css")).toBe(true);
    expect(langs.size).toBeGreaterThanOrEqual(4);
  });

  it("gives every question a unique id", () => {
    const ids = ALL_CODE_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("always includes the right answer among distinct options", () => {
    for (const q of ALL_CODE_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options).toContain(q.answer);
    }
  });

  it("asks and explains in Dutch, with an English gloss as a safety net", () => {
    for (const q of ALL_CODE_QUESTIONS) {
      expect(q.code.trim().length).toBeGreaterThan(0);
      expect(q.question.trim().length).toBeGreaterThan(0);
      expect(q.questionEn.trim().length).toBeGreaterThan(0);
      // The explanation is the teaching moment, so it must be substantial.
      expect(q.explain.length).toBeGreaterThan(30);
      expect(q.explainEn.length).toBeGreaterThan(20);
    }
  });
});

describe("buildCodeLesson", () => {
  it("builds the requested number of code exercises", () => {
    const lesson = buildCodeLesson(ALL_CODE_QUESTIONS, { size: 8, seed: 3 });
    expect(lesson).toHaveLength(8);
    for (const ex of lesson) {
      expect(ex.kind).toBe("code");
      if (ex.kind !== "code") continue;
      expect(ex.options).toContain(ex.q.answer);
      expect(expectedOf(ex)).toBe(ex.q.answer);
    }
  });

  it("does not repeat a question within one lesson", () => {
    const ids = buildCodeLesson(ALL_CODE_QUESTIONS, { size: 10, seed: 7 }).map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("shows unseen questions before ones that are resting", () => {
    const first = ALL_CODE_QUESTIONS[0];
    const progress: ProgressMap = { [codeId(first)]: review(undefined, true, NOW) };
    const picked = buildCodeLesson(ALL_CODE_QUESTIONS, {
      size: ALL_CODE_QUESTIONS.length,
      seed: 5,
      progress,
      now: NOW,
    });
    expect(picked[picked.length - 1].id).toBe(codeId(first));
  });

  it("is deterministic for a given seed", () => {
    const a = buildCodeLesson(ALL_CODE_QUESTIONS, { size: 6, seed: 42 }).map((e) => e.id);
    const b = buildCodeLesson(ALL_CODE_QUESTIONS, { size: 6, seed: 42 }).map((e) => e.id);
    expect(a).toEqual(b);
  });
});
