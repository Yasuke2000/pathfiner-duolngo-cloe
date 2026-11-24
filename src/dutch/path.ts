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
    unitIds: ["compiler", "algo", "ds", "os", "machine", "net", "se", "architectuur"],
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
    unitIds: ["opgavetaal", "zin-opgave", "auditorium", "examen", "zin-les", "zin-code", "zin-scheidbaar", "zin-mail"],
  },
  {
    id: "it-ops",
    title: "IT-beheer & support",
    titleEn: "IT operations & support",
    subtitle: "Running systems and networks, the helpdesk, the digital workplace.",
    unitIds: ["sysadmin", "netwerk2", "helpdesk", "m365", "zin-support"],
  },
  {
    id: "dev-ops",
    title: "Bouwen & beveiligen",
    titleEn: "Building & securing",
    subtitle: "Developer shop talk, cloud and DevOps, information security and privacy.",
    unitIds: ["devjargon", "cloud", "security"],
  },
  {
    id: "business",
    title: "Business-IT & projecten",
    titleEn: "Business IT & projects",
    subtitle: "ERP, data and reporting, and the language of projects and meetings.",
    unitIds: ["erp", "projecten"],
  },
  {
    id: "ai",
    title: "Artificiële intelligentie",
    titleEn: "Artificial intelligence",
    subtitle: "Machine learning, generative AI and language models, and using them responsibly.",
    unitIds: ["ai", "genai"],
  },
];

/**
 * Learning paths. The course serves different people: a computer-science
 * student, someone in IT operations, a developer. A path picks the groups that
 * matter for that role and puts them in a sensible order; "all" shows the lot.
 */
export type TrackId = "all" | "student" | "it" | "dev";

export interface Track {
  id: TrackId;
  nl: string;
  en: string;
  groupIds: string[];
}

export const TRACKS: Track[] = [
  { id: "all", nl: "Alles", en: "Everything", groupIds: [] },
  {
    id: "student",
    nl: "Student informatica",
    en: "CS student",
    groupIds: ["start", "leven", "cs-basis", "cs-diep", "wiskunde", "lessen", "ai"],
  },
  {
    id: "it",
    nl: "IT-professional",
    en: "IT professional",
    groupIds: ["start", "it-ops", "dev-ops", "business", "ai", "cs-basis"],
  },
  {
    id: "dev",
    nl: "Developer",
    en: "Developer",
    groupIds: ["start", "cs-basis", "dev-ops", "cs-diep", "ai", "business"],
  },
];

/** The groups of a learning path, in its order. */
export function groupsFor(trackId: TrackId): Group[] {
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track || track.groupIds.length === 0) return GROUPS;
  return track.groupIds.map((id) => GROUPS.find((g) => g.id === id)).filter((g): g is Group => !!g);
}

export const CODE_GROUP = {
  id: "code",
  title: "Code & praktijk lezen",
  titleEn: "Reading code & practice",
  subtitle: "Real code, commands, logs, config and prompts — questions, options and explanations in Dutch.",
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
export function recommend(
  progress: ProgressMap,
  now: number,
  dueTotal: number,
  groups: Group[] = GROUPS,
): Recommendation {
  if (dueTotal >= 8) return { kind: "review", due: dueTotal };
  for (const group of groups) {
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
