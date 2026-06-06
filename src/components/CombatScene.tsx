"use client";

import { useEffect, useRef, useState } from "react";
import { multipleAttackPenalty, spendAction, startTurn, type TurnState } from "@/engine/actions";
import type { Degree } from "@/engine/types";
import { PREGEN_HERO } from "@/game/hero";
import {
  enemyStrike,
  heroDemoralize,
  heroStrike,
  spawnEnemy,
  type EnemyState,
} from "@/game/combat";
import type { CombatNode } from "@/content/types";
import { sfx } from "@/lib/sound";
import { DEGREE_THEME } from "./degrees";

type Phase = "intro" | "player" | "enemy" | "won";

interface LogEntry {
  id: number;
  text: string;
  degree?: Degree;
  who: "hero" | "enemy" | "system";
}

const INTENTS = [
  "The marauder hefts its axe — it will Strike you next turn.",
  "It circles, snarling, looking for an opening to Strike.",
  "The marauder plants its feet and readies a heavy Strike.",
  "Wounded and wary, it lines up another Strike.",
];

const hero = PREGEN_HERO;

export function CombatScene({
  node,
  onResolved,
}: {
  node: CombatNode;
  onResolved: (next: string, bonusXp?: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [enemy, setEnemy] = useState<EnemyState>(() => spawnEnemy(node.enemy));
  const [hp, setHp] = useState(hero.combat.maxHp);
  const [turn, setTurn] = useState<TurnState>(() => startTurn());
  const [shieldRaised, setShieldRaised] = useState(false);
  const [round, setRound] = useState(1);
  const [intent, setIntent] = useState(INTENTS[0]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const cushioned = useRef(false);
  const logId = useRef(0);

  function pushLog(text: string, who: LogEntry["who"], degree?: Degree) {
    logId.current += 1;
    setLog((l) => [...l, { id: logId.current, text, who, degree }]);
  }

  // --- Player actions -----------------------------------------------------
  const canAct = phase === "player" && turn.actionsRemaining > 0;

  function onStrike() {
    if (!canAct) return;
    const out = heroStrike(hero, enemy, turn.attacksThisTurn);
    const roll = `🎲 ${out.result.die} → ${out.result.total} vs AC ${out.targetAc}${
      out.map ? ` (MAP ${out.map})` : ""
    }`;
    let text: string;
    if (out.result.degree === "critical-success") text = `Critical hit! Your blade bites deep — ${out.damage} damage. ${roll}`;
    else if (out.result.degree === "success") text = `A clean hit for ${out.damage} damage. ${roll}`;
    else if (out.result.degree === "critical-failure") text = `You overextend and miss badly. ${roll}`;
    else text = `Your swing goes wide.${out.map ? " That attack penalty stung." : ""} ${roll}`;

    out.damage > 0 ? sfx.hit() : sfx.miss();
    const nextHp = Math.max(0, enemy.hp - out.damage);
    setEnemy({ ...enemy, hp: nextHp });
    setTurn(spendAction(turn, 1, true));
    pushLog(text, "hero", out.result.degree);
    if (nextHp <= 0) {
      sfx.victory();
      setPhase("won");
    }
  }

  function onDemoralize() {
    if (!canAct) return;
    const out = heroDemoralize(hero, enemy);
    const roll = `🎲 ${out.result.die} → ${out.result.total} vs Will DC ${enemy.willDC}`;
    let text: string;
    if (out.frightened > 0) {
      const value = Math.max(enemy.frightened, out.frightened);
      setEnemy({ ...enemy, frightened: value });
      text = `You roar a threat and the marauder flinches — Frightened ${value}! Its AC and attacks drop. ${roll}`;
    } else {
      text = `Your threat doesn't land; it just sneers. ${roll}`;
    }
    setTurn(spendAction(turn, 1, false)); // Demoralize has no attack trait — no MAP
    pushLog(text, "hero", out.result.degree);
  }

  function onRaiseShield() {
    if (!canAct) return;
    setShieldRaised(true);
    setTurn(spendAction(turn, 1, false));
    pushLog("You raise your shield (+2 AC until your next turn).", "hero");
  }

  function onEndTurn() {
    if (phase !== "player") return;
    setPhase("enemy");
  }

  // --- Enemy turn ---------------------------------------------------------
  useEffect(() => {
    if (phase !== "enemy") return;
    const id = setTimeout(() => {
      const out = enemyStrike(hero, enemy, shieldRaised);
      const roll = `🎲 ${out.result.die} → ${out.result.total} vs AC ${out.targetAc}`;
      if (out.damage > 0) {
        let next = hp - out.damage;
        if (next <= 0 && !cushioned.current) {
          cushioned.current = true;
          pushLog(
            `The axe lands hard — but Bram shoulders in and drags you clear before it finishes you. (Steadied at 3 HP.)`,
            "system",
          );
          next = 3;
        } else if (next <= 0) {
          next = 1;
        } else {
          pushLog(`The marauder's axe catches you for ${out.damage} damage. ${roll}`, "enemy", out.result.degree);
        }
        setHp(Math.max(1, next));
      } else {
        pushLog(`You turn the axe aside${shieldRaised ? " on your raised shield" : ""}. ${roll}`, "enemy", out.result.degree);
      }

      // Frightened ticks down at the end of the frightened creature's turn.
      const fr = Math.max(0, enemy.frightened - 1);
      setEnemy((e) => ({ ...e, frightened: fr }));
      setShieldRaised(false);
      setTurn(startTurn());
      setRound((r) => r + 1);
      setIntent(INTENTS[(round) % INTENTS.length]);
      setPhase("player");
    }, 850);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-scroll the log to the newest entry.
  const logEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [log]);

  // --- Derived readouts ---------------------------------------------------
  const nextMap = multipleAttackPenalty(turn.attacksThisTurn, hero.combat.agile);
  const nextStrikeBonus = hero.combat.strikeBonus + nextMap;
  const targetAc = enemy.ac - enemy.frightened;
  const showCoaching =
    phase === "player" &&
    turn.attacksThisTurn >= 2 &&
    turn.actionsRemaining >= 1 &&
    enemy.frightened === 0;

  if (phase === "intro") {
    return (
      <div className="card">
        <span className="speaker">Encounter</span>
        <h2>{node.prompt}</h2>
        <p>{enemy.blurb}</p>
        {node.intro.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
        <div className="actions">
          <button className="btn primary" onClick={() => setPhase("player")}>
            Roll initiative — begin the fight
          </button>
        </div>
      </div>
    );
  }

  if (phase === "won") {
    return (
      <div className="card">
        <span className="speaker">Victory</span>
        <h2>{enemy.name.replace(/^the /, "The ")} is defeated</h2>
        {node.victoryLines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
        <div className="actions">
          <button className="btn primary" onClick={() => onResolved(node.next, 15)}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  // --- Main combat view ---------------------------------------------------
  return (
    <div className="card">
      <span className="speaker">Round {round}</span>

      <div className="combatant enemy">
        <div className="cb-head">
          <strong>{enemy.name.replace(/^the /, "The ")}</strong>
          {enemy.frightened > 0 && (
            <span className="cond" title="Frightened lowers its AC and attacks">
              ✕ Frightened {enemy.frightened}
            </span>
          )}
        </div>
        <Hpbar hp={enemy.hp} max={enemy.maxHp} tone="enemy" />
        <div className="intent">⚔ {intent}</div>
      </div>

      <div className="log" role="log" aria-live="polite">
        {log.length === 0 && <p className="muted">The fight begins. Spend your actions wisely.</p>}
        {log.map((e) => {
          const t = e.degree ? DEGREE_THEME[e.degree] : null;
          return (
            <div key={e.id} className={`log-entry ${e.who}`}>
              {t && (
                <span className="deg" style={{ color: `var(${t.varName})` }}>
                  {t.symbol}
                </span>
              )}
              <span>{e.text}</span>
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>

      <div className="combatant hero">
        <div className="cb-head">
          <strong>{hero.name}</strong>
          {shieldRaised && <span className="cond shield" title="+2 AC until your next turn">🛡 Shield up</span>}
        </div>
        <Hpbar hp={hp} max={hero.combat.maxHp} tone="hero" />
      </div>

      {showCoaching && (
        <div className="feedback bad" style={{ borderColor: "var(--gold-dim)" }}>
          <b>Bram:</b> “That next swing is at −10 — it’ll almost certainly miss. Spend the
          action on <b>Demoralize</b> or <b>Raise a Shield</b> instead.”
        </div>
      )}

      <div className="pips" aria-label={`${turn.actionsRemaining} of 3 actions remaining`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`pip ${i < turn.actionsRemaining ? "" : "spent"}`}>◆</span>
        ))}
        <span className="pips-label">{turn.actionsRemaining} / 3 actions</span>
      </div>

      <div className="actions combat-actions">
        <button className="btn" onClick={onStrike} disabled={!canAct}>
          Strike <span className="hint">+{nextStrikeBonus} vs AC {targetAc}{nextMap ? ` · MAP ${nextMap}` : " · no penalty"}</span>
        </button>
        <button className="btn" onClick={onDemoralize} disabled={!canAct}>
          Demoralize <span className="hint">+{hero.combat.intimidationBonus} vs Will DC {enemy.willDC} · no attack penalty</span>
        </button>
        <button className="btn" onClick={onRaiseShield} disabled={!canAct || shieldRaised}>
          Raise a Shield <span className="hint">+2 AC until your next turn</span>
        </button>
        <button
          className="btn primary"
          onClick={onEndTurn}
          disabled={phase !== "player"}
        >
          {turn.actionsRemaining > 0 ? "End turn (skip remaining)" : "End turn"}
        </button>
      </div>
    </div>
  );
}

function Hpbar({ hp, max, tone }: { hp: number; max: number; tone: "hero" | "enemy" }) {
  const pct = Math.max(0, Math.round((hp / max) * 100));
  return (
    <div className="hpbar">
      <span className={`fill ${tone}`} style={{ width: `${pct}%` }} />
      <span className="hp-text">
        {hp} / {max} HP
      </span>
    </div>
  );
}
