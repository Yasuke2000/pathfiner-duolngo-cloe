import type { Term, Unit } from "./types";

/**
 * Whole sentences.
 *
 * Words alone don't get you through a lab session: you have to produce a full
 * Dutch sentence about your own code, or ask for help without switching to
 * English. These are drilled by building them from a word bank and by typing
 * them out, in both directions.
 */
const s = (nl: string, en: string, extra: Partial<Term> = {}): Term => ({
  kind: "sentence",
  nl,
  en,
  ...extra,
});

export const SENTENCE_UNITS: Unit[] = [
  {
    id: "zin-code",
    title: "Zinnen: over code praten",
    subtitle: "Talking about your own code",
    blurb: "Say what your program does, what broke, and what you'll do about it.",
    accent: "255 70% 68%",
    track: "cs",
    terms: [
      s("De functie geeft een geheel getal terug.", "The function returns an integer."),
      s("Deze lus loopt over alle elementen van de lijst.", "This loop goes over all the elements of the list."),
      s("De compiler geeft een fout op regel twaalf.", "The compiler gives an error on line twelve."),
      s("Ik krijg een foutmelding bij het compileren.", "I get an error message when compiling."),
      s("Het programma crasht als de lijst leeg is.", "The program crashes when the list is empty."),
      s("De variabele is nog niet geïnitialiseerd.", "The variable hasn't been initialised yet."),
      s("De index begint bij nul, niet bij één.", "The index starts at zero, not at one."),
      s("De lus stopt zodra de voorwaarde onwaar is.", "The loop stops as soon as the condition is false."),
      s("De functie roept zichzelf opnieuw aan.", "The function calls itself again."),
      s("Zonder basisgeval blijft de recursie doorgaan.", "Without a base case the recursion keeps going."),
      s("Dit algoritme heeft een complexiteit van n log n.", "This algorithm has a complexity of n log n."),
      s("In het slechtste geval doorlopen we de hele lijst.", "In the worst case we go through the whole list."),
      s("Deze klasse erft van de abstracte klasse.", "This class inherits from the abstract class."),
      s("Die methode overschrijft de methode van de ouderklasse.", "That method overrides the parent class's method."),
      s("We slaan het resultaat op in een tijdelijke variabele.", "We store the result in a temporary variable."),
      s("Je moet het geheugen vrijgeven na gebruik.", "You have to free the memory after use."),
      s("De server stuurt een foutmelding terug.", "The server sends back an error message."),
      s("De databank bevat meer dan duizend rijen.", "The database contains more than a thousand rows."),
      s("Deze query vraagt alleen de namen op.", "This query only requests the names."),
      s("De test faalt op mijn machine.", "The test fails on my machine."),
      s("De build duurt bijna vijf minuten.", "The build takes almost five minutes."),
      s("We moeten die code herstructureren.", "We have to refactor that code."),
      s("Kun je mijn code eens nakijken?", "Could you review my code?"),
      s("Ik heb de fout gevonden.", "I found the bug."),
      s("Dat is een kwestie van prestaties, niet van correctheid.", "That's a matter of performance, not correctness."),
      s("De parameter mag niet leeg zijn.", "The parameter must not be empty."),
      s("Ik moet die tak nog samenvoegen met de hoofdtak.", "I still have to merge that branch into the main branch."),
      s("Er is een conflict in dat bestand.", "There's a conflict in that file."),
    ],
  },
  {
    id: "zin-les",
    title: "Zinnen: in de les & het groepswerk",
    subtitle: "Asking for help, working in a team",
    blurb: "The sentences that keep you in the conversation instead of nodding along.",
    accent: "40 80% 60%",
    track: "life",
    terms: [
      s("Kun je dat nog eens uitleggen?", "Could you explain that again?"),
      s("Sorry, ik heb het niet goed verstaan.", "Sorry, I didn't quite catch that.", {
        note: "'Verstaan' is hearing it; 'begrijpen' is understanding it. Flanders uses 'verstaan' a lot for both.",
      }),
      s("Kun je wat trager spreken, alsjeblieft?", "Could you speak a bit more slowly, please?"),
      s("Ik snap die oefening niet.", "I don't understand that exercise."),
      s("Wanneer moeten we dat indienen?", "When do we have to hand that in?"),
      s("Mag ik een vraag stellen over de opgave?", "May I ask a question about the problem?"),
      s("Staat dat op het examen?", "Is that on the exam?"),
      s("Ik was er vorige week niet bij.", "I wasn't there last week."),
      s("Heb jij de notities van vorige les?", "Do you have the notes from last class?"),
      s("Dat stond niet in de cursus.", "That wasn't in the course notes."),
      s("In welk lokaal is de oefeningenles?", "Which room is the exercise session in?"),
      s("De les begint om half negen.", "The class starts at half past eight.", {
        note: "Half negen = 8:30. Dutch counts half an hour BEFORE the hour.",
      }),
      s("Werken we in groepjes van twee?", "Are we working in pairs?"),
      s("Ik neem het verslag op mij.", "I'll take on the report."),
      s("Kunnen we morgen samen aan het project werken?", "Could we work on the project together tomorrow?"),
      s("Dat lukt me niet tegen vrijdag.", "I can't manage that by Friday."),
      s("Ik heb het niet op tijd af gekregen.", "I didn't get it finished in time."),
      s("Ik ben gebuisd voor dat examen.", "I failed that exam.", {
        note: "'Gebuisd' is Flemish. In the Netherlands: 'gezakt'.",
      }),
      s("Ik probeer het opnieuw in de tweede zit.", "I'll try again in the resit."),
      s("Hoe zeg je dat in het Nederlands?", "How do you say that in Dutch?"),
      s("Wat betekent dat woord precies?", "What does that word mean exactly?"),
      s("Ik spreek nog niet zo goed Nederlands, sorry.", "I don't speak Dutch that well yet, sorry."),
      s("Mag ik dat even opschrijven?", "May I write that down quickly?"),
      s("Zou je dat kunnen herhalen?", "Could you repeat that?"),
    ],
  },
];
