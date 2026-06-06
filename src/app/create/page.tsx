"use client";

import Link from "next/link";
import { BuilderScene } from "@/components/BuilderScene";
import type { BuilderNode } from "@/content/types";

const NODE: BuilderNode = {
  kind: "builder",
  prompt: "Build a hero",
  intro: [
    "Build a complete, rules-legal level-1 Pathfinder 2e hero, one choice at a time — then download it as a PDF, JSON, or Pathbuilder file. No story required.",
  ],
  next: "",
};

export default function CreatePage() {
  return (
    <main className="shell">
      <div style={{ marginBottom: 16 }}>
        <Link className="text-btn" href="/">
          ← Back to the course
        </Link>
      </div>
      <BuilderScene node={NODE} onResolved={() => {}} standalone />
    </main>
  );
}
