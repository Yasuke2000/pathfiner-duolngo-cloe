/** Direction of a translation exercise. */
export type Dir = "nl>en" | "en>nl";

export interface Example {
  nl: string;
  en: string;
}

export interface Term {
  /** Dutch, nouns written with their article ("het bestand") — the article is
   *  half the battle in Dutch, so we always teach it attached. */
  nl: string;
  en: string;
  /** Extra accepted answers (synonyms, spelling variants, NL-vs-BE wording). */
  altNl?: string[];
  altEn?: string[];
  /** Plain-language "what it actually is" — so a first-year meeting the concept
   *  and the Dutch word at the same time gets both. */
  def?: string;
  /** A short note: Flemish vs Netherlands Dutch, false friends, pronunciation. */
  note?: string;
  /** A sentence she'd actually hear, used for the word-bank exercise. */
  example?: Example;
}

/** Everyday survival Dutch, or the computer-science track. */
export type Track = "life" | "cs";

export interface Unit {
  id: string;
  /** Dutch title — she should start reading Dutch immediately. */
  title: string;
  /** English gloss of the title. */
  subtitle: string;
  blurb: string;
  /** hsl triple, matching the app's tone convention. */
  accent: string;
  track: Track;
  terms: Term[];
}

/** Stable id for progress tracking: unit + the Dutch side of the pair. */
export function termId(unitId: string, nl: string): string {
  return `${unitId}:${nl.toLowerCase()}`;
}

/** "de"/"het" if the Dutch term is a noun written with its article. */
export function articleOf(nl: string): "de" | "het" | null {
  const m = /^(de|het)\s+\S/i.exec(nl.trim());
  return m ? (m[1].toLowerCase() as "de" | "het") : null;
}

/** The noun without its article ("het bestand" -> "bestand"). */
export function bareNoun(nl: string): string {
  return nl.replace(/^(de|het)\s+/i, "");
}
