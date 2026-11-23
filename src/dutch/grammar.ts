import type { Example } from "./types";

/**
 * A compact grammar reference — the dozen rules that explain most of what goes
 * wrong for an English speaker, with examples taken from class and from code
 * rather than from "the cat sits on the mat".
 */
export interface GrammarTopic {
  id: string;
  title: string;
  titleEn: string;
  /** One sentence: the rule itself. */
  summary: string;
  points: string[];
  examples: Example[];
}

export const GRAMMAR: GrammarTopic[] = [
  {
    id: "de-het",
    title: "De of het?",
    titleEn: "The two words for 'the'",
    summary:
      "Every noun is a de-word or a het-word. About three quarters are de-words, so when you truly have to guess, guess 'de'.",
    points: [
      "Always het: diminutives ending in -je (het haakje, het sterretje, het streepje), verbs used as nouns (het programmeren, het debuggen), languages (het Nederlands), most words starting with ge-, be-, ver- that have no ending (het geheugen, het bestand, het verslag).",
      "Always de: all plurals (het bestand → de bestanden), people (de student, de prof), words ending in -ing, -heid, -teit, -tie, -ie (de verbinding, de nauwkeurigheid, de complexiteit, de functie, de recursie).",
      "It matters beyond the article: it also decides 'deze/die' (de-words) versus 'dit/dat' (het-words), and the ending of adjectives.",
      "Learn every noun together with its article — that is why this course always shows them attached.",
    ],
    examples: [
      { nl: "de functie → deze functie", en: "the function → this function" },
      { nl: "het bestand → dit bestand", en: "the file → this file" },
      { nl: "het bestand → de bestanden", en: "the file → the files (plural is always 'de')" },
    ],
  },
  {
    id: "v2",
    title: "Het werkwoord op plaats twee",
    titleEn: "The verb comes second",
    summary:
      "In a main clause the conjugated verb is always the second element. If anything other than the subject starts the sentence, the subject moves behind the verb.",
    points: [
      "Normal order: subject – verb – rest.",
      "Start with a time, place or object and the verb still stays second, so subject and verb swap (inversion).",
      "This is the single most audible mistake English speakers make: 'Morgen ik dien in' is wrong.",
    ],
    examples: [
      { nl: "Ik dien de opdracht morgen in.", en: "I hand in the assignment tomorrow." },
      { nl: "Morgen dien ik de opdracht in.", en: "Tomorrow I hand in the assignment. (verb second, then subject)" },
      { nl: "In deze lus gebruiken we een teller.", en: "In this loop we use a counter." },
    ],
  },
  {
    id: "bijzin",
    title: "De bijzin: werkwoord achteraan",
    titleEn: "Subordinate clauses: verb at the end",
    summary:
      "After words like omdat, dat, als, wanneer, terwijl, zodat, of — the verb goes to the very end of that clause.",
    points: [
      "Main clause: 'Het programma crasht.' Subordinate: '… omdat het programma crasht.' Same words, verb last.",
      "With two verbs, both go to the end: '… omdat ik de opdracht moet indienen.'",
      "'Want' (because) is the exception: it keeps normal order. 'Omdat' sends the verb to the end.",
      "Technical explanations are full of these: 'als de lijst leeg is', 'zodat de lus stopt', 'terwijl de server wacht'.",
    ],
    examples: [
      { nl: "Het werkt niet, omdat de lijst leeg is.", en: "It doesn't work because the list is empty." },
      { nl: "Het werkt niet, want de lijst is leeg.", en: "It doesn't work, for the list is empty. ('want' keeps normal order)" },
      { nl: "Ik denk dat de fout op regel twaalf zit.", en: "I think the bug is on line twelve." },
    ],
  },
  {
    id: "scheidbaar",
    title: "Scheidbare werkwoorden",
    titleEn: "Separable verbs",
    summary:
      "Many verbs are a prefix plus a verb — and in a main clause the prefix breaks off and goes to the end. Half of all programming verbs work this way.",
    points: [
      "opslaan → Ik sla het bestand op. uitvoeren → Het voert de code uit. aanroepen, teruggeven, toewijzen, samenvoegen, indienen, uitleggen, nakijken, vastlopen, inloggen, afdrukken.",
      "Perfect tense: 'ge' goes between the halves — opgeslagen, uitgevoerd, ingediend, vastgelopen.",
      "After a modal verb, or in a subordinate clause, the verb stays in one piece at the end: 'Je moet het opslaan.' '… omdat het vastloopt.'",
      "With 'te': the halves split around it — 'om het bestand op te slaan'.",
      "Listening tip: a Dutch sentence is not finished until the last word. 'Ik voer de test …' could still end in 'uit' (run) or 'in' (enter).",
    ],
    examples: [
      { nl: "De functie geeft nul terug.", en: "The function returns zero." },
      { nl: "De functie heeft nul teruggegeven.", en: "The function has returned zero." },
      { nl: "Vergeet niet het bestand op te slaan.", en: "Don't forget to save the file." },
    ],
  },
  {
    id: "niet-geen",
    title: "Niet of geen?",
    titleEn: "Two ways to say 'not'",
    summary:
      "'Geen' negates a noun that would otherwise have 'een' or no article. 'Niet' negates everything else.",
    points: [
      "geen = not a / not any / no: 'Ik heb geen laptop.' 'Er is geen fout.'",
      "niet = not: 'Het werkt niet.' 'Ik begrijp het niet.' 'De lijst is niet leeg.'",
      "'Niet' usually comes late in the clause — after the object, before an adjective or a preposition.",
    ],
    examples: [
      { nl: "De functie heeft geen parameters.", en: "The function has no parameters." },
      { nl: "De functie werkt niet.", en: "The function doesn't work." },
      { nl: "Dat is geen fout, dat is een waarschuwing.", en: "That's not an error, that's a warning." },
    ],
  },
  {
    id: "meervoud",
    title: "Meervoud",
    titleEn: "Plurals: -en or -s",
    summary: "Most nouns add -en. Words ending in an unstressed -el, -er, -en, -je, or a vowel add -s.",
    points: [
      "-en: het bestand → bestanden, de lus → lussen, de fout → fouten, de rij → rijen. Spelling keeps the vowel sound: de boom → bomen, de klas → klassen.",
      "-s: de tabel → tabellen is an exception, but de parameter → parameters, de computer → computers, het haakje → haakjes.",
      "After a vowel: apostrophe-s — de dia → dia's, de query → query's.",
      "A few change more: het kind → kinderen, het blad → bladeren (but tree leaves in a data structure: 'de bladeren').",
      "The plural is always a de-word.",
    ],
    examples: [
      { nl: "één variabele, twee variabelen", en: "one variable, two variables" },
      { nl: "één server, twee servers", en: "one server, two servers" },
      { nl: "één knoop, twee knopen", en: "one node, two nodes" },
    ],
  },
  {
    id: "modaal",
    title: "Moeten, kunnen, mogen, willen",
    titleEn: "Modal verbs",
    summary: "The modal verb is conjugated and takes position two; the real verb goes to the end as a whole infinitive.",
    points: [
      "moeten = must / have to. kunnen = can / be able. mogen = may / be allowed. willen = want. zullen = will / shall.",
      "'Mogen' versus 'kunnen' matters in class: 'Mag ik iets vragen?' asks permission; 'Kan ik dat?' asks about ability.",
      "'Niet moeten' is softer in Flanders than you'd think: 'Je moet dat niet doen' often means 'you don't have to', not 'you must not'.",
      "Present forms to know cold: ik moet / kan / mag / wil, wij moeten / kunnen / mogen / willen.",
    ],
    examples: [
      { nl: "We moeten de opdracht vrijdag indienen.", en: "We have to hand in the assignment on Friday." },
      { nl: "Mag ik een rekenmachine gebruiken?", en: "May I use a calculator?" },
      { nl: "Je kunt die lus korter schrijven.", en: "You can write that loop more concisely." },
    ],
  },
  {
    id: "voltooid",
    title: "De voltooide tijd",
    titleEn: "The perfect tense",
    summary: "hebben or zijn + a participle (usually ge-…-d/-t or ge-…-en) at the end. Spoken Dutch uses it for most of the past.",
    points: [
      "Regular: werken → gewerkt, testen → getest, compileren → gecompileerd, opslaan → opgeslagen (irregular root, 'ge' in the middle).",
      "Verbs starting with be-, ver-, ge-, ont- take no extra ge-: begrijpen → begrepen, vergeten → vergeten, verwijderen → verwijderd.",
      "Movement or change of state takes 'zijn': 'Het programma is vastgelopen.' 'Ik ben geslaagd.' 'De build is mislukt.'",
      "Everything else takes 'hebben': 'Ik heb de fout gevonden.'",
    ],
    examples: [
      { nl: "Ik heb de opdracht ingediend.", en: "I have handed in the assignment." },
      { nl: "De server is gecrasht.", en: "The server has crashed." },
      { nl: "Heb je de code al getest?", en: "Have you tested the code yet?" },
    ],
  },
  {
    id: "getallen",
    title: "Getallen en de klok",
    titleEn: "Numbers and the clock",
    summary: "From 21 to 99 Dutch says the units first, and 'half' on the clock looks forward to the next hour.",
    points: [
      "vierentwintig = four-and-twenty = 24. When noting a number, write the last digit you hear first.",
      "half acht = 7:30 (halfway TO eight). kwart voor acht = 7:45. kwart over acht = 8:15.",
      "Decimals use a comma: 3,14 is 'drie komma veertien'. Thousands use a dot or a space: 1.000.",
      "Marks are out of twenty: 'tien op twintig' is a pass.",
    ],
    examples: [
      { nl: "De fout zit op regel zevenendertig.", en: "The bug is on line thirty-seven." },
      { nl: "Het examen begint om half negen.", en: "The exam starts at half past eight (8:30)." },
    ],
  },
  {
    id: "je-u",
    title: "Je, jij of u?",
    titleEn: "Informal and formal 'you'",
    summary: "'Je/jij' with fellow students and friends; 'u' with professors, staff and strangers until they switch first.",
    points: [
      "'Jij' is the stressed form of 'je' — use it for contrast: 'Ik doe de tests, jij doet het verslag.'",
      "'U' takes the verb form of 'hij': 'Kunt u dat herhalen?' — though 'Kan u …?' is very common in Flanders.",
      "Flanders also has 'ge/gij' in everyday speech: 'Hebt ge dat gezien?' Understand it; you don't need to use it.",
      "In e-mail to staff: u, uw — 'Alvast bedankt voor uw antwoord.'",
    ],
    examples: [
      { nl: "Kun je me helpen?", en: "Can you help me? (to a classmate)" },
      { nl: "Kunt u mij helpen?", en: "Could you help me? (to a professor)" },
    ],
  },
  {
    id: "bijvoeglijk",
    title: "De -e van het bijvoeglijk naamwoord",
    titleEn: "The adjective ending",
    summary: "An adjective before a noun gets -e — except before a het-word with 'een', 'geen' or no article.",
    points: [
      "de-word: de lege lijst, een lege lijst. Always -e.",
      "het-word with 'het': het lege bestand. With 'een': een leeg bestand. No -e.",
      "After the noun there is never an -e: 'De lijst is leeg.'",
      "Fixed technical terms sometimes drop it anyway — 'het virtueel geheugen', 'het uitvoerbaar bestand' — both forms are accepted.",
    ],
    examples: [
      { nl: "een nieuwe variabele / een nieuw bestand", en: "a new variable (de) / a new file (het)" },
      { nl: "de tijdelijke variabele / het tijdelijke bestand", en: "the temporary variable / the temporary file" },
    ],
  },
  {
    id: "vlaams",
    title: "Vlaams versus Nederlands-Nederlands",
    titleEn: "Flemish versus Netherlands Dutch",
    summary: "One written standard, two spoken flavours. Your textbook app teaches the northern one; your classmates speak the southern one.",
    points: [
      "Sound: the Flemish g is soft, r is rolled at the front, and vowels are purer. It is generally the easier accent to understand.",
      "Diminutives in speech often end in -ke: written 'een momentje', spoken 'e momentke'.",
      "Words: labo, uurrooster, unief, gsm, frigo, kot, goesting, plezant, ambetant, seffens, een tas koffie (a cup — in the Netherlands a 'tas' is a bag).",
      "French loans are normal: merci, ça va, salut, voilà, allez.",
      "In class you will hear 'tussentaal' — an informal in-between Flemish. Slides and exams are in standard Dutch.",
    ],
    examples: [
      { nl: "Hebt ge efkes tijd?", en: "Have you got a moment? (spoken Flemish)" },
      { nl: "Heb je even tijd?", en: "Have you got a moment? (standard Dutch)" },
    ],
  },
];
