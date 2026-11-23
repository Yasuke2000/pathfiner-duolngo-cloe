import { describe, expect, it } from "vitest";
import { UNIT_ICON } from "./icon-map";
import { CODE_UNITS } from "./code";
import { GROUPS } from "./path";
import { translate, UI } from "./ui";
import { UNITS } from "./vocab";

describe("interface text", () => {
  it("has every string in both languages, none empty", () => {
    expect(Object.keys(UI.nl).sort()).toEqual(Object.keys(UI.en).sort());
    for (const lang of ["en", "nl"] as const) {
      for (const [key, text] of Object.entries(UI[lang])) expect(text.trim(), `${lang}:${key}`).not.toBe("");
    }
  });

  it("uses the same placeholders in both languages", () => {
    const slots = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(UI.en) as (keyof typeof UI.en)[]) {
      expect(slots(UI.nl[key]), key).toEqual(slots(UI.en[key]));
    }
  });

  it("fills placeholders", () => {
    expect(translate("en", "chip.due", { n: 3 })).toBe("3 to review");
    expect(translate("nl", "chip.due", { n: 3 })).toBe("3 herhalen");
    expect(translate("en", "group.seen", { a: 2, b: 9 })).toBe("2/9 seen");
  });

  it("actually differs between the two languages for the main navigation", () => {
    for (const key of ["tab.learn", "tab.dict", "tab.grammar", "tab.progress", "btn.practise", "btn.check"] as const) {
      expect(UI.en[key]).not.toBe(UI.nl[key]);
    }
  });
});

describe("names and icons", () => {
  it("gives every group an English and a Dutch title", () => {
    for (const g of GROUPS) {
      expect(g.title.trim()).not.toBe("");
      expect(g.titleEn.trim()).not.toBe("");
    }
  });

  it("has an icon for every vocabulary and code unit", () => {
    for (const u of [...UNITS, ...CODE_UNITS]) expect(UNIT_ICON[u.id], u.id).toBeTruthy();
  });
});
