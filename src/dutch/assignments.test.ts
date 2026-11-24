import { describe, expect, it } from "vitest";
import { annotate, ASSIGNMENTS, assignmentGlossary, type GlossEntry } from "./assignments";
import { CODE_UNITS } from "./code";
import { UNIT_BY_ID } from "./vocab";

const gloss = assignmentGlossary();
const entry = (nl: string, forms: string[]): GlossEntry => ({ nl, en: nl, forms });

describe("annotate", () => {
  it("marks a glossary word and leaves the rest as plain text", () => {
    const pieces = annotate("De gegevens worden bijgehouden.", [entry("bijhouden", ["bijgehouden"])]);
    expect(pieces.map((p) => p.text).join("")).toBe("De gegevens worden bijgehouden.");
    expect(pieces.filter((p) => p.entry).map((p) => p.text)).toEqual(["bijgehouden"]);
  });

  it("only matches whole words", () => {
    const lid = [entry("het lid", ["lid"])];
    expect(annotate("geldig", lid).some((p) => p.entry)).toBe(false);
    expect(annotate("een lid, een Lid-object", lid).filter((p) => p.entry).map((p) => p.text)).toEqual(["lid", "Lid"]);
  });

  it("prefers the longest form", () => {
    const pieces = annotate("aan de hand van een constructor", [
      entry("aan", ["aan"]),
      entry("aan de hand van", ["aan de hand van"]),
    ]);
    expect(pieces.filter((p) => p.entry).map((p) => p.text)).toEqual(["aan de hand van"]);
  });

  it("finds two glossary words that stand next to each other", () => {
    const pieces = annotate("uniek identificatienummer", [entry("uniek", ["uniek"]), entry("nummer", ["identificatienummer"])]);
    expect(pieces.filter((p) => p.entry).map((p) => p.text)).toEqual(["uniek", "identificatienummer"]);
  });

  it("handles hyphenated and accented forms", () => {
    const pieces = annotate("een 3-argumenten-constructor om te creëren", [
      entry("ctor", ["3-argumenten-constructor"]),
      entry("creëren", ["creëren"]),
    ]);
    expect(pieces.filter((p) => p.entry).map((p) => p.text)).toEqual(["3-argumenten-constructor", "creëren"]);
  });

  it("never loses or duplicates text", () => {
    for (const a of ASSIGNMENTS) {
      for (const s of a.sections) {
        for (const b of s.blocks) {
          expect(annotate(b.nl, gloss).map((p) => p.text).join("")).toBe(b.nl);
        }
      }
    }
  });
});

describe("the library assignment", () => {
  const a = ASSIGNMENTS.find((x) => x.id === "bibliotheek")!;
  const text = a.sections.flatMap((s) => s.blocks.map((b) => b.nl)).join(" ");

  it("has every section of the original, each paragraph translated", () => {
    expect(a.sections.map((s) => s.heading)).toEqual([
      "Inleiding",
      "De klasse Lid",
      "De klasse Boek",
      "De klasse Ontlening",
      "De klasse Balie",
      "De klasse Applicatie",
    ]);
    for (const s of a.sections) {
      for (const b of s.blocks) {
        expect(b.nl.trim()).not.toBe("");
        expect(b.en.trim()).not.toBe("");
      }
    }
  });

  it("names all seven methods of the desk", () => {
    for (const m of [
      "toevoegenBoek",
      "toevoegenLid",
      "ontleen",
      "brengTerug",
      "printOverzichtGeleendeBoeken",
      "printOverzichtAanwezigeBoeken",
      "printOntleendeBoekenVanPersoon",
    ]) {
      expect(text).toContain(m);
    }
  });

  it("links to a word list, a sentence list and a question set that exist", () => {
    expect(UNIT_BY_ID.get(a.wordsUnit)?.terms.length).toBeGreaterThanOrEqual(60);
    expect(UNIT_BY_ID.get(a.sentencesUnit)?.terms.length).toBeGreaterThanOrEqual(15);
    expect(CODE_UNITS.find((u) => u.id === a.questionsUnit)?.questions.length).toBeGreaterThanOrEqual(20);
  });

  it("explains the words that carry the meaning of the task", () => {
    const marked = new Set(
      a.sections.flatMap((s) => s.blocks.flatMap((b) => annotate(b.nl, gloss).filter((p) => p.entry).map((p) => p.text.toLowerCase()))),
    );
    for (const w of [
      "bijgehouden",
      "gewijzigd",
      "aan de hand van",
      "3-argumenten-constructor",
      "0-argumenten-constructor",
      "tostring-methode",
      "meegegeven",
      "betreffende",
      "overeenkomstige",
      "uitgeleend",
      "indien",
      "reeds",
      "foutmelding",
      "onveranderd",
      "uniek",
      "exemplaren",
      "ofwel",
      "aangezien",
      "containers",
      "tiental",
      "achttal",
      "vervolgens",
      "tenslotte",
      "op het scherm",
      "uiteraard",
      "ontleend",
      "leden",
      "balie",
    ]) {
      // A word may be marked as part of a longer phrase ("een tiental").
      expect([...marked].some((m) => m.includes(w)), w).toBe(true);
    }
  });

  it("explains a large share of the text, not just a few words", () => {
    const pieces = a.sections.flatMap((s) => s.blocks.flatMap((b) => annotate(b.nl, gloss)));
    expect(pieces.filter((p) => p.entry).length).toBeGreaterThan(150);
  });

  it("gives a class-by-class summary of what is asked", () => {
    expect(a.summary.map((c) => c.name)).toEqual(["Lid", "Boek", "Ontlening", "Balie", "Applicatie"]);
    expect(a.summary.find((c) => c.name === "Balie")!.methods).toHaveLength(7);
  });
});
