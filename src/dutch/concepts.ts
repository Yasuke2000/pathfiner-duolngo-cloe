/**
 * The programming concept each code question tests.
 *
 * A wrong answer on "what does this print?" says little by itself. Grouped by
 * concept it says a lot: nine mistakes spread over the course are noise, nine
 * mistakes on pointers are a topic to sit down and explain.
 */
export type Level = "basis" | "high" | "low" | "web" | "data" | "taal";

export interface Concept {
  id: string;
  nl: string;
  en: string;
  level: Level;
}

export const LEVELS: Record<Level, { nl: string; en: string }> = {
  basis: { nl: "Basis", en: "Fundamentals" },
  high: { nl: "Hoog niveau", en: "High-level" },
  low: { nl: "Laag niveau", en: "Low-level" },
  web: { nl: "Web", en: "Web" },
  data: { nl: "Data", en: "Data" },
  taal: { nl: "Taal", en: "Language" },
};

export const CONCEPTS: Concept[] = [
  { id: "loops", nl: "Lussen", en: "Loops", level: "basis" },
  { id: "conditions", nl: "Voorwaarden", en: "Conditions", level: "basis" },
  { id: "indexing", nl: "Indexen & rijen", en: "Indexing & arrays", level: "basis" },
  { id: "functions", nl: "Functies & teruggeven", en: "Functions & return values", level: "basis" },
  { id: "order", nl: "Volgorde van uitvoering", en: "Order of execution", level: "basis" },
  { id: "types", nl: "Types & typefouten", en: "Types & type errors", level: "basis" },
  { id: "errors", nl: "Fouten & uitzonderingen", en: "Errors & exceptions", level: "basis" },
  { id: "naming", nl: "Variabelenamen lezen", en: "Reading variable names", level: "basis" },

  { id: "oop", nl: "Klassen & objecten", en: "Classes & objects", level: "high" },
  { id: "inheritance", nl: "Overerving & polymorfisme", en: "Inheritance & polymorphism", level: "high" },
  { id: "abstraction", nl: "Abstractie & interfaces", en: "Abstraction & interfaces", level: "high" },
  { id: "recursion", nl: "Recursie", en: "Recursion", level: "high" },
  { id: "scope", nl: "Bereik & levensduur", en: "Scope & lifetime", level: "high" },
  { id: "references", nl: "Waarde of referentie", en: "Value vs reference", level: "high" },
  { id: "functional", nl: "Functies als waarden", en: "Functions as values", level: "high" },
  { id: "collections", nl: "Datastructuren gebruiken", en: "Using data structures", level: "high" },
  { id: "complexity", nl: "Complexiteit", en: "Complexity", level: "high" },
  { id: "async", nl: "Asynchrone code", en: "Asynchronous code", level: "high" },

  { id: "bits", nl: "Bits & bitbewerkingen", en: "Bits & bitwise operations", level: "low" },
  { id: "overflow", nl: "Overloop & bereik", en: "Overflow & range", level: "low" },
  { id: "arith", nl: "Gehele deling & rest", en: "Integer division & remainder", level: "low" },
  { id: "floats", nl: "Kommagetallen", en: "Floating point", level: "low" },
  { id: "chars", nl: "Tekens & codering", en: "Characters & encoding", level: "low" },
  { id: "pointers", nl: "Wijzers & adressen", en: "Pointers & addresses", level: "low" },
  { id: "memory", nl: "Geheugen: stapel & hoop", en: "Memory: stack & heap", level: "low" },
  { id: "compile", nl: "Compileren & koppelen", en: "Compiling & linking", level: "low" },

  { id: "selectors", nl: "CSS-selectors", en: "CSS selectors", level: "web" },
  { id: "boxmodel", nl: "Boxmodel & lay-out", en: "Box model & layout", level: "web" },
  { id: "cascade", nl: "De cascade", en: "The cascade", level: "web" },
  { id: "html", nl: "HTML-structuur", en: "HTML structure", level: "web" },

  { id: "sqlquery", nl: "SQL: opvragen & filteren", en: "SQL: querying & filtering", level: "data" },
  { id: "sqljoin", nl: "SQL: tabellen koppelen", en: "SQL: joining tables", level: "data" },

  { id: "aloud", nl: "Code voorlezen", en: "Reading code aloud", level: "taal" },
];

export const CONCEPT_BY_ID = new Map(CONCEPTS.map((c) => [c.id, c]));

/** Concepts for the questions written before the `concept` field existed. */
export const CONCEPT_OF: Record<string, string> = {
  "java-som": "loops",
  "java-volgorde": "order",
  "java-index": "indexing",
  "java-methode": "oop",
  "java-eigenschap": "oop",
  "java-return": "functions",
  "java-null": "errors",
  "java-typefout": "types",
  "java-grens": "indexing",
  "java-erven": "inheritance",
  "java-while": "loops",
  "java-voorwaarde": "conditions",
  "css-p": "selectors",
  "css-klasse": "selectors",
  "css-id": "selectors",
  "css-nest": "selectors",
  "css-padding": "boxmodel",
  "css-hover": "selectors",
  "css-flex": "boxmodel",
  "css-media": "boxmodel",
  "html-lijst": "html",
  "html-form": "html",
  "py-len": "collections",
  "py-lus": "loops",
  "py-inspringen": "errors",
  "py-functie": "functions",
  "sql-where": "sqlquery",
  "sql-count": "sqlquery",
  "sql-order": "sqlquery",
  "sql-join": "sqljoin",
  "order-rekenen": "order",
  "order-python": "order",
  "order-lus": "loops",
  "order-css": "cascade",
  "order-voorwaarde": "conditions",
  "order-recursie": "recursion",
  "naam-teller": "naming",
  "naam-gemiddelde": "naming",
  "naam-gevonden": "naming",
  "naam-grootste": "naming",
  "naam-hulp": "naming",
  "naam-vorige": "naming",
  "naam-samenstelling": "naming",
  "naam-boolean": "naming",
  "naam-teller-breuk": "naming",
  "naam-pogingen": "naming",
  "naam-knoop": "naming",
  "naam-python-totaal": "naming",
  "lees-kleiner": "aloud",
  "lees-punt": "aloud",
  "lees-toewijzing": "aloud",
  "lees-niet-gelijk": "aloud",
  "lees-logisch": "aloud",
  "lees-index": "aloud",
  "lees-mail": "aloud",
  "lees-komma": "aloud",
  "lees-getal": "aloud",
  "lees-underscore": "aloud",
};
