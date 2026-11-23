import { describe, expect, it } from "vitest";
import { decodeTransfer, encodeTransfer, exportSave, importSave, mergeSaves } from "./backup";
import { recordAnswer, type DutchSave } from "./progress";

const T0 = new Date(2026, 2, 10, 12, 0, 0).getTime();
const DAY = 24 * 60 * 60 * 1000;
const fresh = (): DutchSave => ({ terms: {}, xp: 0, lessons: 0 });

function practised(ids: string[], now: number, base: DutchSave = fresh()): DutchSave {
  let s = base;
  for (const id of ids) s = recordAnswer(s, id, true, now);
  return s;
}

describe("backup file", () => {
  it("round-trips a save exactly", () => {
    const save = { ...practised(["a", "b", "c"], T0), lessons: 2 };
    expect(importSave(exportSave(save, T0))).toEqual(save);
  });

  it("rejects anything that is not a backup of this course", () => {
    expect(() => importSave("not json")).toThrow("not-a-backup");
    expect(() => importSave("{}")).toThrow("not-a-backup");
    expect(() => importSave(JSON.stringify({ format: "something-else", save: { terms: {} } }))).toThrow();
  });

  it("drops malformed entries instead of trusting them", () => {
    const file = JSON.stringify({
      format: "code-en-koffie.progress",
      version: 1,
      save: {
        terms: {
          good: { box: 2, due: 5, seen: 3, correct: 2 },
          broken: { box: "x", due: 5, seen: 3, correct: 2 },
          wild: { box: 99, due: 5, seen: 2, correct: 7 },
        },
        xp: -50,
        lessons: "many",
        history: { "2026-03-10": { xp: 10, n: 1, ok: 1 }, "not-a-date": { xp: 1, n: 1, ok: 1 } },
      },
    });
    const save = importSave(file);
    expect(Object.keys(save.terms).sort()).toEqual(["good", "wild"]);
    expect(save.terms.wild).toEqual({ box: 5, due: 5, seen: 2, correct: 2 }); // clamped
    expect(save.xp).toBe(0);
    expect(save.lessons).toBe(0);
    expect(Object.keys(save.history ?? {})).toEqual(["2026-03-10"]);
  });
});

describe("mergeSaves", () => {
  it("keeps words from both devices", () => {
    const laptop = practised(["a", "b"], T0);
    const phone = practised(["c"], T0);
    expect(Object.keys(mergeSaves(laptop, phone).terms).sort()).toEqual(["a", "b", "c"]);
  });

  it("keeps the copy of a word with more practice, whichever side it is on", () => {
    const more = practised(["a", "a", "a"], T0);
    const less = practised(["a"], T0);
    expect(mergeSaves(more, less).terms.a.seen).toBe(3);
    expect(mergeSaves(less, more).terms.a.seen).toBe(3);
  });

  it("never loses XP, lessons or a day of history", () => {
    const laptop = { ...practised(["a", "b"], T0), lessons: 4 };
    const phone = { ...practised(["c"], T0 + DAY), lessons: 1 };
    const merged = mergeSaves(laptop, phone);
    expect(merged.xp).toBe(Math.max(laptop.xp, phone.xp));
    expect(merged.lessons).toBe(4);
    expect(Object.keys(merged.history ?? {}).length).toBe(2);
  });

  it("is idempotent: importing the same backup twice changes nothing", () => {
    const a = practised(["a", "b"], T0);
    const b = practised(["b", "c"], T0 + DAY);
    const once = mergeSaves(a, b);
    expect(mergeSaves(once, b)).toEqual(once);
  });
});

describe("transfer code", () => {
  it("round-trips through a compact, URL-safe code", async () => {
    const save = practised(["contact:hallo", "contact:dag", "namen:de teller"], T0);
    const code = await encodeTransfer(save, T0);
    expect(code.startsWith("CK1.")).toBe(true);
    expect(code).toMatch(/^CK1\.[A-Za-z0-9_-]+$/);
    expect(await decodeTransfer(`  ${code}\n`)).toEqual(save);
  });

  it("stays small enough to paste even for a large save", async () => {
    const ids = Array.from({ length: 1100 }, (_, i) => `unit${i % 30}:woord nummer ${i}`);
    const code = await encodeTransfer(practised(ids, T0), T0);
    expect(code.length).toBeLessThan(40_000);
  });

  it("rejects garbage", async () => {
    await expect(decodeTransfer("hello")).rejects.toThrow("not-a-backup");
    await expect(decodeTransfer("CK1.!!!!")).rejects.toThrow("not-a-backup");
  });
});
