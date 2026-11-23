import { CODE_UNITS, type CodeUnit } from "./code";
import { isDue, type ProgressMap } from "./srs";
import { termId, type Unit } from "./types";
import { UNIT_BY_ID, UNITS } from "./vocab";

/**
 * The learning path: every unit, grouped and ordered the way a newcomer should
 * meet them. Without this the course is a wall of thirty equal-looking cards
 * and no answer to "where do I start?".
 */
export interface Group {
  id: string;
  /** Dutch title. */
  title: string;
  titleEn: string;
  subtitle: string;
  unitIds: string[];
}

export const GROUPS: Group[] = [
  {
    id: "start",
    title: "Start hier",
    titleEn: "Start here",
    subtitle: "First contact, the classroom, numbers and time.",
    unitIds: ["contact", "les", "tijd", "getallen"],
  },
  {
    id: "leven",
    title: "Leven in Vlaanderen",
    titleEn: "Life in Flanders",
    subtitle: "Daily life, Flemish words, the university, paperwork and student life.",
    unitIds: ["dagelijks", "vlaams", "unief", "admin", "studentenleven"],
  },
  {
    id: "cs-basis",
    title: "Informatica: de basis",
    titleEn: "Computer science: the basics",
    subtitle: "The computer, first-year programming, reading names and symbols, debugging.",
    unitIds: ["computer", "prog1", "namen", "symbolen", "debug", "oop", "concepten", "data", "git"],
  },
  {
    id: "cs-diep",
    title: "Informatica: verdieping",
    titleEn: "Computer science: in depth",
    subtitle: "Compilers, algorithms, data structures, systems, networks, software, hardware, AI.",
    unitIds: ["compiler", "algo", "ds", "os", "machine", "net", "se", "architectuur", "ai"],
  },
  {
    id: "wiskunde",
    title: "Wiskunde & theorie",
    titleEn: "Maths & theory",
    subtitle: "Proofs and automata, calculus, linear algebra, statistics, bits.",
    unitIds: ["theorie", "analyse", "bits"],
  },
  {
    id: "lessen",
    title: "Lessen, examens & zinnen",
    titleEn: "Lectures, exams & sentences",
    subtitle: "Lecture language, exam wording, and whole sentences for class, code and e-mail.",
    unitIds: ["auditorium", "examen", "zin-les", "zin-code", "zin-scheidbaar", "zin-mail"],
  },
];

export const CODE_GROUP = {
  id: "code",
  title: "Code lezen",
  titleEn: "Reading code",
  subtitle: "Real Java, C, JavaScript, Python, SQL, CSS and HTML — questions, options and explanations in Dutch.",
};

export function unitsOf(group: Group): Unit[] {
  return group.unitIds.map((id) => UNIT_BY_ID.get(id)).filter((u): u is Unit => !!u);
}

export function unitIds(unit: Unit): string[] {
  return unit.terms.map((t) => termId(unit.id, t.nl));
}

export interface UnitStats {
  total: number;
  seen: number;
  mastered: number;
  due: number;
}

export function statsFor(ids: string[], progress: ProgressMap, now: number): UnitStats {
  let seen = 0;
  let mastered = 0;
  let due = 0;
  for (const id of ids) {
    const st = progress[id];
    if (!st) continue;
    seen += 1;
    if (st.box >= 4) mastered += 1;
    if (isDue(st, now)) due += 1;
  }
  return { total: ids.length, seen, mastered, due };
}

export type Recommendation =
  | { kind: "review"; due: number }
  | { kind: "unit"; unit: Unit; started: boolean }
  | { kind: "code"; unit: CodeUnit }
  | { kind: "done" };

/**
 * What to do next. Review once enough has piled up (that is where the learning
 * happens); otherwise the first unit on the path that still has unseen words.
 */
export function recommend(progress: ProgressMap, now: number, dueTotal: number): Recommendation {
  if (dueTotal >= 8) return { kind: "review", due: dueTotal };
  for (const group of GROUPS) {
    for (const unit of unitsOf(group)) {
      const st = statsFor(unitIds(unit), progress, now);
      if (st.seen < st.total) return { kind: "unit", unit, started: st.seen > 0 };
    }
  }
  for (const unit of CODE_UNITS) {
    if (unit.questions.some((q) => !progress[`code:${q.id}`])) return { kind: "code", unit };
  }
  if (dueTotal > 0) return { kind: "review", due: dueTotal };
  return { kind: "done" };
}

/** Units that exist but were never placed on the path — a bug if non-empty. */
export function unplacedUnits(): string[] {
  const placed = new Set(GROUPS.flatMap((g) => g.unitIds));
  return UNITS.map((u) => u.id).filter((id) => !placed.has(id));
}
