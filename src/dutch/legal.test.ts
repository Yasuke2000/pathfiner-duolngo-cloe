import { describe, expect, it } from "vitest";
import { CONSENT_VERSION, KEY_NOTICE, LEGAL } from "./legal";

describe("the consent notice", () => {
  it("states the key fact — recorded and may be shared — in both languages", () => {
    for (const lang of ["en", "nl"] as const) {
      const key = KEY_NOTICE[lang].toLowerCase();
      // It must mention both the recording and the sharing with a coach, up front.
      expect(key).toMatch(lang === "nl" ? /bijgehouden|voortgang/ : /progress|recorded/);
      expect(key).toMatch(lang === "nl" ? /begeleider|gedeeld/ : /coach|shared/);
      expect(KEY_NOTICE[lang].length).toBeGreaterThan(40);
    }
  });

  it("has a full document in both languages with a sharing section", () => {
    for (const lang of ["en", "nl"] as const) {
      const doc = LEGAL[lang];
      expect(doc.title.trim()).not.toBe("");
      expect(doc.sections.length).toBeGreaterThanOrEqual(5);
      const text = doc.sections.flatMap((s) => [s.heading, ...s.body]).join(" ").toLowerCase();
      expect(text).toMatch(lang === "nl" ? /begeleider/ : /coach/);
      expect(text).toMatch(lang === "nl" ? /local storage|browser/ : /local storage|browser/);
      // It must not promise live sharing exists yet — only that it may be added.
      expect(text).toMatch(lang === "nl" ? /later|mogelijk/ : /later|may be added/);
    }
  });

  it("has a version so the notice can be shown again when it changes", () => {
    expect(CONSENT_VERSION).toBeGreaterThanOrEqual(1);
  });
});
