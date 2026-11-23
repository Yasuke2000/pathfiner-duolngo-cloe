/**
 * Code-reading exercises.
 *
 * She can already read code — that is not the problem. The problem is sitting in
 * a Dutch lecture and having to say, in Dutch, what a snippet does, what runs
 * first, and which word names which part ("is 'blaf' een methode of een
 * eigenschap?"). So: real Java, CSS, HTML, Python and SQL, with the question,
 * the options and the explanation all in Dutch.
 */
export type CodeLang = "java" | "css" | "html" | "python" | "sql";

export interface CodeQuestion {
  id: string;
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
];

export const ALL_CODE_QUESTIONS = CODE_UNITS.flatMap((u) => u.questions);
