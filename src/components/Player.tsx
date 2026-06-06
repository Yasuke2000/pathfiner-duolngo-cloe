"use client";

import { useEffect, useRef, useState } from "react";
import type { Degree } from "@/engine/types";
import { COURSE } from "@/content/course";
import type { CourseNode } from "@/content/types";
import { CheckScene } from "./CheckScene";
import { CombatScene } from "./CombatScene";
import { EncounterScene } from "./EncounterScene";
import { RecoveryScene } from "./RecoveryScene";
import { BuilderScene } from "./BuilderScene";
import { HandoffScene } from "./HandoffScene";
import { TitleScreen } from "./TitleScreen";
import { Typed } from "./Typed";
import { Speaker } from "./Speaker";
import { MuteButton } from "./MuteButton";
import { SettingsPanel } from "./SettingsPanel";
import { chapterFor } from "@/lib/chapters";
import { sfx } from "@/lib/sound";
import type { BuildState } from "@/game/builder";

const TOTAL_STEPS = 40; // length of the main story spine, for the progress bar
const SAVE_KEY = "course-save-v1";

export function Player() {
  const [started, setStarted] = useState(false);
  const [nodeId, setNodeId] = useState(COURSE.start);
  const [xp, setXp] = useState(0);
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState<BuildState | null>(null);
  const awarded = useRef<Set<string>>(new Set());

  const node = COURSE.nodes[nodeId];
  const chapter = chapterFor(nodeId);

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
    if (COURSE.nodes[next].kind === "end") sfx.level();
    setNodeId(next);
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function begin() {
    sfx.unlock();
    sfx.click();
    award(COURSE.start);
    setStarted(true);
  }

  function restart() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
    awarded.current = new Set();
    setCharacter(null);
    setXp(0);
    setStep(1);
    setNodeId(COURSE.start);
    setStarted(false);
  }

  // Shift the whole scene's ambient color with the current chapter.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--accent", chapter.accent);
    }
  }, [chapter.accent]);

  // Resume a saved game on mount (after hydration, to avoid a mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const sv = JSON.parse(raw);
      if (sv && typeof sv.nodeId === "string" && COURSE.nodes[sv.nodeId]) {
        setNodeId(sv.nodeId);
        setXp(sv.xp ?? 0);
        setStep(sv.step ?? 1);
        setCharacter(sv.character ?? null);
        setStarted(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Autosave progress whenever it changes.
  useEffect(() => {
    if (!started) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, nodeId, xp, step, character }));
    } catch {
      /* ignore */
    }
  }, [started, nodeId, xp, step, character]);

  // Move focus to the new scene so screen-reader/keyboard users hear the outcome.
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (started) stageRef.current?.focus();
  }, [nodeId, started]);

  if (!started) return <TitleScreen onStart={begin} />;

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <>
      <div className="hud">
        <div className="hud-chapter">
          <span className="hud-act">Chapter {chapter.index}</span>
          <span className="hud-title">{chapter.title}</span>
        </div>
        <div className="progress" aria-label={`Progress ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="xp" title="Experience">
          <span className="xp-icon" aria-hidden>✦</span>
          <b>{xp}</b>
        </div>
        <MuteButton />
        <SettingsPanel onRestart={restart} />
      </div>

      <div className="stage" ref={stageRef} tabIndex={-1}>
        <NodeView node={node} onGo={go} character={character} onBuilt={setCharacter} />
      </div>
    </>
  );
}

function NodeView({
  node,
  onGo,
  character,
  onBuilt,
}: {
  node: CourseNode;
  character: BuildState | null;
  onBuilt: (b: BuildState) => void;
  onGo: (next: string, bonus?: number) => void;
}) {
  switch (node.kind) {
    case "narration":
      return (
        <div className="card">
          {node.speaker && <Speaker name={node.speaker} />}
          <Typed paragraphs={node.lines} />
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
          {node.speaker && <Speaker name={node.speaker} />}
          <h2>{node.title}</h2>
          <Typed paragraphs={node.body} />
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
          {node.speaker && <Speaker name={node.speaker} />}
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

    case "recovery":
      return <RecoveryScene node={node} onResolved={(next, bonus) => onGo(next, bonus)} />;

    case "builder":
      return (
        <BuilderScene
          node={node}
          onResolved={(next, bonus) => onGo(next, bonus)}
          onBuilt={onBuilt}
        />
      );

    case "handoff":
      return (
        <HandoffScene
          node={node}
          character={character}
          onResolved={(next, bonus) => onGo(next, bonus)}
        />
      );

    case "end":
      return (
        <div className="card">
          <div className="crown">
            <div className="badge">👑</div>
            <div className="label">Mastered: {node.crown}</div>
          </div>
          <h2 style={{ textAlign: "center" }}>{node.title}</h2>
          <Typed paragraphs={node.body} />
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
      {node.speaker && <Speaker name={node.speaker} />}
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
