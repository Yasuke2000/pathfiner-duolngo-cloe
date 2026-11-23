/**
 * Code-reading exercises.
 *
 * She can already read code — that is not the problem. The problem is sitting in
 * a Dutch lecture and having to say, in Dutch, what a snippet does, what runs
 * first, and which word names which part ("is 'blaf' een methode of een
 * eigenschap?"). So: real Java, CSS, HTML, Python and SQL, with the question,
 * the options and the explanation all in Dutch.
 */
import { CONCEPT_OF } from "./concepts";

export type CodeLang = "java" | "css" | "html" | "python" | "sql" | "tekst" | "c" | "javascript";

export interface CodeQuestion {
  id: string;
  /** Concept this question tests; older questions are tagged in concepts.ts. */
  concept?: string;
  lang: CodeLang;
  code: string;
  /** The question, in Dutch. */
  question: string;
  /** English gloss, so a hard word never blocks the exercise. */
  questionEn: string;
  options: string[];
  answer: string;
  /** Why — in Dutch, then English. */
  explain: string;
  explainEn: string;
}

export interface CodeUnit {
  id: string;
  title: string;
  subtitle: string;
  blurb: string;
  accent: string;
  questions: CodeQuestion[];
}

export const CODE_UNITS: CodeUnit[] = [
  {
    id: "code-java",
    title: "Code lezen: Java",
    subtitle: "Reading Java, answering in Dutch",
    blurb: "Loops, methods, classes and the classic first-year mistakes.",
    accent: "25 85% 60%",
    questions: [
      {
        id: "java-som",
        lang: "java",
        code: `int som = 0;
for (int i = 1; i <= 5; i++) {
    som += i;
}
System.out.println(som);`,
        question: "Wat is de uitvoer van deze code?",
        questionEn: "What is the output of this code?",
        options: ["15", "5", "10", "120"],
        answer: "15",
        explain: "De lus telt de getallen 1 tot en met 5 op: 1 + 2 + 3 + 4 + 5 = 15.",
        explainEn: "The loop adds the numbers 1 through 5: 1 + 2 + 3 + 4 + 5 = 15.",
      },
      {
        id: "java-volgorde",
        lang: "java",
        code: `public static void main(String[] args) {
    System.out.println("A");
    groet();
    System.out.println("C");
}

static void groet() {
    System.out.println("B");
}`,
        question: "In welke volgorde verschijnt de uitvoer?",
        questionEn: "In what order does the output appear?",
        options: ["A, B, C", "A, C, B", "B, A, C", "C, B, A"],
        answer: "A, B, C",
        explain:
          "Het programma begint altijd in main. Het drukt A af, roept dan de methode groet() aan — die B afdrukt — en gaat daarna verder met C.",
        explainEn:
          "The program always starts in main. It prints A, then calls the method groet(), which prints B, and then continues with C.",
      },
      {
        id: "java-index",
        lang: "java",
        code: `int[] getallen = {10, 20, 30};
System.out.println(getallen[1]);`,
        question: "Wat drukt deze code af?",
        questionEn: "What does this code print?",
        options: ["20", "10", "30", "1"],
        answer: "20",
        explain:
          "De index begint bij nul, dus getallen[0] is 10 en getallen[1] is 20. Dit is de fout die iedereen één keer maakt.",
        explainEn:
          "The index starts at zero, so getallen[0] is 10 and getallen[1] is 20. This is the mistake everyone makes once.",
      },
      {
        id: "java-methode",
        lang: "java",
        code: `class Hond {
    String naam;

    void blaf() {
        System.out.println(naam + " blaft!");
    }
}`,
        question: "Wat is 'blaf' in deze code?",
        questionEn: "What is 'blaf' in this code?",
        options: ["een methode", "een eigenschap", "een klasse", "een variabele"],
        answer: "een methode",
        explain:
          "'blaf' is een functie die bij de klasse hoort, en dat heet een methode. 'naam' is een eigenschap, en 'Hond' is de klasse.",
        explainEn:
          "'blaf' is a function belonging to the class, which is called a method. 'naam' is a property, and 'Hond' is the class.",
      },
      {
        id: "java-eigenschap",
        lang: "java",
        code: `class Hond {
    String naam;

    void blaf() {
        System.out.println(naam + " blaft!");
    }
}`,
        question: "Wat is 'naam' in deze code?",
        questionEn: "What is 'naam' in this code?",
        options: ["een eigenschap van de klasse", "een methode", "een parameter", "een lus"],
        answer: "een eigenschap van de klasse",
        explain:
          "'naam' is data die elk object van deze klasse bijhoudt: een eigenschap (je hoort ook 'attribuut' of 'veld').",
        explainEn:
          "'naam' is data each object of this class carries: a property (you'll also hear 'attribuut' or 'veld').",
      },
      {
        id: "java-return",
        lang: "java",
        code: `static int verdubbel(int x) {
    return x * 2;
}`,
        question: "Wat geeft verdubbel(7) terug?",
        questionEn: "What does verdubbel(7) return?",
        options: ["14", "7", "2", "niets"],
        answer: "14",
        explain:
          "De methode vermenigvuldigt de parameter met twee en geeft het resultaat terug: 7 × 2 = 14. 'x' is de parameter, '7' is het argument.",
        explainEn:
          "The method multiplies the parameter by two and returns the result: 7 × 2 = 14. 'x' is the parameter, '7' is the argument.",
      },
      {
        id: "java-null",
        lang: "java",
        code: `String s = null;
System.out.println(s.length());`,
        question: "Wat gebeurt er als je dit uitvoert?",
        questionEn: "What happens when you run this?",
        options: [
          "Het programma crasht met een NullPointerException.",
          "Het drukt 0 af.",
          "Het compileert niet.",
          "Het drukt een lege regel af.",
        ],
        answer: "Het programma crasht met een NullPointerException.",
        explain:
          "De variabele verwijst naar niets, dus er is geen object om length() op aan te roepen. Dat is een uitvoeringsfout, geen compilatiefout: de compiler ziet dit niet.",
        explainEn:
          "The variable points at nothing, so there is no object to call length() on. That's a runtime error, not a compile error: the compiler doesn't catch it.",
      },
      {
        id: "java-typefout",
        lang: "java",
        code: `int getal = "vijf";`,
        question: "Wat is hier het probleem?",
        questionEn: "What's the problem here?",
        options: [
          "Een typefout: je wijst een tekenreeks toe aan een geheel getal.",
          "De variabele heeft geen naam.",
          "Er ontbreekt een lus.",
          "Niets, dit werkt.",
        ],
        answer: "Een typefout: je wijst een tekenreeks toe aan een geheel getal.",
        explain:
          "Java is statisch getypeerd, dus de compiler controleert dit vóór het uitvoeren. Je krijgt een compilatiefout.",
        explainEn:
          "Java is statically typed, so the compiler checks this before running. You get a compile error.",
      },
      {
        id: "java-grens",
        lang: "java",
        code: `int[] rij = {1, 2, 3};
for (int i = 0; i <= rij.length; i++) {
    System.out.println(rij[i]);
}`,
        question: "Wat loopt hier mis?",
        questionEn: "What goes wrong here?",
        options: [
          "De lus gaat één stap te ver en leest buiten de rij.",
          "De lus begint bij de verkeerde index.",
          "De rij is leeg.",
          "Niets, dit werkt correct.",
        ],
        answer: "De lus gaat één stap te ver en leest buiten de rij.",
        explain:
          "Bij lengte 3 zijn de geldige indexen 0, 1 en 2. Met '<=' probeert de lus ook index 3 en dat geeft een ArrayIndexOutOfBoundsException. Gebruik '<' in plaats van '<='.",
        explainEn:
          "With length 3 the valid indexes are 0, 1 and 2. With '<=' the loop also tries index 3, which throws ArrayIndexOutOfBoundsException. Use '<' instead of '<='.",
      },
      {
        id: "java-erven",
        lang: "java",
        code: `class Kat extends Dier {
    void miauw() { }
}`,
        question: "Wat betekent 'extends' hier?",
        questionEn: "What does 'extends' mean here?",
        options: [
          "Kat erft van Dier.",
          "Kat bevat een Dier.",
          "Kat is hetzelfde als Dier.",
          "Kat vervangt Dier.",
        ],
        answer: "Kat erft van Dier.",
        explain:
          "'extends' betekent overerving: Kat krijgt alle eigenschappen en methodes van Dier, en voegt er zelf iets aan toe.",
        explainEn:
          "'extends' means inheritance: Kat gets all the properties and methods of Dier, and adds something of its own.",
      },
      {
        id: "java-while",
        lang: "java",
        code: `int n = 8;
int stappen = 0;
while (n > 1) {
    n = n / 2;
    stappen++;
}
System.out.println(stappen);`,
        question: "Wat drukt deze code af?",
        questionEn: "What does this code print?",
        options: ["3", "4", "8", "2"],
        answer: "3",
        explain:
          "8 → 4 → 2 → 1, dus drie stappen. Telkens halveren geeft een logaritmisch aantal stappen — precies waarom binair zoeken zo snel is.",
        explainEn:
          "8 → 4 → 2 → 1, so three steps. Halving each time gives a logarithmic number of steps — exactly why binary search is so fast.",
      },
      {
        id: "java-voorwaarde",
        lang: "java",
        code: `int punten = 11;
if (punten >= 10) {
    System.out.println("Geslaagd");
} else {
    System.out.println("Gebuisd");
}`,
        question: "Wat doet deze code?",
        questionEn: "What does this code do?",
        options: [
          "Ze controleert een voorwaarde en drukt 'Geslaagd' af.",
          "Ze drukt altijd 'Gebuisd' af.",
          "Ze telt punten op.",
          "Ze herhaalt iets tien keer.",
        ],
        answer: "Ze controleert een voorwaarde en drukt 'Geslaagd' af.",
        explain:
          "11 is groter dan of gelijk aan 10, dus de voorwaarde is waar en het 'als'-blok wordt uitgevoerd. Het 'anders'-blok wordt overgeslagen.",
        explainEn:
          "11 is greater than or equal to 10, so the condition is true and the 'if' block runs. The 'else' block is skipped.",
      },
    ],
  },
  {
    id: "code-web",
    title: "Code lezen: CSS & HTML",
    subtitle: "Selectors, the box model, layout",
    blurb: "What a rule does, which elements it hits, and the Dutch for padding.",
    accent: "200 80% 60%",
    questions: [
      {
        id: "css-p",
        lang: "css",
        code: `p {
  color: red;
}`,
        question: "Wat doet deze CSS-regel?",
        questionEn: "What does this CSS rule do?",
        options: [
          "Alle paragrafen krijgen rode tekst.",
          "Alle paragrafen krijgen een rode achtergrond.",
          "Eén paragraaf wordt rood.",
          "De rand wordt rood.",
        ],
        answer: "Alle paragrafen krijgen rode tekst.",
        explain:
          "'p' is de selector en selecteert elk <p>-element. 'color' is de tekstkleur; voor de achtergrond gebruik je 'background-color'.",
        explainEn:
          "'p' is the selector and selects every <p> element. 'color' is the text colour; for the background you'd use 'background-color'.",
      },
      {
        id: "css-klasse",
        lang: "css",
        code: `.knop {
  background-color: blue;
}`,
        question: "Welke elementen worden hier geselecteerd?",
        questionEn: "Which elements does this select?",
        options: [
          "Alle elementen met de klasse 'knop'.",
          "Het element met het id 'knop'.",
          "Alle <knop>-elementen.",
          "Alleen de eerste knop.",
        ],
        answer: "Alle elementen met de klasse 'knop'.",
        explain:
          "Een punt betekent een klasse, een hekje (#) betekent een id. Een klasse mag je zo vaak hergebruiken als je wil; een id hoort uniek te zijn.",
        explainEn:
          "A dot means a class, a hash (#) means an id. A class may be reused as often as you like; an id is supposed to be unique.",
      },
      {
        id: "css-id",
        lang: "css",
        code: `#menu {
  display: none;
}`,
        question: "Wat gebeurt er met het menu?",
        questionEn: "What happens to the menu?",
        options: [
          "Het wordt verborgen.",
          "Het wordt doorzichtig.",
          "Het wordt kleiner.",
          "Het verschuift naar links.",
        ],
        answer: "Het wordt verborgen.",
        explain:
          "'display: none' haalt het element volledig uit de pagina — het neemt ook geen ruimte meer in. Met 'visibility: hidden' blijft de ruimte wel bestaan.",
        explainEn:
          "'display: none' removes the element from the page entirely — it takes up no space either. With 'visibility: hidden' the space remains.",
      },
      {
        id: "css-nest",
        lang: "css",
        code: `div p {
  margin: 0;
}`,
        question: "Welke paragrafen worden geselecteerd?",
        questionEn: "Which paragraphs are selected?",
        options: [
          "Alle paragrafen die in een div zitten.",
          "Alle divs en alle paragrafen.",
          "Alle divs die in een paragraaf zitten.",
          "Alleen paragrafen zonder div.",
        ],
        answer: "Alle paragrafen die in een div zitten.",
        explain:
          "Een spatie tussen twee selectors betekent 'binnenin'. Dit heet een afstammelingsselector.",
        explainEn:
          "A space between two selectors means 'inside'. This is called a descendant selector.",
      },
      {
        id: "css-padding",
        lang: "css",
        code: `.vak {
  padding: 10px;
  margin: 20px;
  border: 1px solid black;
}`,
        question: "Wat is 'padding' in het Nederlands?",
        questionEn: "What is 'padding' in Dutch?",
        options: ["de binnenruimte", "de buitenmarge", "de rand", "de breedte"],
        answer: "de binnenruimte",
        explain:
          "Padding is de ruimte binnen de rand (de binnenruimte of opvulling), margin is de ruimte buiten de rand (de buitenmarge), en border is de rand zelf. Samen heet dat het boxmodel.",
        explainEn:
          "Padding is the space inside the border, margin is the space outside it, and border is the edge itself. Together that's the box model.",
      },
      {
        id: "css-hover",
        lang: "css",
        code: `.kaart:hover {
  transform: scale(1.05);
}`,
        question: "Wanneer gebeurt dit?",
        questionEn: "When does this happen?",
        options: [
          "Als je er met de muis over gaat.",
          "Als je erop klikt.",
          "Zodra de pagina laadt.",
          "Als het scherm smal is.",
        ],
        answer: "Als je er met de muis over gaat.",
        explain:
          "':hover' is een pseudo-klasse: ze geldt alleen zolang de muis boven het element zweeft. De kaart wordt dan 5% groter.",
        explainEn:
          "':hover' is a pseudo-class: it applies only while the mouse is over the element. The card then grows 5%.",
      },
      {
        id: "css-flex",
        lang: "css",
        code: `.rij {
  display: flex;
  justify-content: space-between;
}`,
        question: "Wat doet deze regel met de kinderen van .rij?",
        questionEn: "What does this do to the children of .rij?",
        options: [
          "Ze staan naast elkaar, met de ruimte tussen hen verdeeld.",
          "Ze staan onder elkaar, gecentreerd.",
          "Ze worden verborgen.",
          "Ze krijgen allemaal dezelfde kleur.",
        ],
        answer: "Ze staan naast elkaar, met de ruimte tussen hen verdeeld.",
        explain:
          "'display: flex' zet de kinderen op één rij. 'space-between' duwt het eerste en het laatste kind naar de randen en verdeelt de overige ruimte ertussen.",
        explainEn:
          "'display: flex' puts the children in a row. 'space-between' pushes the first and last child to the edges and spreads the remaining space between them.",
      },
      {
        id: "css-media",
        lang: "css",
        code: `@media (max-width: 600px) {
  .zijbalk {
    display: none;
  }
}`,
        question: "Wanneer verdwijnt de zijbalk?",
        questionEn: "When does the sidebar disappear?",
        options: [
          "Op schermen smaller dan 600 pixels.",
          "Op schermen breder dan 600 pixels.",
          "Altijd.",
          "Alleen bij het afdrukken.",
        ],
        answer: "Op schermen smaller dan 600 pixels.",
        explain:
          "Een mediaquery past regels alleen toe als de voorwaarde klopt. 'max-width: 600px' betekent 'hoogstens 600 pixels breed', dus smalle schermen zoals een gsm.",
        explainEn:
          "A media query applies rules only when the condition holds. 'max-width: 600px' means 'at most 600 pixels wide', so narrow screens like a phone.",
      },
      {
        id: "html-lijst",
        lang: "html",
        code: `<ul>
  <li>Een</li>
  <li>Twee</li>
</ul>`,
        question: "Wat maakt deze code?",
        questionEn: "What does this code create?",
        options: [
          "een ongeordende lijst met twee items",
          "een genummerde lijst met twee items",
          "een tabel met twee rijen",
          "twee knoppen",
        ],
        answer: "een ongeordende lijst met twee items",
        explain:
          "<ul> is een 'unordered list' (ongeordende lijst, met bolletjes) en <li> is één item. Een genummerde lijst is <ol>.",
        explainEn:
          "<ul> is an unordered list (bullets) and <li> is one item. A numbered list is <ol>.",
      },
      {
        id: "html-form",
        lang: "html",
        code: `<label for="naam">Naam</label>
<input id="naam" type="text">`,
        question: "Waarom staat 'for' op het label?",
        questionEn: "Why is 'for' on the label?",
        options: [
          "Het koppelt het label aan het invoerveld.",
          "Het maakt het label vetgedrukt.",
          "Het herhaalt het label.",
          "Het verbergt het invoerveld.",
        ],
        answer: "Het koppelt het label aan het invoerveld.",
        explain:
          "'for' verwijst naar het id van het invoerveld. Daardoor springt de cursor in het veld als je op het label klikt — belangrijk voor toegankelijkheid.",
        explainEn:
          "'for' points at the input's id. That way clicking the label focuses the field — important for accessibility.",
      },
    ],
  },
  {
    id: "code-data",
    title: "Code lezen: Python & SQL",
    subtitle: "Scripts and queries",
    blurb: "Indentation, loops, and asking a database a question.",
    accent: "150 65% 52%",
    questions: [
      {
        id: "py-len",
        lang: "python",
        code: `getallen = [1, 2, 3, 4]
print(len(getallen))`,
        question: "Wat drukt deze code af?",
        questionEn: "What does this code print?",
        options: ["4", "1", "10", "3"],
        answer: "4",
        explain: "'len' geeft het aantal elementen in de lijst terug, dus 4.",
        explainEn: "'len' returns the number of elements in the list, so 4.",
      },
      {
        id: "py-lus",
        lang: "python",
        code: `for naam in ["Ana", "Bram"]:
    print("Hallo " + naam)`,
        question: "Wat doet deze code?",
        questionEn: "What does this code do?",
        options: [
          "Ze begroet elke naam in de lijst.",
          "Ze drukt de lijst één keer af.",
          "Ze telt de namen.",
          "Ze sorteert de namen.",
        ],
        answer: "Ze begroet elke naam in de lijst.",
        explain:
          "Dit is een lus over de elementen van een lijst: het blok wordt één keer per naam uitgevoerd, dus twee keer.",
        explainEn:
          "This is a loop over the elements of a list: the block runs once per name, so twice.",
      },
      {
        id: "py-inspringen",
        lang: "python",
        code: `def groet():
print("hallo")`,
        question: "Wat is hier fout?",
        questionEn: "What's wrong here?",
        options: [
          "De regel na 'def' moet inspringen.",
          "De functie heeft geen parameter.",
          "'print' bestaat niet.",
          "Er ontbreekt een puntkomma.",
        ],
        answer: "De regel na 'def' moet inspringen.",
        explain:
          "In Python bepaalt het inspringen de structuur: wat bij de functie hoort, moet een niveau naar rechts. Dit geeft een IndentationError.",
        explainEn:
          "In Python the indentation defines the structure: whatever belongs to the function must be indented. This raises an IndentationError.",
      },
      {
        id: "py-functie",
        lang: "python",
        code: `def kwadraat(x):
    return x * x

print(kwadraat(4))`,
        question: "Wat drukt deze code af?",
        questionEn: "What does this code print?",
        options: ["16", "8", "4", "niets"],
        answer: "16",
        explain:
          "De functie geeft x maal x terug, dus 4 × 4 = 16. Zonder 'return' zou ze niets teruggeven.",
        explainEn:
          "The function returns x times x, so 4 × 4 = 16. Without 'return' it would return nothing.",
      },
      {
        id: "sql-where",
        lang: "sql",
        code: `SELECT naam
FROM studenten
WHERE punten > 12;`,
        question: "Wat doet deze query?",
        questionEn: "What does this query do?",
        options: [
          "Ze vraagt de namen op van studenten met meer dan 12 punten.",
          "Ze telt de studenten met meer dan 12 punten.",
          "Ze verandert de punten van de studenten.",
          "Ze verwijdert studenten met te weinig punten.",
        ],
        answer: "Ze vraagt de namen op van studenten met meer dan 12 punten.",
        explain:
          "SELECT kiest de kolommen, FROM de tabel en WHERE filtert de rijen. Er wordt niets gewijzigd: dit is enkel opvragen.",
        explainEn:
          "SELECT picks the columns, FROM the table and WHERE filters the rows. Nothing is changed: this only queries.",
      },
      {
        id: "sql-count",
        lang: "sql",
        code: `SELECT COUNT(*) FROM boeken;`,
        question: "Wat geeft deze query terug?",
        questionEn: "What does this query return?",
        options: [
          "Het aantal rijen in de tabel.",
          "Alle boeken.",
          "De namen van de kolommen.",
          "Het eerste boek.",
        ],
        answer: "Het aantal rijen in de tabel.",
        explain: "COUNT(*) telt de rijen. Je krijgt één getal terug, niet de gegevens zelf.",
        explainEn: "COUNT(*) counts the rows. You get back a single number, not the data itself.",
      },
      {
        id: "sql-order",
        lang: "sql",
        code: `SELECT naam, punten
FROM studenten
ORDER BY punten DESC;`,
        question: "Hoe staan de resultaten gesorteerd?",
        questionEn: "How are the results sorted?",
        options: [
          "Van hoogste naar laagste punten.",
          "Van laagste naar hoogste punten.",
          "Alfabetisch op naam.",
          "Willekeurig.",
        ],
        answer: "Van hoogste naar laagste punten.",
        explain: "DESC betekent dalend (aflopend). ASC — stijgend — is de standaard als je niets zegt.",
        explainEn: "DESC means descending. ASC — ascending — is the default if you say nothing.",
      },
      {
        id: "sql-join",
        lang: "sql",
        code: `SELECT s.naam, v.titel
FROM studenten s
JOIN vakken v ON s.vak_id = v.id;`,
        question: "Wat doet de JOIN hier?",
        questionEn: "What does the JOIN do here?",
        options: [
          "Ze combineert rijen uit twee tabellen via een sleutel.",
          "Ze voegt een nieuwe rij toe.",
          "Ze sorteert de resultaten.",
          "Ze verwijdert dubbele rijen.",
        ],
        answer: "Ze combineert rijen uit twee tabellen via een sleutel.",
        explain:
          "s.vak_id is een vreemde sleutel die naar v.id wijst, de primaire sleutel van vakken. De JOIN legt die twee naast elkaar.",
        explainEn:
          "s.vak_id is a foreign key pointing at v.id, the primary key of vakken. The JOIN lines those two up.",
      },
    ],
  },
  {
    id: "code-volgorde",
    title: "Wat gebeurt er eerst?",
    subtitle: "Order of execution",
    blurb: "Step through code out loud, in Dutch: eerst, dan, daarna, pas als.",
    accent: "320 65% 62%",
    questions: [
      {
        id: "order-rekenen",
        lang: "java",
        code: `int x = 5;
x = x + 3;
x = x * 2;
System.out.println(x);`,
        question: "Wat gebeurt er eerst, en wat is het resultaat?",
        questionEn: "What happens first, and what's the result?",
        options: [
          "Eerst 5 + 3 = 8, dan 8 × 2 = 16.",
          "Eerst 5 × 2 = 10, dan 10 + 3 = 13.",
          "Alles tegelijk: 16.",
          "Eerst 3 × 2 = 6, dan 5 + 6 = 11.",
        ],
        answer: "Eerst 5 + 3 = 8, dan 8 × 2 = 16.",
        explain:
          "De regels worden van boven naar beneden uitgevoerd, één voor één. Elke regel gebruikt de waarde die de vorige regel achterliet.",
        explainEn:
          "Lines run top to bottom, one at a time. Each line uses the value the previous line left behind.",
      },
      {
        id: "order-python",
        lang: "python",
        code: `def f():
    print("in de functie")

print("voor")
f()
print("na")`,
        question: "Wat wordt er als eerste afgedrukt?",
        questionEn: "What gets printed first?",
        options: ["voor", "in de functie", "na", "niets"],
        answer: "voor",
        explain:
          "Een functie definiëren voert haar nog niet uit. De code loopt verder tot bij de aanroep f(), en pas dan wordt 'in de functie' afgedrukt.",
        explainEn:
          "Defining a function does not run it. The code continues to the call f(), and only then is 'in de functie' printed.",
      },
      {
        id: "order-lus",
        lang: "java",
        code: `for (int i = 0; i < 3; i++) {
    System.out.println(i);
}
System.out.println("klaar");`,
        question: "Wat verschijnt er, in volgorde?",
        questionEn: "What appears, in order?",
        options: [
          "0, 1, 2, klaar",
          "0, 1, 2, 3, klaar",
          "klaar, 0, 1, 2",
          "1, 2, 3, klaar",
        ],
        answer: "0, 1, 2, klaar",
        explain:
          "De lus begint bij 0 en stopt zodra de voorwaarde i < 3 onwaar wordt, dus bij 3. 'klaar' komt pas nadat de lus volledig afgelopen is.",
        explainEn:
          "The loop starts at 0 and stops as soon as the condition i < 3 becomes false, so at 3. 'klaar' only comes after the loop has finished entirely.",
      },
      {
        id: "order-css",
        lang: "css",
        code: `p { color: blue; }
p { color: green; }`,
        question: "Welke kleur krijgt de paragraaf?",
        questionEn: "What colour does the paragraph get?",
        options: ["groen", "blauw", "zwart", "allebei"],
        answer: "groen",
        explain:
          "Bij gelijke specificiteit wint de laatste regel. Dat is de cascade: later in het bestand overschrijft wat ervoor stond.",
        explainEn:
          "With equal specificity the last rule wins. That's the cascade: later in the file overrides what came before.",
      },
      {
        id: "order-voorwaarde",
        lang: "java",
        code: `int leeftijd = 17;
if (leeftijd >= 18) {
    System.out.println("Meerderjarig");
}
System.out.println("Klaar");`,
        question: "Wat drukt dit af?",
        questionEn: "What does this print?",
        options: [
          "Alleen 'Klaar'.",
          "Alleen 'Meerderjarig'.",
          "Allebei.",
          "Niets.",
        ],
        answer: "Alleen 'Klaar'.",
        explain:
          "De voorwaarde is onwaar, dus het blok wordt overgeslagen. De regel daarna staat buiten het blok en wordt gewoon uitgevoerd.",
        explainEn:
          "The condition is false, so the block is skipped. The line after it is outside the block and simply runs.",
      },
      {
        id: "order-recursie",
        lang: "python",
        code: `def aftellen(n):
    if n == 0:
        return
    print(n)
    aftellen(n - 1)

aftellen(3)`,
        question: "Wat drukt deze code af?",
        questionEn: "What does this code print?",
        options: ["3, 2, 1", "3, 2, 1, 0", "1, 2, 3", "alleen 3"],
        answer: "3, 2, 1",
        explain:
          "De functie roept zichzelf aan met een kleiner getal. Bij n == 0 stopt ze: dat is het basisgeval. Zonder basisgeval zou de recursie blijven doorgaan tot de oproepstapel vol zit.",
        explainEn:
          "The function calls itself with a smaller number. At n == 0 it stops: that's the base case. Without a base case the recursion would continue until the call stack is full.",
      },
    ],
  },
  {
    id: "code-namen",
    title: "Variabelen raden",
    subtitle: "Guessing what a Dutch variable holds",
    blurb: "Code written the way a Flemish prof writes it. What is in 'teller'? What does this compute?",
    accent: "85 60% 55%",
    questions: [
      {
        id: "naam-teller",
        lang: "java",
        code: `int teller = 0;
for (int i = 0; i < namen.length; i++) {
    if (namen[i].startsWith("A")) {
        teller++;
    }
}`,
        question: "Wat zit er in 'teller' als de lus klaar is?",
        questionEn: "What's in 'teller' when the loop finishes?",
        options: [
          "Het aantal namen dat met een A begint.",
          "De eerste naam die met een A begint.",
          "Het aantal namen in de rij.",
          "De lengte van de langste naam.",
        ],
        answer: "Het aantal namen dat met een A begint.",
        explain:
          "'Teller' komt van 'tellen'. Een teller houdt bij hoe vaak iets gebeurt — hier wordt ze alleen opgehoogd als de naam met een A begint.",
        explainEn:
          "'Teller' comes from 'tellen' (to count). A counter tracks how often something happens — here it only goes up when the name starts with an A.",
      },
      {
        id: "naam-gemiddelde",
        lang: "java",
        code: `int som = 0;
for (int getal : getallen) {
    som += getal;
}
double gemiddelde = (double) som / getallen.length;`,
        question: "Wat berekent deze code?",
        questionEn: "What does this code compute?",
        options: [
          "Het gemiddelde van de getallen.",
          "De som van de getallen.",
          "Het grootste getal.",
          "Het aantal getallen.",
        ],
        answer: "Het gemiddelde van de getallen.",
        explain:
          "'som' is de optelling, 'getallen' zijn de getallen, en 'gemiddelde' is het gemiddelde: de som gedeeld door het aantal. De namen vertellen het hele verhaal.",
        explainEn:
          "'som' is the sum, 'getallen' are the numbers, and 'gemiddelde' is the average: the sum divided by the count. The names tell you the whole story.",
      },
      {
        id: "naam-gevonden",
        lang: "java",
        code: `boolean gevonden = false;
for (String woord : woorden) {
    if (woord.equals(zoekterm)) {
        gevonden = true;
        break;
    }
}`,
        question: "Wat betekent 'gevonden' hier?",
        questionEn: "What does 'gevonden' mean here?",
        options: [
          "Of het gezochte woord gevonden is.",
          "Hoeveel woorden er gevonden zijn.",
          "Welk woord er gevonden is.",
          "Of de lijst leeg is.",
        ],
        answer: "Of het gezochte woord gevonden is.",
        explain:
          "'Gevonden' is het voltooid deelwoord van 'vinden'. Als naam van een boolean betekent het: ja of nee, is het gevonden? 'zoekterm' is de term waarnaar je zoekt.",
        explainEn:
          "'Gevonden' is the past participle of 'vinden' (to find). As a boolean name it means: yes or no, was it found? 'zoekterm' is the search term.",
      },
      {
        id: "naam-grootste",
        lang: "java",
        code: `int grootste = getallen[0];
for (int getal : getallen) {
    if (getal > grootste) {
        grootste = getal;
    }
}`,
        question: "Wat doet deze code?",
        questionEn: "What does this code do?",
        options: [
          "Ze zoekt het grootste getal.",
          "Ze zoekt het kleinste getal.",
          "Ze telt de getallen op.",
          "Ze sorteert de getallen.",
        ],
        answer: "Ze zoekt het grootste getal.",
        explain:
          "'Grootste' is de overtreffende trap van 'groot': de grootste. Telkens een getal groter is, wordt het de nieuwe grootste. Het tegenovergestelde zou 'kleinste' heten.",
        explainEn:
          "'Grootste' is the superlative of 'groot' (big): the largest. Whenever a number is bigger, it becomes the new largest. The opposite would be called 'kleinste'.",
      },
      {
        id: "naam-hulp",
        lang: "java",
        code: `int hulp = a;
a = b;
b = hulp;`,
        question: "Waarvoor dient 'hulp'?",
        questionEn: "What is 'hulp' for?",
        options: [
          "Om tijdelijk een waarde te bewaren terwijl je wisselt.",
          "Om de twee waarden op te tellen.",
          "Om te controleren of a groter is dan b.",
          "Om a en b te verwijderen.",
        ],
        answer: "Om tijdelijk een waarde te bewaren terwijl je wisselt.",
        explain:
          "'Hulp' betekent letterlijk help: een hulpvariabele. Zonder haar zou je de waarde van a kwijt zijn zodra je er b in zet. Dit heet wisselen.",
        explainEn:
          "'Hulp' literally means help: a helper variable. Without it you'd lose a's value the moment you put b into it. This is called swapping.",
      },
      {
        id: "naam-vorige",
        lang: "java",
        code: `String vorige = null;
for (String naam : namen) {
    if (naam.equals(vorige)) {
        System.out.println("dubbel: " + naam);
    }
    vorige = naam;
}`,
        question: "Wat houdt 'vorige' bij?",
        questionEn: "What does 'vorige' keep track of?",
        options: [
          "De naam van de vorige ronde van de lus.",
          "De eerste naam in de lijst.",
          "Het aantal dubbele namen.",
          "De langste naam.",
        ],
        answer: "De naam van de vorige ronde van de lus.",
        explain:
          "'Vorige' betekent previous. Op het einde van elke ronde wordt de huidige naam de vorige, zodat je de volgende keer kunt vergelijken. Zo vind je dubbels in een gesorteerde lijst.",
        explainEn:
          "'Vorige' means previous. At the end of each pass the current name becomes the previous one, so you can compare next time. That's how you find duplicates in a sorted list.",
      },
      {
        id: "naam-samenstelling",
        lang: "java",
        code: `int aantalStudenten = studenten.length;
int maximumAantal = 250;`,
        question: "Wat betekent 'aantalStudenten'?",
        questionEn: "What does 'aantalStudenten' mean?",
        options: [
          "het aantal studenten",
          "de studenten die tellen",
          "een student met een nummer",
          "de lijst van studenten",
        ],
        answer: "het aantal studenten",
        explain:
          "Nederlands plakt woorden aan elkaar. Lees zo'n samenstelling van achter naar voor: 'aantalStudenten' = het aantal ván studenten. 'maximumAantal' = het maximale aantal.",
        explainEn:
          "Dutch glues words together. Read such a compound back to front: 'aantalStudenten' = the number OF students. 'maximumAantal' = the maximum number.",
      },
      {
        id: "naam-boolean",
        lang: "java",
        code: `boolean isLeeg = lijst.size() == 0;
boolean heeftKinderen = knoop.links != null || knoop.rechts != null;`,
        question: "Wat vertelt een naam die met 'is' of 'heeft' begint je?",
        questionEn: "What does a name starting with 'is' or 'heeft' tell you?",
        options: [
          "Dat het een ja-of-nee-waarde is (een boolean).",
          "Dat het een getal is.",
          "Dat het een lijst is.",
          "Dat het een methode zonder resultaat is.",
        ],
        answer: "Dat het een ja-of-nee-waarde is (een boolean).",
        explain:
          "'isLeeg' = is het leeg? 'heeftKinderen' = heeft het kinderen? Beide beantwoorden een ja-of-nee-vraag, dus het zijn booleans. 'links' en 'rechts' zijn hier de twee takken van een knoop.",
        explainEn:
          "'isLeeg' = is it empty? 'heeftKinderen' = does it have children? Both answer a yes-or-no question, so they're booleans. 'links' and 'rechts' are the two branches of a node here.",
      },
      {
        id: "naam-teller-breuk",
        lang: "java",
        code: `double teller = 3;
double noemer = 4;
double breuk = teller / noemer;`,
        question: "Wat betekent 'teller' in deze code?",
        questionEn: "What does 'teller' mean in this code?",
        options: [
          "de teller van een breuk (het getal bovenaan)",
          "een variabele die telt hoe vaak iets gebeurt",
          "het aantal breuken",
          "de uitkomst van de deling",
        ],
        answer: "de teller van een breuk (het getal bovenaan)",
        explain:
          "Opgelet: 'teller' heeft twee betekenissen. In een lus is het een counter, maar samen met 'noemer' gaat het over een breuk: teller / noemer. De context beslist.",
        explainEn:
          "Careful: 'teller' has two meanings. In a loop it's a counter, but next to 'noemer' it's the numerator of a fraction: numerator / denominator. Context decides.",
      },
      {
        id: "naam-pogingen",
        lang: "java",
        code: `int pogingen = 0;
while (!gelukt && pogingen < 3) {
    gelukt = probeer();
    pogingen++;
}`,
        question: "Wanneer stopt deze lus?",
        questionEn: "When does this loop stop?",
        options: [
          "Zodra het gelukt is, of na drie pogingen.",
          "Pas na drie pogingen, altijd.",
          "Zodra het mislukt.",
          "Nooit.",
        ],
        answer: "Zodra het gelukt is, of na drie pogingen.",
        explain:
          "'Pogingen' zijn attempts en 'gelukt' betekent dat het werkte. Het uitroepteken betekent 'niet', dus de lus loopt zolang het níét gelukt is én er minder dan drie pogingen waren.",
        explainEn:
          "'Pogingen' are attempts and 'gelukt' means it worked. The exclamation mark means 'not', so the loop runs while it has NOT succeeded AND there have been fewer than three attempts.",
      },
      {
        id: "naam-knoop",
        lang: "java",
        code: `Knoop huidige = hoofd;
while (huidige.volgende != null) {
    huidige = huidige.volgende;
}`,
        question: "Wat doet deze code?",
        questionEn: "What does this code do?",
        options: [
          "Ze loopt naar de laatste knoop van de lijst.",
          "Ze telt de knopen.",
          "Ze verwijdert de eerste knoop.",
          "Ze keert de lijst om.",
        ],
        answer: "Ze loopt naar de laatste knoop van de lijst.",
        explain:
          "'hoofd' is de eerste knoop, 'huidige' is waar je nu staat en 'volgende' wijst naar de knoop erna. Zolang er een volgende is, schuif je op — dus je eindigt op de laatste.",
        explainEn:
          "'hoofd' is the first node, 'huidige' is where you are now and 'volgende' points to the node after it. As long as there is a next one you move along — so you end on the last.",
      },
      {
        id: "naam-python-totaal",
        lang: "python",
        code: `totaal = 0
for prijs in prijzen:
    totaal += prijs
print(totaal)`,
        question: "Wat drukt deze code af?",
        questionEn: "What does this code print?",
        options: [
          "De som van alle prijzen.",
          "De duurste prijs.",
          "Het aantal prijzen.",
          "De gemiddelde prijs.",
        ],
        answer: "De som van alle prijzen.",
        explain:
          "'totaal' begint op nul en elke 'prijs' uit 'prijzen' wordt erbij opgeteld. Een naam in het meervoud ('prijzen') is bijna altijd de verzameling; het enkelvoud ('prijs') is één element eruit.",
        explainEn:
          "'totaal' starts at zero and every 'prijs' (price) from 'prijzen' (prices) is added to it. A plural name is nearly always the collection; the singular is one element from it.",
      },
    ],
  },
  {
    id: "code-voorlezen",
    title: "Code voorlezen",
    subtitle: "Saying code out loud",
    blurb: "How a lecturer dictates a line — and how you ask about one without pointing.",
    accent: "175 65% 50%",
    questions: [
      {
        id: "lees-kleiner",
        lang: "java",
        code: `if (x <= 5)`,
        question: "Hoe lees je deze voorwaarde voor?",
        questionEn: "How do you read this condition aloud?",
        options: [
          "als x kleiner dan of gelijk aan vijf is",
          "als x groter dan vijf is",
          "als x gelijk is aan vijf",
          "als x kleiner dan vijf is",
        ],
        answer: "als x kleiner dan of gelijk aan vijf is",
        explain: "'<=' is 'kleiner dan of gelijk aan'. Alleen '<' is 'kleiner dan', en '>=' is 'groter dan of gelijk aan'.",
        explainEn: "'<=' is 'less than or equal to'. '<' alone is 'kleiner dan', and '>=' is 'groter dan of gelijk aan'.",
      },
      {
        id: "lees-punt",
        lang: "java",
        code: `lijst.size()`,
        question: "Hoe dicteert een prof dit?",
        questionEn: "How does a professor dictate this?",
        options: [
          "lijst punt size, haakje openen, haakje sluiten",
          "lijst komma size, haakjes",
          "lijst streepje size, accolades",
          "lijst size tussen aanhalingstekens",
        ],
        answer: "lijst punt size, haakje openen, haakje sluiten",
        explain: "Een '.' in code is 'punt'. Ronde haakjes dicteer je als 'haakje openen' en 'haakje sluiten'; accolades zijn de gekrulde { }.",
        explainEn: "A '.' in code is 'punt'. Round brackets are dictated 'haakje openen' and 'haakje sluiten'; 'accolades' are the curly { }.",
      },
      {
        id: "lees-toewijzing",
        lang: "java",
        code: `x = y * 2;`,
        question: "Hoe zeg je deze regel hardop?",
        questionEn: "How do you say this line out loud?",
        options: [
          "x wordt y maal twee",
          "x is groter dan y maal twee",
          "x plus y is twee",
          "x gedeeld door y is twee",
        ],
        answer: "x wordt y maal twee",
        explain: "Een toewijzing lees je als 'wordt' (becomes): x krijgt een nieuwe waarde. '*' is 'maal'. 'Is gelijk aan' bewaar je voor de vergelijking '=='.",
        explainEn: "An assignment is read 'wordt' (becomes): x gets a new value. '*' is 'maal'. Keep 'is gelijk aan' for the comparison '=='.",
      },
      {
        id: "lees-niet-gelijk",
        lang: "java",
        code: `while (a != b)`,
        question: "Wat betekent deze regel in woorden?",
        questionEn: "What does this line mean in words?",
        options: [
          "zolang a niet gelijk is aan b",
          "zolang a gelijk is aan b",
          "als a groter is dan b",
          "totdat a kleiner is dan b",
        ],
        answer: "zolang a niet gelijk is aan b",
        explain: "'while' is 'zolang' en '!=' is 'niet gelijk aan'. Het uitroepteken betekent in code bijna altijd 'niet'.",
        explainEn: "'while' is 'zolang' and '!=' is 'not equal to'. In code the exclamation mark nearly always means 'not'.",
      },
      {
        id: "lees-logisch",
        lang: "java",
        code: `if (klaar || pogingen > 3)`,
        question: "Hoe lees je dit voor?",
        questionEn: "How do you read this aloud?",
        options: [
          "als klaar, of pogingen groter dan drie",
          "als klaar, en pogingen groter dan drie",
          "als niet klaar, en pogingen kleiner dan drie",
          "als klaar gedeeld door pogingen groter is dan drie",
        ],
        answer: "als klaar, of pogingen groter dan drie",
        explain: "'||' is 'of' en '&&' is 'en'. Twee verticale strepen: minstens één van de twee moet waar zijn.",
        explainEn: "'||' is 'of' (or) and '&&' is 'en' (and). Two vertical bars: at least one of the two must be true.",
      },
      {
        id: "lees-index",
        lang: "java",
        code: `getallen[0]`,
        question: "Hoe benoem je dit?",
        questionEn: "How do you refer to this?",
        options: [
          "het eerste element van getallen",
          "het nulde getal van de lus",
          "de lengte van getallen",
          "het laatste element van getallen",
        ],
        answer: "het eerste element van getallen",
        explain: "Index nul is het eerste element. Dicteren doe je als 'getallen, vierkant haakje openen, nul, vierkant haakje sluiten' — of korter: 'getallen op index nul'.",
        explainEn: "Index zero is the first element. Dictated as 'getallen, vierkant haakje openen, nul, vierkant haakje sluiten' — or shorter: 'getallen op index nul'.",
      },
      {
        id: "lees-mail",
        lang: "tekst",
        code: `ana.peeters@student.kuleuven.be`,
        question: "Hoe spel je dit e-mailadres aan de telefoon?",
        questionEn: "How do you spell this e-mail address on the phone?",
        options: [
          "ana punt peeters apenstaartje student punt kuleuven punt be",
          "ana komma peeters hekje student komma kuleuven komma be",
          "ana streepje peeters sterretje student punt kuleuven punt be",
          "ana punt peeters en-teken student punt kuleuven punt be",
        ],
        answer: "ana punt peeters apenstaartje student punt kuleuven punt be",
        explain: "'@' is 'apenstaartje' en '.' is 'punt'. Een '#' zou 'hekje' zijn en een '-' een 'streepje'.",
        explainEn: "'@' is 'apenstaartje' and '.' is 'punt'. A '#' would be 'hekje' and a '-' a 'streepje'.",
      },
      {
        id: "lees-komma",
        lang: "tekst",
        code: `3,14`,
        question: "Hoe spreek je dit getal uit?",
        questionEn: "How do you pronounce this number?",
        options: ["drie komma veertien", "drie punt veertien", "drieduizend veertien", "drie en veertien"],
        answer: "drie komma veertien",
        explain: "Nederlands schrijft decimalen met een komma. In code blijft het wel 3.14 — met een punt — en dat verschil zorgt voor fouten bij het inlezen van gegevens.",
        explainEn: "Dutch writes decimals with a comma. In code it remains 3.14 — with a dot — and that difference causes bugs when reading in data.",
      },
      {
        id: "lees-getal",
        lang: "tekst",
        code: `regel 24`,
        question: "De prof zegt: 'de fout zit op regel vierentwintig'. Welke regel is dat?",
        questionEn: "The prof says: 'de fout zit op regel vierentwintig'. Which line is that?",
        options: ["24", "42", "420", "14"],
        answer: "24",
        explain: "Nederlands zegt eerst de eenheden: vier-en-twintig = 24. Tweeënveertig zou 42 zijn. Noteer dus het láátste cijfer dat je hoort eerst.",
        explainEn: "Dutch says the units first: four-and-twenty = 24. 'Tweeënveertig' would be 42. So write down the LAST digit you hear first.",
      },
      {
        id: "lees-underscore",
        lang: "python",
        code: `aantal_studenten += 1`,
        question: "Hoe lees je dit voor?",
        questionEn: "How do you read this aloud?",
        options: [
          "aantal underscore studenten, plus is één",
          "aantal streepje studenten is één",
          "aantal punt studenten plus één",
          "aantal studenten maal één",
        ],
        answer: "aantal underscore studenten, plus is één",
        explain: "Het officiële woord is 'onderstrepingsteken', maar iedereen zegt 'underscore'. '+=' lees je als 'plus is': de variabele wordt met één verhoogd.",
        explainEn: "The official word is 'onderstrepingsteken', but everyone says 'underscore'. '+=' is read 'plus is': the variable is increased by one.",
      },
    ],
  },
  {
    id: "code-hoog",
    title: "Code lezen: hoog niveau",
    subtitle: "High-level concepts in code",
    blurb: "Polymorphism, scope, references, recursion, functions as values, complexity.",
    accent: "270 70% 68%",
    questions: [
      {
        id: "hoog-polymorfisme",
        concept: "inheritance",
        lang: "java",
        code: `class Dier {
    void maakGeluid() { System.out.println("..."); }
}
class Hond extends Dier {
    void maakGeluid() { System.out.println("Woef"); }
}

Dier d = new Hond();
d.maakGeluid();`,
        question: "Wat wordt er afgedrukt?",
        questionEn: "What gets printed?",
        options: ["Woef", "...", "Niets, dit compileert niet.", "Eerst ... en dan Woef"],
        answer: "Woef",
        explain:
          "Het object is een Hond, ook al heeft de variabele het type Dier. Welke methode wordt uitgevoerd, hangt af van het echte object en niet van het type van de variabele: dat is polymorfisme. Hond overschrijft de methode van Dier.",
        explainEn:
          "The object is a Hond, even though the variable has type Dier. Which method runs depends on the actual object, not on the variable's type: that is polymorphism. Hond overrides Dier's method.",
      },
      {
        id: "hoog-interface",
        concept: "abstraction",
        lang: "java",
        code: `interface Vorm {
    double oppervlakte();
}

class Cirkel implements Vorm {
    double straal;
    public double oppervlakte() {
        return Math.PI * straal * straal;
    }
}`,
        question: "Wat belooft de interface 'Vorm'?",
        questionEn: "What does the interface 'Vorm' promise?",
        options: [
          "Dat elke Vorm een methode oppervlakte() heeft.",
          "Hoe de oppervlakte berekend wordt.",
          "Dat elke Vorm een straal heeft.",
          "Dat er maar één Vorm kan bestaan.",
        ],
        answer: "Dat elke Vorm een methode oppervlakte() heeft.",
        explain:
          "Een interface zegt wát een klasse moet kunnen, niet hóé. Cirkel implementeert de interface en vult zelf in hoe de oppervlakte berekend wordt. Dat is abstractie: de gebruiker hoeft de details niet te kennen.",
        explainEn:
          "An interface says WHAT a class must be able to do, not HOW. Cirkel implements the interface and fills in how the area is computed. That is abstraction: the caller needn't know the details.",
      },
      {
        id: "hoog-inkapseling",
        concept: "oop",
        lang: "java",
        code: `class Rekening {
    private double saldo;

    void stort(double bedrag) {
        if (bedrag > 0) {
            saldo += bedrag;
        }
    }
}`,
        question: "Waarom is 'saldo' private?",
        questionEn: "Why is 'saldo' private?",
        options: [
          "Zodat het alleen via de methodes kan veranderen, die de regels bewaken.",
          "Omdat het een getal is.",
          "Zodat het sneller is.",
          "Omdat de klasse maar één object mag hebben.",
        ],
        answer: "Zodat het alleen via de methodes kan veranderen, die de regels bewaken.",
        explain:
          "Dit heet inkapseling. Niemand buiten de klasse kan het saldo rechtstreeks aanpassen; het moet via stort(), en die weigert een negatief bedrag. Zo blijft het object altijd in een geldige toestand.",
        explainEn:
          "This is encapsulation. Nobody outside the class can change the balance directly; it must go through stort(), which refuses a negative amount. That keeps the object in a valid state.",
      },
      {
        id: "hoog-bereik",
        concept: "scope",
        lang: "java",
        code: `for (int i = 0; i < 3; i++) {
    int kwadraat = i * i;
}
System.out.println(kwadraat);`,
        question: "Waarom compileert dit niet?",
        questionEn: "Why doesn't this compile?",
        options: [
          "'kwadraat' bestaat alleen binnen de lus.",
          "'kwadraat' heeft het verkeerde type.",
          "De lus loopt nooit.",
          "Je mag niet vermenigvuldigen in een lus.",
        ],
        answer: "'kwadraat' bestaat alleen binnen de lus.",
        explain:
          "Een variabele bestaat alleen in het blok waarin ze gedeclareerd is: dat is haar bereik (scope). Na de sluitende accolade van de lus is 'kwadraat' weg. Declareer ze vóór de lus als je ze daarna nodig hebt.",
        explainEn:
          "A variable exists only in the block where it is declared: that is its scope. After the loop's closing brace 'kwadraat' is gone. Declare it before the loop if you need it afterwards.",
      },
      {
        id: "hoog-referentie",
        concept: "references",
        lang: "java",
        code: `int[] a = {1, 2, 3};
int[] b = a;
b[0] = 99;
System.out.println(a[0]);`,
        question: "Wat drukt dit af?",
        questionEn: "What does this print?",
        options: ["99", "1", "0", "Een foutmelding"],
        answer: "99",
        explain:
          "'b = a' kopieert de rij niet: het kopieert de verwijzing. a en b wijzen daarna naar dezelfde rij in het geheugen, dus een wijziging via b zie je ook via a.",
        explainEn:
          "'b = a' does not copy the array: it copies the reference. a and b then point at the same array in memory, so a change made through b is visible through a.",
      },
      {
        id: "hoog-waarde",
        concept: "references",
        lang: "java",
        code: `static void verhoog(int x) {
    x = x + 1;
}

int getal = 5;
verhoog(getal);
System.out.println(getal);`,
        question: "Wat drukt dit af?",
        questionEn: "What does this print?",
        options: ["5", "6", "0", "Een foutmelding"],
        answer: "5",
        explain:
          "Een int wordt doorgegeven per waarde: de methode krijgt een kopie. Ze verhoogt die kopie, maar 'getal' zelf verandert niet. Vergelijk met een rij, waar de verwijzing gekopieerd wordt.",
        explainEn:
          "An int is passed by value: the method receives a copy. It increments that copy, but 'getal' itself is unchanged. Compare with an array, where the reference is copied.",
      },
      {
        id: "hoog-onveranderlijk",
        concept: "references",
        lang: "java",
        code: `String s = "hallo";
s.toUpperCase();
System.out.println(s);`,
        question: "Wat drukt dit af?",
        questionEn: "What does this print?",
        options: ["hallo", "HALLO", "Hallo", "Niets"],
        answer: "hallo",
        explain:
          "Een String is onveranderlijk (immutable). toUpperCase() wijzigt s niet, maar geeft een nieuwe tekenreeks terug — en die wordt hier weggegooid. Je moet schrijven: s = s.toUpperCase();",
        explainEn:
          "A String is immutable. toUpperCase() does not change s; it returns a new string — which is thrown away here. You have to write: s = s.toUpperCase();",
      },
      {
        id: "hoog-faculteit",
        concept: "recursion",
        lang: "java",
        code: `static int faculteit(int n) {
    if (n <= 1) return 1;
    return n * faculteit(n - 1);
}`,
        question: "Wat geeft faculteit(4) terug?",
        questionEn: "What does faculteit(4) return?",
        options: ["24", "10", "4", "16"],
        answer: "24",
        explain:
          "4 × faculteit(3) = 4 × 3 × faculteit(2) = 4 × 3 × 2 × faculteit(1) = 4 × 3 × 2 × 1 = 24. 'n <= 1' is het basisgeval dat de recursie stopt.",
        explainEn:
          "4 × faculteit(3) = 4 × 3 × faculteit(2) = 4 × 3 × 2 × faculteit(1) = 24. 'n <= 1' is the base case that stops the recursion.",
      },
      {
        id: "hoog-filter",
        concept: "functional",
        lang: "javascript",
        code: `const getallen = [1, 2, 3, 4];
const even = getallen.filter(n => n % 2 === 0);`,
        question: "Wat zit er in 'even'?",
        questionEn: "What is in 'even'?",
        options: ["[2, 4]", "[1, 3]", "[true, false, true, false]", "2"],
        answer: "[2, 4]",
        explain:
          "filter krijgt een functie mee en houdt alleen de elementen over waarvoor die functie waar teruggeeft. 'n => n % 2 === 0' is een anonieme functie: is de rest bij deling door twee nul?",
        explainEn:
          "filter takes a function and keeps only the elements for which that function returns true. 'n => n % 2 === 0' is an anonymous function: is the remainder after dividing by two zero?",
      },
      {
        id: "hoog-comprehensie",
        concept: "functional",
        lang: "python",
        code: `namen = ["ana", "bram"]
groot = [n.upper() for n in namen]`,
        question: "Wat zit er in 'groot'?",
        questionEn: "What is in 'groot'?",
        options: ['["ANA", "BRAM"]', '["ana", "bram"]', '"ANABRAM"', "2"],
        answer: '["ANA", "BRAM"]',
        explain:
          "Dit is een lijstcomprehensie: ze past dezelfde bewerking toe op elk element en maakt daar een nieuwe lijst van. De oorspronkelijke lijst 'namen' blijft ongewijzigd.",
        explainEn:
          "This is a list comprehension: it applies the same operation to every element and builds a new list. The original list 'namen' is unchanged.",
      },
      {
        id: "hoog-kwadratisch",
        concept: "complexity",
        lang: "java",
        code: `for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
        teller++;
    }
}`,
        question: "Hoe vaak wordt 'teller' verhoogd?",
        questionEn: "How many times is 'teller' incremented?",
        options: ["n × n keer", "2 × n keer", "n keer", "log n keer"],
        answer: "n × n keer",
        explain:
          "De binnenste lus loopt n keer voor elke ronde van de buitenste lus, dus n × n in totaal. Dat heet kwadratische complexiteit: verdubbel n en het werk wordt vier keer zo groot.",
        explainEn:
          "The inner loop runs n times for each pass of the outer loop, so n × n in total. That is quadratic complexity: double n and the work quadruples.",
      },
      {
        id: "hoog-lineair",
        concept: "complexity",
        lang: "java",
        code: `static boolean bevat(int[] rij, int doel) {
    for (int x : rij) {
        if (x == doel) return true;
    }
    return false;
}`,
        question: "Hoeveel elementen bekijkt dit in het slechtste geval?",
        questionEn: "How many elements does this examine in the worst case?",
        options: ["Allemaal: n elementen", "Eén element", "De helft", "n × n elementen"],
        answer: "Allemaal: n elementen",
        explain:
          "Als het doel er niet in zit, of helemaal achteraan staat, moet de lus de hele rij doorlopen. Dat is lineair zoeken. In het beste geval staat het doel vooraan en is één stap genoeg.",
        explainEn:
          "If the target is absent, or sits at the very end, the loop must walk the whole array. That is linear search. In the best case the target is first and one step suffices.",
      },
      {
        id: "hoog-uitzondering",
        concept: "errors",
        lang: "java",
        code: `try {
    int x = Integer.parseInt("abc");
    System.out.println("gelukt");
} catch (NumberFormatException e) {
    System.out.println("geen getal");
}
System.out.println("klaar");`,
        question: "Wat wordt er afgedrukt?",
        questionEn: "What gets printed?",
        options: ["geen getal, klaar", "gelukt, klaar", "gelukt, geen getal, klaar", "Alleen geen getal"],
        answer: "geen getal, klaar",
        explain:
          "parseInt gooit een uitzondering op, dus de rest van het try-blok wordt overgeslagen en 'gelukt' verschijnt nooit. Het catch-blok vangt de uitzondering op, en daarna gaat het programma gewoon verder.",
        explainEn:
          "parseInt throws an exception, so the rest of the try block is skipped and 'gelukt' never appears. The catch block catches the exception, and then the program simply carries on.",
      },
      {
        id: "hoog-map",
        concept: "collections",
        lang: "java",
        code: `Map<String, Integer> punten = new HashMap<>();
punten.put("Ana", 14);
punten.put("Bram", 9);
punten.put("Ana", 16);
System.out.println(punten.get("Ana"));`,
        question: "Wat drukt dit af?",
        questionEn: "What does this print?",
        options: ["16", "14", "30", "null"],
        answer: "16",
        explain:
          "In een map komt elke sleutel maar één keer voor. De tweede put met de sleutel \"Ana\" voegt niets toe, maar overschrijft de oude waarde.",
        explainEn:
          "In a map every key occurs only once. The second put with the key \"Ana\" adds nothing; it overwrites the old value.",
      },
      {
        id: "hoog-stapel",
        concept: "collections",
        lang: "java",
        code: `Deque<String> stapel = new ArrayDeque<>();
stapel.push("a");
stapel.push("b");
stapel.push("c");
System.out.println(stapel.pop());`,
        question: "Wat drukt dit af?",
        questionEn: "What does this print?",
        options: ["c", "a", "b", "abc"],
        answer: "c",
        explain:
          "Een stapel werkt volgens 'laatst erin, eerst eruit': pop() haalt het element weg dat het laatst toegevoegd is. Bij een wachtrij zou je net het eerste krijgen.",
        explainEn:
          "A stack is last in, first out: pop() removes the element added most recently. With a queue you would get the first one instead.",
      },
      {
        id: "hoog-async",
        concept: "async",
        lang: "javascript",
        code: `console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");`,
        question: "In welke volgorde verschijnt de uitvoer?",
        questionEn: "In what order does the output appear?",
        options: ["A, C, B", "A, B, C", "B, A, C", "C, B, A"],
        answer: "A, C, B",
        explain:
          "setTimeout plant de terugroepfunctie in voor later, zelfs met een wachttijd van nul. De huidige code loopt eerst helemaal af, en pas daarna komt B. Dat is asynchrone code: niet alles gebeurt in de volgorde waarin het geschreven staat.",
        explainEn:
          "setTimeout schedules the callback for later, even with a delay of zero. The current code runs to completion first, and only then comes B. That is asynchronous code: not everything happens in the order it is written.",
      },
    ],
  },
  {
    id: "code-laag",
    title: "Code lezen: laag niveau",
    subtitle: "Low-level concepts in code",
    blurb: "Bits, overflow, floating point, pointers, the stack and the heap, linking.",
    accent: "12 75% 62%",
    questions: [
      {
        id: "laag-binair",
        concept: "bits",
        lang: "java",
        code: `int x = 0b1011;`,
        question: "Welke waarde heeft x?",
        questionEn: "What value does x have?",
        options: ["11", "1011", "13", "4"],
        answer: "11",
        explain:
          "0b betekent dat het getal binair geschreven is. Van rechts naar links zijn de bits 1, 2, 4 en 8 waard: 8 + 0 + 2 + 1 = 11.",
        explainEn:
          "0b means the number is written in binary. From right to left the bits are worth 1, 2, 4 and 8: 8 + 0 + 2 + 1 = 11.",
      },
      {
        id: "laag-hex",
        concept: "bits",
        lang: "java",
        code: `int kleur = 0xFF;`,
        question: "Welke waarde heeft 'kleur'?",
        questionEn: "What value does 'kleur' have?",
        options: ["255", "15", "16", "1515"],
        answer: "255",
        explain:
          "0x betekent hexadecimaal: grondtal 16. F is 15, dus FF = 15 × 16 + 15 = 255. Dat is ook precies wat in één byte past.",
        explainEn:
          "0x means hexadecimal: base 16. F is 15, so FF = 15 × 16 + 15 = 255. That is also exactly what fits in one byte.",
      },
      {
        id: "laag-en",
        concept: "bits",
        lang: "java",
        code: `int r = 12 & 10;`,
        question: "Welke waarde heeft r?",
        questionEn: "What value does r have?",
        options: ["8", "22", "2", "14"],
        answer: "8",
        explain:
          "'&' is de bitsgewijze EN. 12 is 1100 en 10 is 1010. Alleen waar beide bits 1 zijn, blijft een 1 staan: 1000, en dat is 8. Let op: één '&' is bitsgewijs, twee '&&' is de logische en.",
        explainEn:
          "'&' is bitwise AND. 12 is 1100 and 10 is 1010. Only where both bits are 1 does a 1 remain: 1000, which is 8. Note: one '&' is bitwise, two '&&' is logical and.",
      },
      {
        id: "laag-schuif",
        concept: "bits",
        lang: "java",
        code: `int r = 3 << 2;`,
        question: "Welke waarde heeft r?",
        questionEn: "What value does r have?",
        options: ["12", "6", "5", "9"],
        answer: "12",
        explain:
          "'<<' verschuift de bits naar links. Elke plaats naar links verdubbelt het getal, dus twee plaatsen is maal vier: 3 × 4 = 12.",
        explainEn:
          "'<<' shifts the bits left. Each place to the left doubles the number, so two places is times four: 3 × 4 = 12.",
      },
      {
        id: "laag-overloop",
        concept: "overflow",
        lang: "java",
        code: `byte b = 127;
b++;
System.out.println(b);`,
        question: "Wat drukt dit af?",
        questionEn: "What does this print?",
        options: ["-128", "128", "0", "Een foutmelding"],
        answer: "-128",
        explain:
          "Een byte met teken gaat van -128 tot 127. Eén meer dan het maximum past niet: het getal loopt over en springt naar het kleinste. Java geeft daarbij geen foutmelding.",
        explainEn:
          "A signed byte runs from -128 to 127. One more than the maximum does not fit: the number overflows and wraps to the smallest. Java gives no error for this.",
      },
      {
        id: "laag-zonder-teken",
        concept: "overflow",
        lang: "c",
        code: `unsigned char c = 255;
c = c + 1;
printf("%d", c);`,
        question: "Wat drukt dit af?",
        questionEn: "What does this print?",
        options: ["0", "256", "-1", "255"],
        answer: "0",
        explain:
          "Een unsigned char is één byte zonder teken: 0 tot 255. 256 past er niet meer in, dus alleen de laagste acht bits blijven over en dat is 0.",
        explainEn:
          "An unsigned char is one byte without a sign: 0 to 255. 256 no longer fits, so only the lowest eight bits remain, which is 0.",
      },
      {
        id: "laag-deling",
        concept: "arith",
        lang: "java",
        code: `int a = 7 / 2;
int b = 7 % 2;`,
        question: "Welke waarden hebben a en b?",
        questionEn: "What values do a and b have?",
        options: ["a = 3 en b = 1", "a = 3,5 en b = 0", "a = 4 en b = 1", "a = 3 en b = 2"],
        answer: "a = 3 en b = 1",
        explain:
          "Delen met twee gehele getallen is een gehele deling: het deel na de komma valt weg, dus 3. '%' geeft de rest van die deling: 7 = 3 × 2 + 1, dus 1.",
        explainEn:
          "Dividing two integers is integer division: the part after the decimal point is dropped, so 3. '%' gives the remainder of that division: 7 = 3 × 2 + 1, so 1.",
      },
      {
        id: "laag-komma",
        concept: "floats",
        lang: "java",
        code: `System.out.println(0.1 + 0.2 == 0.3);`,
        question: "Wat drukt dit af?",
        questionEn: "What does this print?",
        options: ["false", "true", "0.3", "Een foutmelding"],
        answer: "false",
        explain:
          "Kommagetallen worden binair opgeslagen en 0,1 is binair niet exact voor te stellen. De som is 0,30000000000000004. Vergelijk kommagetallen dus nooit met '==', maar kijk of het verschil klein genoeg is.",
        explainEn:
          "Floating-point numbers are stored in binary and 0.1 cannot be represented exactly. The sum is 0.30000000000000004. So never compare floats with '=='; check whether the difference is small enough.",
      },
      {
        id: "laag-teken",
        concept: "chars",
        lang: "java",
        code: `char c = 'A';
c += 2;
System.out.println(c);`,
        question: "Wat drukt dit af?",
        questionEn: "What does this print?",
        options: ["C", "A2", "67", "AAA"],
        answer: "C",
        explain:
          "Een teken is onder de motorkap een getal: 'A' heeft code 65. Tel er twee bij op en je krijgt 67, de code van 'C'.",
        explainEn:
          "A character is a number under the hood: 'A' has code 65. Add two and you get 67, the code of 'C'.",
      },
      {
        id: "laag-nulteken",
        concept: "chars",
        lang: "c",
        code: `char naam[4] = "Ana";`,
        question: "Waarom vier plaatsen voor drie letters?",
        questionEn: "Why four places for three letters?",
        options: [
          "Voor het afsluitende nulteken.",
          "Omdat een rij altijd een even lengte heeft.",
          "Voor de aanhalingstekens.",
          "Het is een vergissing: drie is genoeg.",
        ],
        answer: "Voor het afsluitende nulteken.",
        explain:
          "In C eindigt een tekenreeks op een onzichtbaar nulteken, zodat functies weten waar de tekst stopt. Vergeet je die extra plaats, dan lezen ze verder dan de rij.",
        explainEn:
          "In C a string ends with an invisible null character, so functions know where the text stops. Forget that extra place and they read past the array.",
      },
      {
        id: "laag-wijzer",
        concept: "pointers",
        lang: "c",
        code: `int x = 5;
int *p = &x;`,
        question: "Wat bevat p?",
        questionEn: "What does p hold?",
        options: ["Het adres van x.", "De waarde 5.", "Een kopie van x.", "Niets."],
        answer: "Het adres van x.",
        explain:
          "'&x' betekent: het geheugenadres van x. p is een wijzer (pointer): een variabele die geen waarde bijhoudt maar een plaats in het geheugen.",
        explainEn:
          "'&x' means: the memory address of x. p is a pointer: a variable that holds not a value but a place in memory.",
      },
      {
        id: "laag-derefereren",
        concept: "pointers",
        lang: "c",
        code: `int x = 5;
int *p = &x;
*p = 7;
printf("%d", x);`,
        question: "Wat drukt dit af?",
        questionEn: "What does this print?",
        options: ["7", "5", "Een adres", "0"],
        answer: "7",
        explain:
          "'*p' volgt de wijzer naar de plaats waar ze naar wijst — dat heet derefereren. '*p = 7' schrijft dus 7 op het adres van x, en daardoor is x zelf veranderd.",
        explainEn:
          "'*p' follows the pointer to the place it points at — that is dereferencing. So '*p = 7' writes 7 at the address of x, which changes x itself.",
      },
      {
        id: "laag-wijzerrekenen",
        concept: "pointers",
        lang: "c",
        code: `int rij[3] = {10, 20, 30};
int *p = rij;
printf("%d", *(p + 1));`,
        question: "Wat drukt dit af?",
        questionEn: "What does this print?",
        options: ["20", "10", "11", "30"],
        answer: "20",
        explain:
          "De naam van een rij is het adres van haar eerste element. 'p + 1' schuift één element op (niet één byte), en '*' leest wat daar staat: het tweede element. rij[1] is gewoon een kortere schrijfwijze voor *(rij + 1).",
        explainEn:
          "An array's name is the address of its first element. 'p + 1' moves one element along (not one byte), and '*' reads what is there: the second element. rij[1] is simply shorthand for *(rij + 1).",
      },
      {
        id: "laag-buiten-rij",
        concept: "memory",
        lang: "c",
        code: `int rij[3];
rij[3] = 42;`,
        question: "Wat is hier het probleem in C?",
        questionEn: "What is the problem here in C?",
        options: [
          "Er wordt buiten de rij geschreven, en C controleert dat niet.",
          "De compiler weigert dit.",
          "42 past niet in een int.",
          "De rij is niet gesorteerd.",
        ],
        answer: "Er wordt buiten de rij geschreven, en C controleert dat niet.",
        explain:
          "De geldige indexen zijn 0, 1 en 2. C controleert de grenzen niet: de 42 komt gewoon in het geheugen ernaast terecht. Dat is ongedefinieerd gedrag — het kan werken, crashen of iets anders overschrijven. Java zou hier een uitzondering opgooien.",
        explainEn:
          "The valid indexes are 0, 1 and 2. C does not check bounds: the 42 simply lands in the memory next door. That is undefined behaviour — it may work, crash, or overwrite something else. Java would throw an exception here.",
      },
      {
        id: "laag-lek",
        concept: "memory",
        lang: "c",
        code: `int *data = malloc(100 * sizeof(int));
/* ... data wordt gebruikt ... */
return 0;`,
        question: "Wat ontbreekt hier?",
        questionEn: "What is missing here?",
        options: [
          "free(data): het geheugen wordt nooit vrijgegeven.",
          "Een lus over de data.",
          "Een puntkomma.",
          "Niets: C ruimt dit zelf op.",
        ],
        answer: "free(data): het geheugen wordt nooit vrijgegeven.",
        explain:
          "Wat je met malloc toewijst, moet je zelf weer vrijgeven met free. Vergeet je dat, dan heb je een geheugenlek. C heeft geen afvalverzameling zoals Java of Python.",
        explainEn:
          "What you allocate with malloc you must release yourself with free. Forget it and you have a memory leak. C has no garbage collection like Java or Python.",
      },
      {
        id: "laag-hoop",
        concept: "memory",
        lang: "java",
        code: `int getal = 5;
int[] rij = new int[1000];`,
        question: "Waar komen de duizend getallen van 'rij' terecht?",
        questionEn: "Where do the thousand numbers of 'rij' end up?",
        options: [
          "Op de hoop; alleen de verwijzing staat op de stapel.",
          "Volledig op de stapel.",
          "In het bestand zelf.",
          "In de processor.",
        ],
        answer: "Op de hoop; alleen de verwijzing staat op de stapel.",
        explain:
          "Alles wat je met 'new' maakt, komt op de hoop (heap). De lokale variabele 'rij' is alleen een verwijzing en staat op de stapel (stack), net als 'getal'. De stapel verdwijnt als de methode klaar is; de hoop wordt door de afvalverzameling opgeruimd.",
        explainEn:
          "Everything you create with 'new' goes on the heap. The local variable 'rij' is only a reference and lives on the stack, like 'getal'. The stack frame disappears when the method returns; the heap is cleaned by garbage collection.",
      },
      {
        id: "laag-stapeloverloop",
        concept: "memory",
        lang: "java",
        code: `static int tel(int n) {
    return tel(n + 1);
}`,
        question: "Wat gebeurt er als je tel(0) aanroept?",
        questionEn: "What happens when you call tel(0)?",
        options: [
          "Een StackOverflowError: de oproepstapel loopt vol.",
          "Het programma loopt eeuwig door zonder fout.",
          "Het geeft 1 terug.",
          "Het compileert niet.",
        ],
        answer: "Een StackOverflowError: de oproepstapel loopt vol.",
        explain:
          "Elke aanroep zet een nieuw stapelframe op de oproepstapel, en er is geen basisgeval dat de recursie stopt. De stapel heeft een vaste grootte en raakt vol.",
        explainEn:
          "Every call pushes a new stack frame onto the call stack, and there is no base case to stop the recursion. The stack has a fixed size and fills up.",
      },
      {
        id: "laag-koppelfout",
        concept: "compile",
        lang: "c",
        code: `int som(int a, int b);

int main() {
    return som(1, 2);
}`,
        question: "Dit compileert. Welke fout krijg je daarna?",
        questionEn: "This compiles. Which error do you get afterwards?",
        options: [
          "Een koppelfout: som is gedeclareerd maar nergens gedefinieerd.",
          "Een syntaxisfout.",
          "Een typefout.",
          "Geen enkele fout.",
        ],
        answer: "Een koppelfout: som is gedeclareerd maar nergens gedefinieerd.",
        explain:
          "De eerste regel is alleen een declaratie: ze zegt dat som bestaat. De compiler is daarmee tevreden. Pas bij het koppelen zoekt de linker de echte code van som, en die bestaat nergens.",
        explainEn:
          "The first line is only a declaration: it says that som exists. The compiler is satisfied with that. Only at link time does the linker look for som's actual code, and there is none.",
      },
    ],
  },
];

export const ALL_CODE_QUESTIONS = CODE_UNITS.flatMap((u) => u.questions);

/** The concept a question tests — see concepts.ts. */
export function conceptOf(q: CodeQuestion): string {
  return q.concept ?? CONCEPT_OF[q.id] ?? "other";
}
