import { bareNoun, type Term } from "./types";
import { OPGAVE_UNITS } from "./vocab-opgave";

/**
 * Real assignments, to be read the way she will meet them: in Dutch, in the
 * lecturer's own wording. Every hard word can be tapped for its meaning, each
 * paragraph has an English version to check against, and a summary spells out
 * what the text is actually asking her to build.
 */
export interface Block {
  nl: string;
  en: string;
  /** Rendered as a bullet point. */
  bullet?: boolean;
}

export interface Section {
  heading: string;
  headingEn: string;
  blocks: Block[];
}

export interface ClassSpec {
  name: string;
  fields: string[];
  /** What the constructor takes. */
  ctor: string;
  methods: string[];
  /** The sentence in the text that is easy to misread. */
  watch?: string;
}

export interface Assignment {
  id: string;
  title: string;
  titleEn: string;
  /** What kind of task this is, in one line. */
  about: string;
  sections: Section[];
  /** What the text asks for, class by class — a check on her own reading. */
  summary: ClassSpec[];
  /** Vocabulary unit, sentence unit and question set that go with it. */
  wordsUnit: string;
  sentencesUnit: string;
  questionsUnit: string;
}

export const ASSIGNMENTS: Assignment[] = [
  {
    id: "bibliotheek",
    title: "De bibliotheek",
    titleEn: "The library",
    about: "A first-year Java assignment on classes, objects and collections — in the wording a lecturer really uses.",
    wordsUnit: "opgavetaal",
    sentencesUnit: "zin-opgave",
    questionsUnit: "code-opgave",
    sections: [
      {
        heading: "Inleiding",
        headingEn: "Introduction",
        blocks: [
          {
            nl: "In volgende oefening gaan we een bibliotheek simuleren, waar boeken kunnen ontleend worden voor een bepaalde tijd. We houden het relatief eenvoudig: de bibliotheek bevat alleen boeken, dus geen tijdschriften of video's. Om een boek te kunnen ontlenen moet men uiteraard lid zijn.",
            en: "In the following exercise we are going to simulate a library, where books can be borrowed for a certain time. We keep it relatively simple: the library contains only books, so no magazines or videos. To be able to borrow a book one obviously has to be a member.",
          },
          {
            nl: "In wat volgt gaan we de nodige klassen één voor één beschrijven. Uit het bovenstaande blijkt dat we leden zullen hebben die boeken ontlenen. Om alles in goede banen te leiden moeten alle bibliotheekbewerkingen gebeuren aan de balie.",
            en: "In what follows we describe the necessary classes one by one. From the above it is clear that we will have members who borrow books. To keep everything running smoothly, all library operations must take place at the desk.",
          },
        ],
      },
      {
        heading: "De klasse Lid",
        headingEn: "The class Lid (member)",
        blocks: [
          {
            nl: "Van een lid houden we de naam, het adres en de gemeente bij. De gegevens worden als String bijgehouden.",
            en: "For a member we keep track of the name, the address and the municipality. The data is stored as Strings.",
          },
          {
            nl: "Het adres en de gemeente moeten kunnen gewijzigd worden.",
            en: "It must be possible to change the address and the municipality.",
            bullet: true,
          },
          {
            nl: "Een object van deze klasse wordt gemaakt aan de hand van een 3-argumenten-constructor.",
            en: "An object of this class is created using a constructor with three arguments.",
            bullet: true,
          },
          { nl: "De klasse heeft ook een toString-methode.", en: "The class also has a toString method.", bullet: true },
        ],
      },
      {
        heading: "De klasse Boek",
        headingEn: "The class Boek (book)",
        blocks: [
          {
            nl: "Van een boek wordt de titel, de auteur en het ISBN-nummer telkens als String bijgehouden. Ieder boek heeft een uniek identificatienummer dat als een gewone integer wordt bijgehouden. Het is namelijk mogelijk dat we meerdere exemplaren van een boek in bezit hebben: deze exemplaren onderscheiden zich van elkaar via het identificatienummer. Een laatste belangrijk veld houdt de status van een boek bij: ofwel is het boek aanwezig, ofwel niet.",
            en: "For a book the title, the author and the ISBN number are each stored as a String. Every book has a unique identification number that is stored as a plain integer. It is in fact possible that we own several copies of one book: these copies are told apart by the identification number. A last important field keeps track of the status of a book: either the book is available, or it is not.",
          },
          {
            nl: "Om een Boek-object te creëren gebruiken we een 4-argumenten-constructor.",
            en: "To create a Boek object we use a constructor with four arguments.",
            bullet: true,
          },
          {
            nl: "Het moet uiteraard mogelijk zijn om de status van het boek te wijzigen, alle andere velden blijven onveranderd na de creatie van het object.",
            en: "It must of course be possible to change the status of the book; all other fields remain unchanged after the object is created.",
            bullet: true,
          },
          { nl: "Schrijf een toString-methode.", en: "Write a toString method.", bullet: true },
        ],
      },
      {
        heading: "De klasse Ontlening",
        headingEn: "The class Ontlening (loan)",
        blocks: [
          {
            nl: "In de klasse Ontlening houden we bij, welk lid, welk boek heeft ontleend. Om de complexiteit niet nodeloos aan te zwengelen, houden we voorlopig de datum waarop dat gebeurde niet bij.",
            en: "In the class Ontlening we keep track of which member has borrowed which book. So as not to increase the complexity needlessly, for now we do not store the date on which that happened.",
          },
          {
            nl: "Een Ontlening-object wordt gecreëerd aan de hand van een 2-argumenten-constructor.",
            en: "An Ontlening object is created using a constructor with two arguments.",
            bullet: true,
          },
          { nl: "Schrijf een toString-methode.", en: "Write a toString method.", bullet: true },
        ],
      },
      {
        heading: "De klasse Balie",
        headingEn: "The class Balie (desk)",
        blocks: [
          {
            nl: "Aangezien alle bewerkingen aan de balie dienen te gebeuren zal deze klasse ingewikkelder zijn dan de voorgaande. De balie houdt alle boeken, leden en ontleningen bij. Gebruik containers om deze objecten bij te houden.",
            en: "Since all operations have to take place at the desk, this class will be more complicated than the previous ones. The desk keeps track of all books, members and loans. Use containers to keep track of these objects.",
          },
          {
            nl: "Een Balie-object wordt gemaakt aan de hand van een 0-argumenten-constructor.",
            en: "A Balie object is created using a constructor with no arguments.",
            bullet: true,
          },
          { nl: "Volgende methoden worden in de klasse Balie gemaakt:", en: "The following methods are made in the class Balie:" },
          {
            nl: "toevoegenBoek waarbij een Boek-object als parameter wordt meegegeven; het boek wordt aan de betreffende container toegevoegd.",
            en: "toevoegenBoek, where a Boek object is passed as a parameter; the book is added to the relevant container.",
            bullet: true,
          },
          {
            nl: "toevoegenLid waarbij een Lid-object als parameter wordt meegegeven; het lid wordt aan de betreffende container toegevoegd.",
            en: "toevoegenLid, where a Lid object is passed as a parameter; the member is added to the relevant container.",
            bullet: true,
          },
          {
            nl: "ontleen waarbij een boek en een lid als parameter worden meegegeven; er wordt een Ontlening-object aangemaakt en in de betreffende container gestopt; indien het boek reeds uitgeleend was, geef dan een passende foutmelding; vergeet ook niet de status van het boek aan te passen.",
            en: "ontleen, where a book and a member are passed as parameters; an Ontlening object is created and put in the relevant container; if the book was already lent out, give an appropriate error message; also don't forget to update the status of the book.",
            bullet: true,
          },
          {
            nl: "brengTerug waarbij het id van het uitgeleend boek als parameter wordt meegegeven; vergeet niet de status van het boek aan te passen, en ook het overeenkomstige Ontlening-object te verwijderen uit de betreffende container.",
            en: "brengTerug, where the id of the lent-out book is passed as a parameter; don't forget to update the status of the book, and also to remove the corresponding Ontlening object from the relevant container.",
            bullet: true,
          },
          {
            nl: "printOverzichtGeleendeBoeken geeft een overzicht van alle geleende boeken op het scherm.",
            en: "printOverzichtGeleendeBoeken prints an overview of all borrowed books on the screen.",
            bullet: true,
          },
          {
            nl: "printOverzichtAanwezigeBoeken geeft een overzicht van alle aanwezige boeken op het scherm.",
            en: "printOverzichtAanwezigeBoeken prints an overview of all available books on the screen.",
            bullet: true,
          },
          {
            nl: "printOntleendeBoekenVanPersoon waarbij de naam van het lid als parameter wordt meegegeven; de methode geeft alle boeken die het lid ontleend heeft op het scherm.",
            en: "printOntleendeBoekenVanPersoon, where the name of the member is passed as a parameter; the method prints all books the member has borrowed on the screen.",
            bullet: true,
          },
        ],
      },
      {
        heading: "De klasse Applicatie",
        headingEn: "The class Applicatie (application)",
        blocks: [
          {
            nl: "Zoals gewoonlijk gebruiken we deze klasse om de bovenstaande klassen uit te testen. We schrijven één enkele methode, namelijk main, waarin we het volgende doen:",
            en: "As usual we use this class to test out the classes above. We write one single method, namely main, in which we do the following:",
          },
          { nl: "eerst maken we een tiental boeken aan", en: "first we create about ten books", bullet: true },
          { nl: "daarna een achttal leden", en: "after that about eight members", bullet: true },
          {
            nl: "na het aanmaken van het Balie-object worden de leden en de boeken toegevoegd",
            en: "after the Balie object has been created, the members and the books are added",
            bullet: true,
          },
          {
            nl: "daarna doen we een aantal ontleningen en geven vervolgens op het scherm een overzicht van de geleende boeken en de niet geleende boeken",
            en: "after that we do a number of loans and then print an overview of the borrowed books and the books not borrowed",
            bullet: true,
          },
          { nl: "vervolgens laten we een aantal boeken terugbrengen", en: "next we have a number of books returned", bullet: true },
          {
            nl: "tenslotte geven we een overzicht van de geleende boeken, de aanwezige boeken in de bibliotheek",
            en: "finally we give an overview of the borrowed books and the books available in the library",
            bullet: true,
          },
          {
            nl: "om af te sluiten geven we alle geleende boeken van een bepaald lid weer op het scherm",
            en: "to finish we display all borrowed books of a particular member on the screen",
            bullet: true,
          },
        ],
      },
    ],
    summary: [
      {
        name: "Lid",
        fields: ["naam (String)", "adres (String)", "gemeente (String)"],
        ctor: "three parameters: naam, adres, gemeente",
        methods: ["setters for adres and gemeente only", "toString"],
        watch: "'Moeten kunnen gewijzigd worden' names only adres and gemeente — so naam gets no setter.",
      },
      {
        name: "Boek",
        fields: ["titel (String)", "auteur (String)", "ISBN-nummer (String)", "identificatienummer (int)", "status: aanwezig or not"],
        ctor: "four parameters, although there are five fields — the status is not passed in: a new book is present",
        methods: ["a way to change the status only", "toString"],
        watch: "'Alle andere velden blijven onveranderd' — no setters for titel, auteur, ISBN or id.",
      },
      {
        name: "Ontlening",
        fields: ["the Lid who borrowed", "the Boek that was borrowed"],
        ctor: "two parameters: the member and the book",
        methods: ["toString"],
        watch: "'Voorlopig … niet bij' — do NOT add a date field.",
      },
      {
        name: "Balie",
        fields: ["a container of Boek objects", "a container of Lid objects", "a container of Ontlening objects"],
        ctor: "no parameters",
        methods: [
          "toevoegenBoek(Boek)",
          "toevoegenLid(Lid)",
          "ontleen(Boek, Lid) — error message if already lent out, otherwise create the loan and set the status",
          "brengTerug(int id) — set the status back and remove the matching loan",
          "printOverzichtGeleendeBoeken()",
          "printOverzichtAanwezigeBoeken()",
          "printOntleendeBoekenVanPersoon(String naam)",
        ],
        watch: "'De betreffende container' — each object goes into the list of its own kind.",
      },
      {
        name: "Applicatie",
        fields: [],
        ctor: "none asked",
        methods: ["only main, with seven steps in the order the text gives them"],
        watch: "'Een tiental' and 'een achttal' are approximate: about ten books, about eight members.",
      },
    ],
  },
];

export const ASSIGNMENT_BY_ID = new Map(ASSIGNMENTS.map((a) => [a.id, a]));

/* ----------------------------------------------------------------- glossary */

export interface GlossEntry {
  /** Dictionary form, shown as the headword. */
  nl: string;
  en: string;
  def?: string;
  note?: string;
  /** Every shape that should be recognised in running text. */
  forms: string[];
}

/** Ordinary words in the text that are not worth a flashcard but may still need a gloss. */
const EXTRA: GlossEntry[] = [
  { nl: "de klasse", en: "the class", forms: ["klasse", "klassen"] },
  { nl: "de methode", en: "the method", forms: ["methode", "methoden", "methodes"] },
  { nl: "de parameter", en: "the parameter", forms: ["parameter", "parameters"] },
  { nl: "het object", en: "the object", forms: ["object", "objecten"] },
  { nl: "de integer", en: "the integer (a whole number)", forms: ["integer"] },
  { nl: "het adres", en: "the address", forms: ["adres"] },
  { nl: "bevatten", en: "to contain", forms: ["bevat", "bevatten"] },
  { nl: "beschrijven", en: "to describe", forms: ["beschrijven"] },
  { nl: "bepaald", en: "certain / particular", forms: ["bepaald", "bepaalde"] },
  { nl: "mogelijk", en: "possible", forms: ["mogelijk"] },
  { nl: "meerdere", en: "several / more than one", forms: ["meerdere"] },
  { nl: "belangrijk", en: "important", forms: ["belangrijk"] },
  { nl: "nodig", en: "necessary", forms: ["nodige"] },
  { nl: "gewoon", en: "ordinary / plain", forms: ["gewone"] },
  { nl: "relatief", en: "relatively", forms: ["relatief"] },
  { nl: "waarbij", en: "where / in which", forms: ["waarbij"] },
  { nl: "waarin", en: "in which", forms: ["waarin"] },
  { nl: "waarop", en: "on which", forms: ["waarop"] },
  { nl: "vergeten", en: "to forget", forms: ["vergeet"] },
  { nl: "laten", en: "to let / to have something done", forms: ["laten"] },
  { nl: "zullen", en: "will / shall", forms: ["zullen", "zal"] },
];

function fromTerm(term: Term): GlossEntry {
  const base = bareNoun(term.nl).toLowerCase();
  return {
    nl: term.nl,
    en: term.en,
    def: term.def,
    note: term.note,
    forms: [...new Set([base, ...(term.forms ?? []).map((f) => f.toLowerCase())])],
  };
}

/** The glossary for assignment texts: the assignment-language unit plus everyday extras. */
export function assignmentGlossary(): GlossEntry[] {
  const unit = OPGAVE_UNITS.find((u) => u.id === "opgavetaal");
  return [...(unit?.terms ?? []).map(fromTerm), ...EXTRA];
}

export interface Piece {
  text: string;
  entry?: GlossEntry;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Split running text into plain pieces and glossary words. Longer forms win
 * ("aan de hand van" before "aan"), matching is case-insensitive, and a form
 * only counts as a whole word — "lid" does not light up inside "geldig".
 */
export function annotate(text: string, entries: GlossEntry[]): Piece[] {
  const byForm = new Map<string, GlossEntry>();
  for (const e of entries) for (const f of e.forms) if (!byForm.has(f.toLowerCase())) byForm.set(f.toLowerCase(), e);
  const forms = [...byForm.keys()].sort((a, b) => b.length - a.length);
  if (forms.length === 0) return [{ text }];

  // No lookbehind (older Safari): capture the character before the word instead.
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${forms.map(escape).join("|")})(?![\\p{L}\\p{N}])`, "giu");
  const out: Piece[] = [];
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const start = m.index + m[1].length;
    if (start > last) out.push({ text: text.slice(last, start) });
    out.push({ text: m[2], entry: byForm.get(m[2].toLowerCase()) });
    last = start + m[2].length;
    // Let the next match reuse this word's trailing boundary.
    re.lastIndex = last;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
