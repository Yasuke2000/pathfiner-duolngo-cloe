"use client";

import { useEffect, useRef, useState } from "react";
import { rollD20 } from "@/engine/dice";
import { recoveryCheck, type DyingState } from "@/engine/dying";
import type { Degree } from "@/engine/types";
import type { RecoveryNode } from "@/content/types";
import { DEGREE_THEME } from "./degrees";

type Phase = "rolling" | "stable";

interface LogEntry {
  id: number;
  text: string;
  degree?: Degree;
  system?: boolean;
}

export function RecoveryScene({
  node,
  onResolved,
}: {
  node: RecoveryNode;
  onResolved: (next: string, bonusXp?: number) => void;
}) {
  const [state, setState] = useState<DyingState>({
    dying: node.startingDying,
    wounded: 0,
    doomed: 0,
  });
  const [phase, setPhase] = useState<Phase>("rolling");
  const [face, setFace] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const logId = useRef(0);
  const spin = useRef<ReturnType<typeof setInterval> | null>(null);
  const rescued = useRef(false);

  function push(text: string, degree?: Degree, system = false) {
    logId.current += 1;
    setLog((l) => [...l, { id: logId.current, text, degree, system }]);
  }

  useEffect(() => () => { if (spin.current) clearInterval(spin.current); }, []);

  function roll() {
    if (busy || phase === "stable") return;
    setBusy(true);
    spin.current = setInterval(() => setFace(Math.floor(Math.random() * 20) + 1), 70);

    setTimeout(() => {
      if (spin.current) clearInterval(spin.current);
      const die = rollD20();
      setFace(die);
      const r = recoveryCheck(state, die);

      const delta =
        r.degree === "critical-success"
          ? "Dying −2"
          : r.degree === "success"
            ? "Dying −1"
            : r.degree === "critical-failure"
              ? `Dying +${2 + state.wounded}`
              : `Dying +${1 + state.wounded}`;
      push(`Recovery check 🎲 ${die} vs DC ${r.dc} — ${DEGREE_THEME[r.degree].label}. ${delta}.`, r.degree);

      if (r.dead && !rescued.current) {
        // Death is caught by the companion so the lesson lands without a game over.
        rescued.current = true;
        push(
          "You slip under — but Bram spends a Hero Point, hauls you upright and pours a healing draught down your throat. You're stable, and you gain Wounded 1.",
          undefined,
          true,
        );
        setState({ dying: 0, wounded: Math.max(1, state.wounded + 1), doomed: 0 });
        setPhase("stable");
      } else {
        setState(r.state);
        if (r.stabilized) {
          push("You claw back to consciousness — stable, and now Wounded.", undefined, true);
          setPhase("stable");
        }
      }
      setBusy(false);
    }, 900);
  }

  const logEnd = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    logEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [log]);

  return (
    <div className="card">
      <span className="speaker">Dying</span>
      <h2>{node.prompt}</h2>
      {log.length === 0 && node.intro.map((l, i) => <p key={i}>{l}</p>)}

      {/* Dying meter */}
      <div className="dying-meter" aria-label={`Dying ${state.dying} of 4`}>
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={`dpip ${n <= state.dying ? "on" : ""} ${n === 4 ? "death" : ""}`}>
            {n === 4 ? "☠" : "✦"}
          </span>
        ))}
        <span className="dying-label">
          Dying {state.dying} · DC {10 + state.dying} · Wounded {state.wounded}
        </span>
      </div>

      <div className={`die small ${busy ? "rolling" : ""}`}>{face ?? "?"}</div>

      <div className="log" role="log" aria-live="polite">
        {log.map((e) => {
          const t = e.degree ? DEGREE_THEME[e.degree] : null;
          return (
            <div key={e.id} className={`log-entry ${e.system ? "system" : "hero"}`}>
              {t && <span className="deg" style={{ color: `var(${t.varName})` }}>{t.symbol}</span>}
              <span>{e.text}</span>
            </div>
          );
        })}
        <div ref={logEnd} />
      </div>

      {phase === "rolling" ? (
        <div className="actions">
          <button className="btn primary" onClick={roll} disabled={busy}>
            {busy ? "Rolling…" : "Roll recovery check"}
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            {node.stabilizedLines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
          <div className="actions">
            <button className="btn primary" onClick={() => onResolved(node.next, 10)}>
              Continue
            </button>
          </div>
        </>
      )}
    </div>
  );
}
