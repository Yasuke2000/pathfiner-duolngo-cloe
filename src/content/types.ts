import type { Degree } from "@/engine/types";
import type { CheckSpec } from "@/game/perform";

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

/** The graduation / end-of-lesson card. */
export interface EndNode extends BaseNode {
  kind: "end";
  title: string;
  body: string[];
  /** What the learner has earned (a "crown"/mastery marker). */
  crown: string;
  /** A teaser for the next unit in the full course. */
  upNext: string;
}

export type CourseNode =
  | NarrationNode
  | TeachNode
  | ChoiceNode
  | QuizNode
  | CheckNode
  | EndNode;

export interface Course {
  title: string;
  subtitle: string;
  start: NodeId;
  nodes: Record<NodeId, CourseNode>;
}
