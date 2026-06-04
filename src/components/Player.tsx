"use client";

import { useEffect, useRef, useState } from "react";
import type { Degree } from "@/engine/types";
import { COURSE } from "@/content/course";
import type { CourseNode } from "@/content/types";
import { CheckScene } from "./CheckScene";
import { CombatScene } from "./CombatScene";
import { EncounterScene } from "./EncounterScene";

const TOTAL_STEPS = 20; // length of the main story spine, for the progress bar

export function Player() {
  const [nodeId, setNodeId] = useState(COURSE.start);
  const [xp, setXp] = useState(0);
  const [step, setStep] = useState(1);
  const awarded = useRef<Set<string>>(new Set());

  const node = COURSE.nodes[nodeId];

  function award(id: string, bonus = 0) {
    const target = COURSE.nodes[id];
    const base = target.xp ?? 0;
    const fresh = base && !awarded.current.has(id) ? base : 0;
    if (fresh) awarded.current.add(id);
    const gain = fresh + bonus;
    if (gain) setXp((x) => x + gain);
  }

  function go(next: string, bonus = 0) {
    award(next, bonus);
    setNodeId(next);
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Award XP for the very first node, once, after mount.
  useEffect(() => {
    award(COURSE.start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <>
      <div className="topbar">
        <h1>{COURSE.title}</h1>
        <div className="progress" aria-label={`Progress ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="xp">
          <b>{xp}</b> XP
        </div>
      </div>

      <NodeView node={node} onGo={go} />
    </>
  );
}

function NodeView({
  node,
  onGo,
}: {
  node: CourseNode;
  onGo: (next: string, bonus?: number) => void;
}) {
  switch (node.kind) {
    case "narration":
      return (
        <div className="card">
          {node.speaker && <span className="speaker">{node.speaker}</span>}
          {node.lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
          <div className="actions">
            <button className="btn primary" onClick={() => onGo(node.next)}>
              Continue
            </button>
          </div>
        </div>
      );

    case "teach":
      return (
        <div className="card">
          {node.speaker && <span className="speaker">{node.speaker}</span>}
          <h2>{node.title}</h2>
          {node.body.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
          {node.points && (
            <ul className="points">
              {node.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}
          <div className="actions">
            <button className="btn primary" onClick={() => onGo(node.next)}>
              Got it
            </button>
          </div>
        </div>
      );

    case "choice":
      return (
        <div className="card">
          {node.speaker && <span className="speaker">{node.speaker}</span>}
          <h2>{node.prompt}</h2>
          <div className="actions">
            {node.options.map((o, i) => (
              <button className="btn" key={i} onClick={() => onGo(o.next)}>
                {o.label}
                {o.hint && <span className="hint">{o.hint}</span>}
              </button>
            ))}
          </div>
        </div>
      );

    case "quiz":
      return <Quiz node={node} onGo={onGo} />;

    case "check":
      return (
        <CheckScene
          node={node}
          onResolved={(_degree: Degree, next, bonusXp) => onGo(next, bonusXp)}
        />
      );

    case "combat":
      return <CombatScene node={node} onResolved={(next, bonus) => onGo(next, bonus)} />;

    case "encounter":
      return <EncounterScene node={node} onResolved={(next, bonus) => onGo(next, bonus)} />;

    case "end":
      return (
        <div className="card">
          <div className="crown">
            <div className="badge">👑</div>
            <div className="label">Mastered: {node.crown}</div>
          </div>
          <h2 style={{ textAlign: "center" }}>{node.title}</h2>
          {node.body.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
          <div className="upnext">
            <div className="k">Up next</div>
            <p style={{ margin: "6px 0 0" }}>{node.upNext}</p>
          </div>
          {node.next ? (
            <div className="actions">
              <button className="btn primary" onClick={() => onGo(node.next!)}>
                Continue to the next unit →
              </button>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 18, textAlign: "center" }}>
              That's the end of the current build — two complete teach-by-playing units.
              The full course continues from here to character creation and a capstone
              adventure that hands you off to a real table.
            </p>
          )}
        </div>
      );
  }
}

function Quiz({
  node,
  onGo,
}: {
  node: Extract<CourseNode, { kind: "quiz" }>;
  onGo: (next: string, bonus?: number) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const chosen = picked === null ? null : node.options[picked];

  return (
    <div className="card">
      {node.speaker && <span className="speaker">{node.speaker}</span>}
      <h2>{node.prompt}</h2>
      <div className="actions">
        {node.options.map((o, i) => {
          const isPicked = picked === i;
          const cls = isPicked ? (o.correct ? "correct" : "wrong") : "";
          return (
            <button
              className={`btn ${cls}`}
              key={i}
              disabled={chosen?.correct}
              onClick={() => setPicked(i)}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className={`feedback ${chosen.correct ? "good" : "bad"}`}>
          {chosen.feedback}
        </div>
      )}

      {chosen?.correct && (
        <div className="actions">
          <button className="btn primary" onClick={() => onGo(node.next)}>
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
