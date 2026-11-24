import type { Term, Unit } from "./types";

/**
 * The language of assignments and exam questions.
 *
 * A programming assignment in Dutch is written in its own register: passive
 * sentences ("wordt bijgehouden", "worden meegegeven"), formal connectives
 * ("indien", "reeds", "aangezien", "dienen te") and a handful of verbs that
 * each translate into a concrete piece of code — "bijhouden" is a field,
 * "wijzigen" is a setter, "meegeven" is a parameter, "op het scherm geven" is a
 * print statement. Knowing those is the difference between understanding the
 * task and guessing at it.
 *
 * The words here are taken from a real first-year Java assignment (see
 * assignments.ts); `forms` lists the shapes they take in the text, so the
 * reader can recognise and explain them in place.
 */
const s = (nl: string, en: string, extra: Partial<Term> = {}): Term => ({ kind: "sentence", nl, en, ...extra });

export const OPGAVE_UNITS: Unit[] = [
  {
    id: "opgavetaal",
    title: "Opgavetaal",
    subtitle: "The language of assignments",
    blurb: "Bijhouden is a field, wijzigen is a setter, meegeven is a parameter: decoding what a task asks.",
    accent: "48 85% 58%",
    track: "cs",
    terms: [
      // --- verbs that translate straight into code ---
      {
        nl: "bijhouden",
        en: "to keep track of / to store",
        def: "In an assignment this means: make a field for it. 'Van een lid houden we de naam bij' = the class Lid has a field naam.",
        note: "Separable: 'we houden de naam bij', 'de naam wordt bijgehouden', 'om de naam bij te houden'.",
        forms: ["bijgehouden", "bij te houden"],
        example: { nl: "De balie houdt alle boeken bij.", en: "The desk keeps track of all the books." },
      },
      {
        nl: "wijzigen",
        en: "to change / to modify",
        def: "If something 'moet kunnen gewijzigd worden', write a setter for it. If it may not change, write none.",
        forms: ["gewijzigd", "te wijzigen"],
      },
      {
        nl: "aanpassen",
        en: "to adjust / to update",
        def: "Changing a value that already exists, like setting the status of a book.",
        forms: ["aan te passen", "aangepast"],
      },
      {
        nl: "aanmaken",
        en: "to create",
        def: "Making a new object with 'new'.",
        note: "Separable: 'we maken tien boeken aan', 'er wordt een object aangemaakt'.",
        forms: ["aangemaakt", "aan te maken", "het aanmaken"],
      },
      { nl: "creëren", en: "to create", def: "The same as 'aanmaken': making a new object.", forms: ["gecreëerd", "te creëren"] },
      { nl: "de creatie", en: "the creation" },
      {
        nl: "meegeven",
        en: "to pass (along)",
        def: "What is 'als parameter meegegeven' becomes a parameter of the method or constructor.",
        forms: ["meegegeven", "mee te geven"],
        example: { nl: "Het boek wordt als parameter meegegeven.", en: "The book is passed as a parameter." },
      },
      {
        nl: "toevoegen",
        en: "to add",
        def: "Putting an object into a collection, usually with add().",
        forms: ["toegevoegd", "toe te voegen"],
      },
      {
        nl: "verwijderen",
        en: "to remove / to delete",
        def: "Taking an object out of a collection, usually with remove().",
        forms: ["verwijderd", "te verwijderen"],
      },
      {
        nl: "weergeven",
        en: "to display / to show",
        def: "Printing it, with System.out.println.",
        note: "Separable: 'we geven de boeken weer'.",
        forms: ["weergegeven", "weer te geven"],
      },
      {
        nl: "op het scherm",
        en: "on the screen",
        def: "'Op het scherm geven' is the standard way an assignment says: print it to the console.",
      },
      { nl: "het overzicht", en: "the overview / listing", def: "A printed list of all the items of some kind.", forms: ["overzicht"] },
      { nl: "uittesten", en: "to test out", forms: ["uit te testen"] },
      { nl: "simuleren", en: "to simulate" },
      { nl: "gebeuren", en: "to happen / to take place", forms: ["gebeurde", "te gebeuren"] },
      { nl: "blijken", en: "to turn out / to be apparent", note: "'Uit het bovenstaande blijkt dat…' = from the above it is clear that…", forms: ["blijkt"] },

      // --- nouns of the specification ---
      {
        nl: "de 3-argumenten-constructor",
        en: "the constructor with three arguments",
        def: "A constructor that takes exactly three parameters. A '0-argumenten-constructor' takes none.",
        forms: ["3-argumenten-constructor", "4-argumenten-constructor", "2-argumenten-constructor", "0-argumenten-constructor"],
      },
      {
        nl: "de toString-methode",
        en: "the toString method",
        def: "The method that returns the object as a piece of text, so it can be printed.",
        forms: ["toString-methode"],
      },
      {
        nl: "de container",
        en: "the container (collection)",
        def: "In a Java assignment: an object that holds other objects, such as an ArrayList.",
        note: "Not a Docker container here — context decides.",
        forms: ["container", "containers"],
      },
      { nl: "het veld", en: "the field", def: "A variable that belongs to an object: one of the things the class 'bijhoudt'.", forms: ["veld", "velden"] },
      { nl: "de status", en: "the status", forms: ["status"] },
      { nl: "het identificatienummer", en: "the identification number", forms: ["identificatienummer"] },
      { nl: "de bewerking", en: "the operation", forms: ["bewerking", "bewerkingen", "bibliotheekbewerkingen"] },
      { nl: "de foutmelding", en: "the error message", forms: ["foutmelding"] },
      { nl: "de gegevens", en: "the data", note: "Always plural: 'de gegevens worden bijgehouden'.", forms: ["gegevens"] },
      { nl: "de inleiding", en: "the introduction", forms: ["inleiding"] },
      { nl: "de oefening", en: "the exercise", forms: ["oefening"] },
      { nl: "de complexiteit", en: "the complexity", forms: ["complexiteit"] },

      // --- the library itself ---
      { nl: "de bibliotheek", en: "the library", forms: ["bibliotheek"] },
      {
        nl: "ontlenen",
        en: "to borrow",
        note: "Flemish. The Netherlands says 'lenen'. 'Ontleend' = borrowed; in the method names it is 'ontleen'.",
        forms: ["ontleend", "ontleende", "te ontlenen", "ontleen"],
      },
      { nl: "de ontlening", en: "the loan", def: "One record of who borrowed which book.", forms: ["ontlening", "ontleningen"] },
      { nl: "uitlenen", en: "to lend out", note: "'Het boek is uitgeleend' = the book is out on loan.", forms: ["uitgeleend"] },
      { nl: "lenen", en: "to borrow / to lend", forms: ["geleend", "geleende"] },
      { nl: "terugbrengen", en: "to bring back / to return", forms: ["terug te brengen", "teruggebracht"] },
      { nl: "het lid", en: "the member", note: "Irregular plural: 'de leden'.", forms: ["lid", "leden"] },
      { nl: "de balie", en: "the desk / counter", forms: ["balie"] },
      { nl: "het exemplaar", en: "the copy (of a book)", def: "One physical copy. Two copies of the same book share an ISBN but not an id.", forms: ["exemplaar", "exemplaren"] },
      { nl: "het tijdschrift", en: "the magazine", forms: ["tijdschriften"] },
      { nl: "de titel", en: "the title", forms: ["titel"] },
      { nl: "de auteur", en: "the author", forms: ["auteur"] },
      { nl: "de gemeente", en: "the municipality / town", forms: ["gemeente"] },
      { nl: "aanwezig", en: "present / available", def: "Here: the book is in the library and can be borrowed.", forms: ["aanwezige"] },
      { nl: "in bezit hebben", en: "to own / to have", forms: ["in bezit hebben"] },

      // --- small words that carry the logic ---
      { nl: "uniek", en: "unique" },
      { nl: "onveranderd", en: "unchanged", def: "If a field 'blijft onveranderd', it gets no setter." },
      { nl: "betreffende", en: "the relevant / the one concerned", note: "'De betreffende container' = the container that goes with it: books into the list of books." },
      { nl: "overeenkomstig", en: "corresponding", forms: ["overeenkomstige"] },
      { nl: "voorgaand", en: "preceding / previous", forms: ["voorgaande"] },
      { nl: "bovenstaand", en: "the above", forms: ["bovenstaande"] },
      { nl: "passend", en: "appropriate / suitable", forms: ["passende"] },
      { nl: "eenvoudig", en: "simple" },
      { nl: "ingewikkeld", en: "complicated", forms: ["ingewikkelder"] },
      { nl: "aan de hand van", en: "by means of / using" },
      { nl: "een tiental", en: "about ten", note: "The ending -tal makes a rough number: een tiental, een achttal, een twintigtal.", forms: ["tiental", "achttal"] },
      { nl: "een aantal", en: "a number of / several", forms: ["een aantal"] },
      { nl: "één enkele", en: "one single" },
      { nl: "uiteraard", en: "of course / obviously" },
      { nl: "namelijk", en: "namely / that is" },
      { nl: "telkens", en: "each time" },
      { nl: "ofwel", en: "either … or", note: "Used in pairs: 'ofwel is het boek aanwezig, ofwel niet'." },
      { nl: "aangezien", en: "since / given that" },
      { nl: "indien", en: "if (formal)", note: "The written form of 'als'." },
      { nl: "reeds", en: "already (formal)", note: "The written form of 'al'." },
      { nl: "dienen te", en: "must / are to", note: "Formal for 'moeten': 'alle bewerkingen dienen aan de balie te gebeuren'.", forms: ["dienen", "dient"] },
      { nl: "voorlopig", en: "for now" },
      { nl: "nodeloos", en: "needlessly" },
      { nl: "eerst", en: "first" },
      { nl: "daarna", en: "after that" },
      { nl: "vervolgens", en: "next / then" },
      { nl: "tenslotte", en: "finally" },
      { nl: "om af te sluiten", en: "to finish / to conclude" },
      { nl: "zoals gewoonlijk", en: "as usual" },
      { nl: "men", en: "one / people", note: "The impersonal 'you': 'men moet lid zijn' = one has to be a member." },
      { nl: "zich onderscheiden", en: "to differ / to be told apart", forms: ["onderscheiden"] },
      {
        nl: "in goede banen leiden",
        en: "to keep things running smoothly",
        note: "An idiom: literally 'to guide into good tracks'.",
        forms: ["in goede banen te leiden"],
      },
      {
        nl: "aanzwengelen",
        en: "to crank up",
        note: "A rare word even for natives. 'De complexiteit niet nodeloos aanzwengelen' just means: not make it more complicated than needed.",
        forms: ["aan te zwengelen"],
      },
    ],
  },
  {
    id: "zin-opgave",
    title: "Zinnen uit opgaven",
    subtitle: "Sentences from assignments",
    blurb: "The sentence patterns every Java task and exam question is built from.",
    accent: "48 85% 58%",
    track: "cs",
    terms: [
      s("Het adres en de gemeente moeten kunnen gewijzigd worden.", "It must be possible to change the address and the municipality.", {
        note: "Three verbs stacked at the end. In code: write setters for these two fields.",
      }),
      s("Een object van deze klasse wordt gemaakt aan de hand van een 3-argumenten-constructor.", "An object of this class is created using a constructor with three arguments."),
      s("De gegevens worden als String bijgehouden.", "The data is stored as Strings."),
      s("Ieder boek heeft een uniek identificatienummer.", "Every book has a unique identification number."),
      s("Alle andere velden blijven onveranderd na de creatie van het object.", "All other fields remain unchanged after the object is created.", {
        note: "In code: no setters for those fields.",
      }),
      s("Schrijf een toString-methode.", "Write a toString method."),
      s("Gebruik containers om deze objecten bij te houden.", "Use containers to keep track of these objects."),
      s("Het boek wordt aan de betreffende container toegevoegd.", "The book is added to the relevant container."),
      s("Het id van het boek wordt als parameter meegegeven.", "The id of the book is passed as a parameter."),
      s("Indien het boek reeds uitgeleend was, geef dan een passende foutmelding.", "If the book was already lent out, give an appropriate error message."),
      s("Vergeet ook niet de status van het boek aan te passen.", "Also don't forget to update the status of the book."),
      s("De methode geeft een overzicht van alle geleende boeken op het scherm.", "The method prints an overview of all borrowed books on the screen."),
      s("Om een boek te kunnen ontlenen moet men lid zijn.", "To be able to borrow a book one must be a member."),
      s("Alle bewerkingen dienen aan de balie te gebeuren.", "All operations must take place at the desk."),
      s("Eerst maken we een tiental boeken aan.", "First we create about ten books."),
      s("Vervolgens laten we een aantal boeken terugbrengen.", "Next we have a number of books returned."),
      s("Tenslotte geven we een overzicht van de aanwezige boeken.", "Finally we give an overview of the available books."),
      s("Ofwel is het boek aanwezig, ofwel niet.", "Either the book is available, or it is not."),
    ],
  },
];
