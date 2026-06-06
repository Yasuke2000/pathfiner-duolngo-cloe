export interface Chapter {
  index: number;
  title: string;
  /** Accent color (HSL) that tints the whole scene's atmosphere. */
  accent: string;
}

const CH = (index: number, title: string, accent: string): Chapter => ({ index, title, accent });

const C1 = CH(1, "The Threshold", "190 72% 55%");
const C2 = CH(2, "The Flooded Hall", "26 88% 58%");
const C3 = CH(3, "Ambush in the Dark", "350 78% 62%");
const C4 = CH(4, "The Stone Sentinel", "265 70% 66%");
const C5 = CH(5, "Forging a Hero", "146 56% 52%");
const C6 = CH(6, "The Road to the Table", "44 90% 60%");

/** Map a node id to its narrative chapter (drives the HUD and ambient color). */
export function chapterFor(nodeId: string): Chapter {
  if (nodeId.startsWith("u2") || nodeId === "unit2-crown") return C2;
  if (nodeId.startsWith("u3") || nodeId === "unit3-crown") return C3;
  if (nodeId.startsWith("u4") || nodeId === "unit4-crown") return C4;
  if (nodeId.startsWith("u5") || nodeId === "unit5-crown") return C5;
  if (nodeId.startsWith("u6") || nodeId === "graduation") return C6;
  return C1;
}

export const ALL_CHAPTERS: Chapter[] = [C1, C2, C3, C4, C5, C6];
