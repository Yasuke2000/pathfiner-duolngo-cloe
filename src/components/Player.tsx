"use client";

import { useEffect, useRef, useState } from "react";
import type { Degree } from "@/engine/types";
import { COURSE } from "@/content/course";
import type { CourseNode, Effect, Flags, Lines, StoryCtx } from "@/content/types";
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
import { getSettings } from "@/lib/settings";
import { combatHeroFromBuild } from "@/game/heroFromBuild";
import { downloadSeal } from "@/game/seal";
import { addressTerm, type BuildState } from "@/game/builder";

const TOTAL_STEPS = 40; // length of the main story spine, for the progress bar
const SAVE_KEY = "course-save-v1";

export function Player() {
  const [started, setStarted] = useState(false);
  const [nodeId, setNodeId] = useState(COURSE.start);
  const [xp, setXp] = useState(0);
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState<BuildState | null>(null);
  const [flags, setFlags] = useState<Flags>({});
  const [transcript, setTranscript] = useState<{ id: number; speaker?: string; text: string }[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [mode, setMode] = useState<"full" | "short">("full");
  const awarded = useRef<Set<string>>(new Set());
  const logId = useRef(0);
  const firstSave = useRef(true);

  const node = COURSE.nodes[nodeId];
  const chapter = chapterFor(nodeId);

  const heroName = character?.name?.trim() || "you";
  const address = addressTerm(character?.pronouns);
  const ctx: StoryCtx = { flags, character, hero: heroName, address };
  const resolve = (lines: Lines): string[] => (typeof lines === "function" ? lines(ctx) : lines);

  function runEffect(effect?: Effect) {
    if (!effect) return;
    effect({
      flags,
      character,
      set: (patch) =>
        setFlags(
          (prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }) as Flags,
        ),
    });
  }

  function award(id: string, bonus = 0) {
    const target = COURSE.nodes[id];
    const base = target.xp ?? 0;
    const fresh = base && !awarded.current.has(id) ? base : 0;
    if (fresh) awarded.current.add(id);
    const gain = fresh + bonus;
    if (gain) setXp((x) => x + gain);
  }

  function logToTranscript(text: string, speaker?: string) {
    logId.current += 1;
    const id = logId.current;
    setTranscript((t) => [...t, { id, speaker, text }]);
  }

  // In Quick-Lessons mode, bypass the story-heavy branches and finale.
  const SHORT_REMAP: Record<string, string> = {
    "intro-choice": "what-is-ttrpg",
    "chasm-approach": "chasm",
    "u6-intro": "u6-handoff",
    graduation: "short-graduation",
  };

  function go(rawNext: string, bonus = 0) {
    const next = mode === "short" && SHORT_REMAP[rawNext] ? SHORT_REMAP[rawNext] : rawNext;
    runEffect(COURSE.nodes[next].enter);
    award(next, bonus);
    const target = COURSE.nodes[next];
    if (target.kind === "end") (target.portal ? sfx.portal() : sfx.level());
    else sfx.page();
    setNodeId(next);
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function newGame(chosenMode: "full" | "short" = "full") {
    setMode(chosenMode);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
    awarded.current = new Set();
    firstSave.current = true;
    setFlags({});
    setTranscript([]);
    setCharacter(null);
    setXp(0);
    setStep(1);
    setNodeId(COURSE.start);
    setResumed(false);
    sfx.unlock();
    sfx.click();
    sfx.music(getSettings().music);
    runEffect(COURSE.nodes[COURSE.start].enter);
    award(COURSE.start);
    setStarted(true);
  }

  function continueGame() {
    sfx.unlock();
    sfx.music(getSettings().music);
    setStarted(true);
  }

  function restart() {
    newGame();
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
        setFlags(sv.flags ?? {});
        if (sv.mode === "short" || sv.mode === "full") setMode(sv.mode);
        setResumed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Keyboard navigation: Enter/Space advances narration; number keys pick choices.
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      const n = COURSE.nodes[nodeId];
      const ae = document.activeElement;
      const onControl =
        ae instanceof HTMLElement && ["BUTTON", "A", "INPUT", "TEXTAREA"].includes(ae.tagName);
      if ((n.kind === "narration" || n.kind === "teach") && (e.key === "Enter" || e.key === " ")) {
        if (onControl) return; // let a focused button handle it
        e.preventDefault();
        go(n.next);
      } else if (n.kind === "end" && n.next && e.key === "Enter" && !onControl) {
        e.preventDefault();
        go(n.next);
      } else if (n.kind === "choice") {
        const idx = parseInt(e.key, 10) - 1;
        const o = n.options[idx];
        if (o && !(o.requires && !o.requires(ctx))) {
          logToTranscript(`You chose: ${o.label}`);
          runEffect(o.set);
          go(o.next);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, nodeId, flags, character]);

  // Autosave progress whenever it changes.
  useEffect(() => {
    if (!started) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, nodeId, xp, step, character, flags, mode }));
    } catch {
      /* ignore */
    }
    if (firstSave.current) {
      firstSave.current = false;
      return;
    }
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1200);
    return () => clearTimeout(t);
  }, [started, nodeId, xp, step, character, flags, mode]);

  // Move focus to the new scene so screen-reader/keyboard users hear the outcome.
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (started) stageRef.current?.focus();
  }, [nodeId, started]);

  // Record story beats into the scrollback transcript as they're reached.
  useEffect(() => {
    if (!started) return;
    const n = COURSE.nodes[nodeId];
    const c: StoryCtx = { flags, character, hero: heroName, address };
    const r = (l: Lines) => (typeof l === "function" ? l(c) : l);
    if (n.kind === "narration") r(n.lines).forEach((t) => logToTranscript(t, n.speaker));
    else if (n.kind === "teach") {
      logToTranscript(n.title, n.speaker);
      r(n.body).forEach((t) => logToTranscript(t));
    } else if (n.kind === "end") {
      logToTranscript(n.title);
      r(n.body).forEach((t) => logToTranscript(t));
    } else if (n.kind === "choice") logToTranscript(n.prompt, n.speaker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, started]);

  if (!started)
    return <TitleScreen onStart={(m) => newGame(m)} onContinue={continueGame} canContinue={resumed} />;

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
        <button
          className="mute-btn"
          aria-label="Story log"
          title="Story log"
          onClick={() => setShowLog(true)}
        >
          📜
        </button>
        <MuteButton />
        <SettingsPanel onRestart={restart} />
      </div>

      <div className="stage" ref={stageRef} tabIndex={-1}>
        <div key={nodeId} className="scene">
          <NodeView
            node={node}
            onGo={go}
            character={character}
            onBuilt={setCharacter}
            ctx={ctx}
            resolve={resolve}
            runEffect={runEffect}
            onChoose={logToTranscript}
          />
        </div>
      </div>

      {savedFlash && <div className="saved-toast" role="status">Saved ✓</div>}

      {showLog && (
        <div className="modal-scrim" onClick={() => setShowLog(false)}>
          <div className="modal log-modal" role="dialog" aria-label="Story log" onClick={(e) => e.stopPropagation()}>
            <h2>Story so far</h2>
            <div className="transcript">
              {transcript.length === 0 && <p className="muted">Your story will appear here as you play.</p>}
              {transcript.map((e) => (
                <p key={e.id} className="prose">
                  {e.speaker && <b className="t-speaker">{e.speaker}: </b>}
                  {e.text}
                </p>
              ))}
            </div>
            <div className="actions">
              <button className="btn primary" onClick={() => setShowLog(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NodeView({
  node,
  onGo,
  character,
  onBuilt,
  ctx,
  resolve,
  runEffect,
  onChoose,
}: {
  node: CourseNode;
  character: BuildState | null;
  onBuilt: (b: BuildState) => void;
  onGo: (next: string, bonus?: number) => void;
  ctx: StoryCtx;
  resolve: (lines: Lines) => string[];
  runEffect: (e?: Effect) => void;
  onChoose: (text: string, speaker?: string) => void;
}) {
  switch (node.kind) {
    case "narration":
      return (
        <div className="card">
          {node.speaker && <Speaker name={node.speaker} />}
          <Typed paragraphs={resolve(node.lines)} />
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
          <Typed paragraphs={resolve(node.body)} />
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
            {node.options.map((o, i) => {
              const locked = o.requires ? !o.requires(ctx) : false;
              return (
                <button
                  className="btn"
                  key={i}
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    onChoose(`You chose: ${o.label}`);
                    runEffect(o.set);
                    onGo(o.next);
                  }}
                >
                  {locked ? "🔒 " : ""}
                  {o.label}
                  {(locked ? o.lockedHint : o.hint) && (
                    <span className="hint">{locked ? o.lockedHint : o.hint}</span>
                  )}
                </button>
              );
            })}
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
      return (
        <EncounterScene
          node={node}
          onResolved={(next, bonus) => onGo(next, bonus)}
          hero={node.useBuiltHero && character ? combatHeroFromBuild(character) : undefined}
        />
      );

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
        <>
          {node.portal && <div className="finale-aura" aria-hidden />}
          <div className={`card ${node.portal ? "finale-card" : ""}`}>
            {!node.portal && (
              <div className="crown">
                <div className="badge">👑</div>
                <div className="label">Mastered: {node.crown}</div>
              </div>
            )}
            <h2 style={{ textAlign: "center" }}>{node.title}</h2>
            <Typed paragraphs={resolve(node.body)} />
            {node.portal && (
              <div className="seal-block">
                <button className="btn" onClick={() => downloadSeal(character, ctx.flags)}>
                  🔒 Seal your origin <span className="hint">a sealed record of your backstory — hand it to your Game Master</span>
                </button>
                <p className="muted" style={{ marginTop: 8 }}>
                  Your GM can decode it (and learn what you did) at <b>/gm</b> — and give you a fitting curse &amp; blessing.
                </p>
              </div>
            )}
            {node.upNext && (
              <div className="upnext">
                <div className="k">Up next</div>
                <p style={{ margin: "6px 0 0" }}>{node.upNext}</p>
              </div>
            )}
            {node.next ? (
              <div className="actions">
                <button className="btn primary" onClick={() => onGo(node.next!)}>
                  Continue →
                </button>
              </div>
            ) : (
              <p className="muted" style={{ marginTop: 18, textAlign: "center" }}>
                {node.portal
                  ? "Your origin is set: the spark sleeps, and the memory of tonight fades — so nothing binds the backstory you write. Your home, your ties, who you've been: all yours to fill in, with only a dream and a feeling left behind."
                  : "That's the end of the current build."}
              </p>
            )}
          </div>
        </>
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
