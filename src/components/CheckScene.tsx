"use client";

import { useEffect, useRef, useState } from "react";
import type { Degree } from "@/engine/types";
import { checkModifier, degreeOdds, performCheck, type PerformedCheck } from "@/game/perform";
import { PREGEN_HERO } from "@/game/hero";
import type { CheckNode } from "@/content/types";
import { sfx } from "@/lib/sound";
import { useReduceMotion } from "@/lib/settings";
import { Die } from "./Die";
import { DEGREE_ORDER, DEGREE_THEME } from "./degrees";

type Phase = "ready" | "rolling" | "revealed" | "outcome";

const ROLL_MS = 1100;

export function CheckScene({
  node,
  onResolved,
}: {
  node: CheckNode;
  onResolved: (degree: Degree, next: string, bonusXp?: number) => void;
}) {
  const reduce = useReduceMotion();
  const [phase, setPhase] = useState<Phase>("ready");
  const [face, setFace] = useState(20); // the number shown on the tumbling die
  const [result, setResult] = useState<PerformedCheck | null>(null);
  const [flash, setFlash] = useState<Degree | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  function maybeFlash(degree: Degree) {
    if (degree === "critical-success" || degree === "critical-failure") {
      setFlash(degree);
      setTimeout(() => setFlash(null), 650);
    }
  }

  // Pre-roll odds: show the player exactly what they're rolling against.
  const { modifierTotal } = checkModifier(PREGEN_HERO, node.spec);
  const odds = degreeOdds(modifierTotal, node.spec.dc);
  const pct = (n: number) => Math.round(n * 100);

  useEffect(() => () => clearTimer(), []);

  function clearTimer() {
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
  }

  function roll() {
    const outcome = performCheck(PREGEN_HERO, node.spec);
    setResult(outcome);
    sfx.roll();

    if (reduce) {
      // Honor reduced motion: snap straight to the result.
      setFace(outcome.die);
      setPhase("revealed");
      sfx.degree(outcome.degree);
      maybeFlash(outcome.degree);
      return;
    }

    setPhase("rolling");
    // Spin the visible face for a beat, then settle on the real die.
    tick.current = setInterval(() => setFace(Math.floor(Math.random() * 20) + 1), 70);
    setTimeout(() => {
      clearTimer();
      setFace(outcome.die);
      setPhase("revealed");
      sfx.degree(outcome.degree);
      maybeFlash(outcome.degree);
    }, ROLL_MS);
  }

  const degree = result?.degree;
  const theme = degree ? DEGREE_THEME[degree] : null;
  const dieTone: "gold" | "crit" | "fumble" =
    result && phase !== "rolling"
      ? result.die === 20
        ? "crit"
        : result.die === 1
          ? "fumble"
          : "gold"
      : "gold";

  return (
    <div className="card">
      {flash && <div className={`screen-flash ${flash}`} aria-hidden />}
      <span className="speaker">Roll the dice</span>
      <h2>{node.prompt}</h2>

      <div className="die-stage">
        <Die value={phase === "ready" ? "?" : face} rolling={phase === "rolling"} tone={dieTone} />
      </div>
      {result && result.die === 20 && phase !== "rolling" && (
        <p className="shift-note">Natural 20! The die bumps your result up one band.</p>
      )}
      {result && result.die === 1 && phase !== "rolling" && (
        <p className="shift-note">Natural 1! The die bumps your result down one band.</p>
      )}

      {phase === "ready" && (
        <>
          <div className="odds">
            <div className="odds-head">
              <span>
                {node.spec.label}{" "}
                <b>{modifierTotal >= 0 ? `+${modifierTotal}` : modifierTotal}</b> vs DC{" "}
                <b>{node.spec.dc}</b>
              </span>
              <span className="muted">your chances</span>
            </div>
            <div className="odds-bars">
              {DEGREE_ORDER.slice().reverse().map((d) => {
                const t = DEGREE_THEME[d];
                const p = pct(odds[d]);
                return (
                  <div className="odds-row" key={d}>
                    <span className="odds-label" style={{ color: `var(${t.varName})` }}>
                      {t.symbol} {t.label}
                    </span>
                    <span className="odds-track">
                      <span className="odds-fill" style={{ width: `${p}%`, background: `var(${t.varName})` }} />
                    </span>
                    <span className="odds-pct">{p}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="actions">
            <button className="btn primary" onClick={roll}>
              Roll the d20
            </button>
          </div>
        </>
      )}

      {result && phase !== "ready" && phase !== "rolling" && (
        <>
          <div className="breakdown">
            {result.breakdown.map((b, i) => (
              <div key={i} className={`row ${b.dropped ? "dropped" : ""}`}>
                <span>{b.label}</span>
                <span className="val">
                  {b.value >= 0 ? `+${b.value}` : b.value}
                </span>
              </div>
            ))}
            <div className="row total">
              <span>Total vs DC {result.dc}</span>
              <span className="val">{result.total}</span>
            </div>
          </div>

          <div className="bands">
            {DEGREE_ORDER.map((d) => {
              const t = DEGREE_THEME[d];
              const active = d === degree;
              return (
                <div
                  key={d}
                  className={`band ${active ? "active" : ""}`}
                  style={active ? { background: `var(${t.varName})`, borderColor: `var(${t.varName})` } : undefined}
                >
                  <span className="sym">{t.symbol}</span>
                  {t.label}
                </div>
              );
            })}
          </div>

          {theme && (
            <div
              className="result-banner"
              style={{ background: `var(${theme.varName})` }}
            >
              {theme.symbol} {theme.label}
            </div>
          )}
          {result.shifted && (
            <p className="shift-note">
              Your total alone was a <b>{DEGREE_THEME[result.baseDegree].label}</b> — the
              natural die shifted it {result.shifted}.
            </p>
          )}

          <div className="actions">
            <button className="btn primary" onClick={() => setPhase("outcome")} disabled={phase === "outcome"}>
              See what happens →
            </button>
          </div>
        </>
      )}

      {phase === "outcome" && result && degree && (
        <Outcome
          lines={node.outcomes[degree].lines}
          canRetry={!!node.retry && (degree === "failure" || degree === "critical-failure")}
          onRetry={() => {
            setResult(null);
            setPhase("ready");
          }}
          onContinue={() =>
            onResolved(
              degree,
              node.outcomes[degree].next,
              node.outcomes[degree].bonusXp,
            )
          }
        />
      )}
    </div>
  );
}

function Outcome({
  lines,
  canRetry,
  onRetry,
  onContinue,
}: {
  lines: string[];
  canRetry: boolean;
  onRetry: () => void;
  onContinue: () => void;
}) {
  return (
    <div style={{ marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 18 }}>
      {lines.map((l, i) => (
        <p key={i}>{l}</p>
      ))}
      {canRetry && (
        <p className="shift-note">
          This is a check you can retry — steady yourself, remember the math, and roll again.
        </p>
      )}
      <div className="actions">
        {canRetry && (
          <button className="btn" onClick={onRetry}>
            Take a breath & try again
          </button>
        )}
        <button className="btn primary" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
