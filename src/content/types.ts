import type { Degree } from "@/engine/types";
import type { CheckSpec } from "@/game/perform";
import type { EnemyConfig } from "@/game/combat";
import type { CombatantSeed } from "@/game/encounter";

export type NodeId = string;

interface BaseNode {
  /** Optional; nodes are keyed by their id in {@link Course.nodes}. */
  id?: NodeId;
  /** Who is "speaking" this beat, if anyone (e.g. a companion NPC). */
  speaker?: string;
  /** Experience awarded for reaching this node. */
  xp?: number;
}

/** Plain story narration that advances on "Continue". */
export interface NarrationNode extends BaseNode {
  kind: "narration";
  lines: string[];
  next: NodeId;
}

/** A focused teaching card that explains one concept before play resumes. */
export interface TeachNode extends BaseNode {
  kind: "teach";
  title: string;
  body: string[];
  /** Optional callout bullets rendered as a highlighted list. */
  points?: string[];
  next: NodeId;
}

/** A branching player choice. */
export interface ChoiceNode extends BaseNode {
  kind: "choice";
  prompt: string;
  options: { label: string; hint?: string; next: NodeId }[];
}

/**
 * A formative knowledge check (Bloom). Picking a wrong answer routes to a
 * gentle corrective rather than a punishment, then lets the learner try again.
 */
export interface QuizNode extends BaseNode {
  kind: "quiz";
  prompt: string;
  options: {
    label: string;
    correct: boolean;
    /** Feedback shown after the learner picks this answer. */
    feedback: string;
  }[];
  /** Where to go once the learner answers correctly. */
  next: NodeId;
}

/**
 * A real PF2e check. The dice are rolled by the engine and the narration
 * branches on the resulting degree of success. Every degree has an outcome,
 * so the story can never dead-end on a bad roll (failure is a story beat).
 */
export interface CheckNode extends BaseNode {
  kind: "check";
  prompt: string;
  spec: CheckSpec;
  outcomes: Record<Degree, { lines: string[]; next: NodeId; bonusXp?: number }>;
}

/**
 * A guided combat encounter run by the combat layer. Built to teach the
 * three-action economy: every degree resolves into the shared tracker, and the
 * narration coaches the learner toward spending actions well.
 */
export interface CombatNode extends BaseNode {
  kind: "combat";
  prompt: string;
  intro: string[];
  enemy: EnemyConfig;
  victoryLines: string[];
  next: NodeId;
}

/**
 * A multi-combatant encounter run by the initiative tracker: the hero, an ally
 * who models good play, and two or more foes acting in initiative order. Teaches
 * turn order, targeting, and the one-per-round reaction (Shield Block).
 */
export interface EncounterNode extends BaseNode {
  kind: "encounter";
  prompt: string;
  intro: string[];
  foes: CombatantSeed[];
  victoryLines: string[];
  /** Heading shown on the victory card (defaults to a generic one). */
  victoryTitle?: string;
  next: NodeId;
}

/**
 * A hands-on dying/recovery loop. The learner rolls recovery checks (flat
 * checks vs DC 10 + dying) and watches the dying meter move — the system's most
 * confusing subsystem, taught by doing. Death is caught by an ally so the lesson
 * lands without a real game over.
 */
export interface RecoveryNode extends BaseNode {
  kind: "recovery";
  prompt: string;
  intro: string[];
  startingDying: number;
  stabilizedLines: string[];
  next: NodeId;
}

/**
 * The guided character builder: one choice at a time (ancestry → background →
 * class → boosts → skills → feat) with a live, correctly-computed sheet and a
 * JSON export the learner takes to a real table.
 */
export interface BuilderNode extends BaseNode {
  kind: "builder";
  prompt: string;
  intro: string[];
  next: NodeId;
}

/**
 * The "join a table" hand-off: a table-readiness checklist, the character
 * exports (PDF / JSON / Pathbuilder), and the real-world resources for finding
 * a first group. This is the product's whole purpose made concrete.
 */
export interface HandoffNode extends BaseNode {
  kind: "handoff";
  prompt: string;
  intro: string[];
  checklist: string[];
  resources: { label: string; detail: string }[];
  next: NodeId;
}

/**
 * A unit milestone / graduation card. With `next`, it shows a "Continue" into
 * the following unit; without `next` it is the final course graduation.
 */
export interface EndNode extends BaseNode {
  kind: "end";
  title: string;
  body: string[];
  /** What the learner has earned (a "crown"/mastery marker). */
  crown: string;
  /** A teaser for what comes next in the full course. */
  upNext: string;
  /** If set, this is a unit milestone that continues into the next unit. */
  next?: NodeId;
}

export type CourseNode =
  | NarrationNode
  | TeachNode
  | ChoiceNode
  | QuizNode
  | CheckNode
  | CombatNode
  | EncounterNode
  | RecoveryNode
  | BuilderNode
  | HandoffNode
  | EndNode;

export interface Course {
  title: string;
  subtitle: string;
  start: NodeId;
  nodes: Record<NodeId, CourseNode>;
}
