import { describe, expect, it } from "vitest";
import { COURSE } from "./course";
import type { CourseNode } from "./types";

/**
 * Branch-map validation: treats the course as a directed graph and proves the
 * story is logically sound — every link resolves, nothing is orphaned, and
 * every path eventually concludes. This is the automated "map all the branches"
 * safety net.
 */

function outgoing(node: CourseNode): string[] {
  switch (node.kind) {
    case "narration":
    case "teach":
    case "quiz":
    case "combat":
    case "encounter":
    case "recovery":
    case "builder":
    case "handoff":
      return [node.next];
    case "choice":
      return node.options.map((o) => o.next);
    case "check":
      return Object.values(node.outcomes).map((o) => o.next);
    case "end":
      return node.next ? [node.next] : [];
  }
}

const ids = Object.keys(COURSE.nodes);
// Targets reached only via the Quick-Lessons short-mode remap (see Player.tsx).
const SHORT_TARGETS = ["what-is-ttrpg", "chasm", "u6-handoff", "short-graduation"];

describe("course graph", () => {
  it("starts at a real node", () => {
    expect(ids).toContain(COURSE.start);
  });

  it("every branch points to a node that exists (no broken links)", () => {
    const broken: string[] = [];
    for (const id of ids) {
      for (const t of outgoing(COURSE.nodes[id])) {
        if (!COURSE.nodes[t]) broken.push(`${id} -> ${t}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it("every node is reachable (no orphans)", () => {
    const seen = new Set<string>([COURSE.start, ...SHORT_TARGETS]);
    const queue = [...seen];
    while (queue.length) {
      const id = queue.shift()!;
      for (const t of outgoing(COURSE.nodes[id])) {
        if (!seen.has(t)) {
          seen.add(t);
          queue.push(t);
        }
      }
    }
    const orphans = ids.filter((id) => !seen.has(id));
    expect(orphans).toEqual([]);
  });

  it("only end nodes are dead-ends (every other node leads somewhere)", () => {
    const dead = ids.filter(
      (id) => COURSE.nodes[id].kind !== "end" && outgoing(COURSE.nodes[id]).length === 0,
    );
    expect(dead).toEqual([]);
  });

  it("the story concludes — at least one terminal ending exists", () => {
    const terminals = ids.filter(
      (id) => COURSE.nodes[id].kind === "end" && outgoing(COURSE.nodes[id]).length === 0,
    );
    expect(terminals.length).toBeGreaterThan(0);
    // The two intended finales both exist.
    expect(ids).toContain("departure"); // Full-story black-hole finale
    expect(ids).toContain("short-graduation"); // Quick-Lessons conclusion
  });

  it("the dark branch and its endings are wired", () => {
    const moral = COURSE.nodes["u6-moral"];
    expect(moral.kind).toBe("choice");
    if (moral.kind === "choice") {
      // burn (dark) + bind (corrupted) options both exist and resolve
      const targets = moral.options.map((o) => o.next);
      expect(targets).toContain("u6-out-dark");
      expect(targets).toContain("u6-out-corrupted");
    }
  });
});
