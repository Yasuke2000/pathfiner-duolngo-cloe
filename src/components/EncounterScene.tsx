"use client";

import { useEffect, useRef, useState } from "react";
import type { Degree } from "@/engine/types";
import {
  ALLY_BRAM,
  effectiveAc,
  heroCombatant,
  makeCombatant,
  makeDemoralize,
  makeStrike,
  makeTrip,
  rollInitiative,
  rollLabel,
  type Combatant,
} from "@/game/encounter";
import { multipleAttackPenalty } from "@/engine/actions";
import type { EncounterNode } from "@/content/types";
import { sfx } from "@/lib/sound";
import { DEGREE_THEME } from "./degrees";

type Phase = "intro" | "hero" | "auto" | "reaction" | "won";
type Targeting = "strike" | "demoralize" | null;

interface LogEntry {
  id: number;
  text: string;
  who: "hero" | "ally" | "enemy" | "system";
  degree?: Degree;
}

interface PendingReaction {
  attackerName: string;
  damage: number;
  rollText: string;
}

const TURN_DELAY = 900;

export function EncounterScene({
  node,
  onResolved,
}: {
  node: EncounterNode;
  onResolved: (next: string, bonusXp?: number) => void;
}) {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [ptr, setPtr] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>("intro");
  const [heroActions, setHeroActions] = useState(3);
  const [heroAttacks, setHeroAttacks] = useState(0);
  const [targeting, setTargeting] = useState<Targeting>(null);
  const [pending, setPending] = useState<PendingReaction | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const logId = useRef(0);
  const cushioned = useRef(false);
  const actedKey = useRef("");

  const byId = (id: string) => combatants.find((c) => c.id === id);
  const heroC = combatants.find((c) => c.role === "hero");
  const foes = combatants.filter((c) => c.role === "foe");
  const aliveFoes = foes.filter((c) => !c.defeated);
  const current = byId(order[ptr]);

  function pushLog(text: string, who: LogEntry["who"], degree?: Degree) {
    logId.current += 1;
    setLog((l) => [...l, { id: logId.current, text, who, degree }]);
  }

  function patch(cs: Combatant[], id: string, p: Partial<Combatant>): Combatant[] {
    return cs.map((c) => (c.id === id ? { ...c, ...p } : c));
  }

  // --- Start ---------------------------------------------------------------
  function begin() {
    const roster = [
      heroCombatant(),
      ALLY_BRAM(),
      ...node.foes.map((f) => makeCombatant(f)),
    ];
    const { combatants: rolled, order: ord } = rollInitiative(roster);
    setCombatants(rolled);
    setOrder(ord);
    setPtr(0);
    setRound(1);
    pushLog(
      `Initiative! Order: ${ord.map((id) => rolled.find((c) => c.id === id)!.name).join(" → ")}.`,
      "system",
    );
    enterTurn(rolled, ord, 0, 1);
  }

  /** Set up whichever combatant's turn it is at `index`. */
  function enterTurn(cs: Combatant[], ord: string[], index: number, rnd: number) {
    const c = cs.find((x) => x.id === ord[index])!;
    // Reaction refreshes at the start of each creature's own turn.
    const refreshed = patch(cs, c.id, { reactionAvailable: true });
    setCombatants(refreshed);
    if (c.role === "hero") {
      setHeroActions(3);
      setHeroAttacks(0);
      setPhase("hero");
    } else {
      setPhase("auto");
    }
  }

  /** End the current turn: tick frightened down, advance to the next living combatant. */
  function endTurn(cs: Combatant[]) {
    const curId = order[ptr];
    let next = patch(cs, curId, {
      frightened: Math.max(0, (cs.find((c) => c.id === curId)!.frightened) - 1),
    });

    if (next.filter((c) => c.role === "foe" && !c.defeated).length === 0) {
      setCombatants(next);
      setPhase("won");
      return;
    }

    let i = ptr;
    let rnd = round;
    for (let step = 0; step < order.length; step++) {
      i = (i + 1) % order.length;
      if (i === 0) rnd += 1;
      const candidate = next.find((c) => c.id === order[i])!;
      if (!candidate.defeated) break;
    }
    setCombatants(next);
    setPtr(i);
    setRound(rnd);
    enterTurn(next, order, i, rnd);
  }

  function applyDamage(cs: Combatant[], id: string, dmg: number): Combatant[] {
    const target = cs.find((c) => c.id === id)!;
    let hp = target.hp - dmg;
    if (target.role === "hero" && hp <= 0) {
      if (!cushioned.current) {
        cushioned.current = true;
        pushLog("You're nearly cut down — but you grit your teeth and stay up. (Steadied at 3 HP.)", "system");
        hp = 3;
      } else {
        hp = 1;
      }
      return patch(cs, id, { hp });
    }
    if (hp <= 0) {
      const defeated = target.role === "ally";
      pushLog(
        target.role === "ally"
          ? `${target.name} is knocked out! Keep fighting — you can still win this.`
          : `${target.name} is defeated.`,
        "system",
      );
      return patch(cs, id, { hp: 0, defeated });
    }
    return patch(cs, id, { hp });
  }

  // --- Hero actions --------------------------------------------------------
  const canAct = phase === "hero" && heroActions > 0;
  const nextMap = multipleAttackPenalty(heroAttacks);

  function heroStrikeAt(foeId: string) {
    if (!heroC) return;
    const foe = byId(foeId)!;
    const out = makeStrike(heroC, foe, heroAttacks);
    let cs = combatants;
    const verb =
      out.result.degree === "critical-success"
        ? `Critical hit on ${foe.name} for ${out.damage}!`
        : out.result.degree === "success"
          ? `You hit ${foe.name} for ${out.damage}.`
          : out.result.degree === "critical-failure"
            ? `You badly miss ${foe.name}.`
            : `You miss ${foe.name}.`;
    pushLog(`${verb} ${rollLabel(out, "AC")}${out.map ? ` (MAP ${out.map})` : ""}`, "hero", out.result.degree);
    out.damage > 0 ? sfx.hit() : sfx.miss();
    if (out.damage > 0) cs = applyDamage(cs, foeId, out.damage);
    setCombatants(cs);
    setHeroActions((a) => a - 1);
    setHeroAttacks((n) => n + 1);
    setTargeting(null);
    if (cs.filter((c) => c.role === "foe" && !c.defeated).length === 0) {
      sfx.victory();
      setPhase("won");
    }
  }

  function heroDemoralizeAt(foeId: string) {
    if (!heroC) return;
    const foe = byId(foeId)!;
    const out = makeDemoralize(heroC, foe);
    let cs = combatants;
    if (out.frightened > 0) {
      const value = Math.max(foe.frightened, out.frightened);
      cs = patch(cs, foeId, { frightened: value });
      pushLog(`You rattle ${foe.name} — Frightened ${value}! ${rollLabel(out, "Will DC")}`, "hero", out.result.degree);
    } else {
      pushLog(`${foe.name} shrugs off your threat. ${rollLabel(out, "Will DC")}`, "hero", out.result.degree);
    }
    setCombatants(cs);
    setHeroActions((a) => a - 1);
    setTargeting(null);
  }

  function heroRaiseShield() {
    if (!heroC) return;
    setCombatants((cs) => patch(cs, heroC.id, { shieldRaised: true }));
    setHeroActions((a) => a - 1);
    pushLog("You raise your shield. Now you can Shield Block a hit.", "hero");
  }

  function onFoeClick(foeId: string) {
    if (targeting === "strike") heroStrikeAt(foeId);
    else if (targeting === "demoralize") heroDemoralizeAt(foeId);
  }

  // --- Auto turns (ally + foes) -------------------------------------------
  useEffect(() => {
    if (phase !== "auto" || !current) return;
    const key = `${round}:${ptr}`;
    if (actedKey.current === key) return;
    actedKey.current = key;

    const timer = setTimeout(() => {
      if (current.role === "ally") runAllyTurn();
      else runFoeTurn();
    }, TURN_DELAY);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, ptr, round]);

  function runAllyTurn() {
    if (!current) return;
    const target = [...aliveFoes].sort((a, b) => a.hp - b.hp)[0];
    if (!target) {
      endTurn(combatants);
      return;
    }
    let cs = combatants;
    if (!target.offGuard) {
      const trip = makeTrip(current, target);
      if (trip.proned) {
        cs = patch(cs, target.id, { offGuard: true });
        pushLog(`Bram sweeps ${target.name} off its feet — it's Off-Guard (−2 AC). “Hit it now!” ${rollLabel(trip, "Reflex DC")}`, "ally", trip.result.degree);
      } else {
        pushLog(`Bram tries to trip ${target.name} but it skips back. ${rollLabel(trip, "Reflex DC")}`, "ally", trip.result.degree);
      }
    }
    const refreshed = cs.find((c) => c.id === target.id)!;
    const strike = makeStrike(current, refreshed, 0);
    if (strike.damage > 0) {
      cs = applyDamage(cs, target.id, strike.damage);
      pushLog(`Bram strikes ${target.name} for ${strike.damage}. ${rollLabel(strike, "AC")}`, "ally", strike.result.degree);
    } else {
      pushLog(`Bram's strike at ${target.name} misses. ${rollLabel(strike, "AC")}`, "ally", strike.result.degree);
    }
    setCombatants(cs);
    setTimeout(() => endTurn(cs), TURN_DELAY);
  }

  function runFoeTurn() {
    if (!current || !heroC) return;
    const party = combatants.filter((c) => (c.role === "hero" || c.role === "ally") && !c.defeated);
    const target = party[Math.floor(Math.random() * party.length)];
    const out = makeStrike(current, target, 0);

    if (out.damage <= 0) {
      pushLog(`${current.name} lunges at ${target.name} and misses. ${rollLabel(out, "AC")}`, "enemy", out.result.degree);
      setTimeout(() => endTurn(combatants), TURN_DELAY);
      return;
    }

    // Reaction window: hero may Shield Block if the shield is up and reaction is free.
    if (target.role === "hero" && heroC.shieldRaised && heroC.reactionAvailable) {
      setPending({
        attackerName: current.name,
        damage: out.damage,
        rollText: rollLabel(out, "AC"),
      });
      setPhase("reaction");
      return;
    }

    const cs = applyDamage(combatants, target.id, out.damage);
    pushLog(`${current.name} hits ${target.name} for ${out.damage}. ${rollLabel(out, "AC")}`, "enemy", out.result.degree);
    setCombatants(cs);
    setTimeout(() => endTurn(cs), TURN_DELAY);
  }

  // --- Reaction resolution -------------------------------------------------
  function resolveReaction(block: boolean) {
    if (!pending || !heroC) return;
    const hardness = heroC.shieldHardness;
    const dmg = block ? Math.max(0, pending.damage - hardness) : pending.damage;
    let cs = combatants;
    if (block) {
      cs = patch(cs, heroC.id, { reactionAvailable: false });
      pushLog(`Shield Block! Your shield absorbs ${Math.min(pending.damage, hardness)} — you take ${dmg}. (Reaction used.)`, "system");
    } else {
      pushLog(`${pending.attackerName} hits you for ${dmg}. ${pending.rollText}`, "enemy");
    }
    cs = applyDamage(cs, heroC.id, dmg);
    setCombatants(cs);
    setPending(null);
    setTimeout(() => endTurn(cs), 400);
  }

  // --- Log auto-scroll -----------------------------------------------------
  const logEnd = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    logEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [log]);

  // --- Render --------------------------------------------------------------
  if (phase === "intro") {
    return (
      <div className="card">
        <span className="speaker">Encounter</span>
        <h2>{node.prompt}</h2>
        {node.intro.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
        <div className="actions">
          <button className="btn primary" onClick={begin}>
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
        <h2>{node.victoryTitle ?? "Victory!"}</h2>
        {node.victoryLines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
        <div className="actions">
          <button className="btn primary" onClick={() => onResolved(node.next, 20)}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <span className="speaker">Round {round}</span>

      {/* Initiative order */}
      <div className="initiative">
        {order.map((id, i) => {
          const c = byId(id)!;
          return (
            <span
              key={id}
              className={`init-chip ${c.role} ${i === ptr ? "active" : ""} ${c.defeated ? "down" : ""}`}
            >
              {c.name}
            </span>
          );
        })}
      </div>

      {/* Foes */}
      <div className="foe-grid">
        {foes.map((f) => {
          const clickable = !!targeting && !f.defeated && phase === "hero";
          return (
            <button
              key={f.id}
              className={`combatant enemy foe-card ${clickable ? "clickable" : ""} ${f.defeated ? "down" : ""}`}
              disabled={!clickable}
              onClick={() => clickable && onFoeClick(f.id)}
            >
              <div className="cb-head">
                <strong>{f.name}</strong>
                <span className="ac">AC {effectiveAc(f)}</span>
              </div>
              <Hpbar hp={f.hp} max={f.maxHp} tone="enemy" />
              <div className="badges">
                {f.frightened > 0 && <span className="cond">✕ Frightened {f.frightened}</span>}
                {f.offGuard && <span className="cond">↯ Off-Guard</span>}
                {f.defeated && <span className="cond">Defeated</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Log */}
      <div className="log" role="log" aria-live="polite">
        {log.map((e) => {
          const t = e.degree ? DEGREE_THEME[e.degree] : null;
          return (
            <div key={e.id} className={`log-entry ${e.who}`}>
              {t && <span className="deg" style={{ color: `var(${t.varName})` }}>{t.symbol}</span>}
              <span>{e.text}</span>
            </div>
          );
        })}
        <div ref={logEnd} />
      </div>

      {/* Party */}
      <div className="foe-grid">
        {combatants
          .filter((c) => c.role === "hero" || c.role === "ally")
          .map((c) => (
            <div key={c.id} className={`combatant hero ${c.defeated ? "down" : ""}`}>
              <div className="cb-head">
                <strong>{c.name}{c.role === "ally" ? " (ally)" : ""}</strong>
                <span className="ac">AC {effectiveAc(c)}</span>
              </div>
              <Hpbar hp={c.hp} max={c.maxHp} tone="hero" />
              <div className="badges">
                {c.shieldRaised && <span className="cond shield">🛡 Shield up</span>}
                {c.role === "hero" && c.reactionAvailable && <span className="cond shield">⚡ Reaction ready</span>}
                {c.defeated && <span className="cond">Down</span>}
              </div>
            </div>
          ))}
      </div>

      {/* Reaction prompt */}
      {phase === "reaction" && pending && (
        <div className="feedback bad" style={{ borderColor: "var(--success)" }}>
          <p style={{ margin: "0 0 10px" }}>
            <b>{pending.attackerName}</b> lands a blow for <b>{pending.damage}</b> — your shield is up!
            Spend your reaction to Shield Block?
          </p>
          <div className="actions combat-actions">
            <button className="btn" onClick={() => resolveReaction(true)}>
              🛡 Shield Block <span className="hint">reduce by {heroC?.shieldHardness}</span>
            </button>
            <button className="btn" onClick={() => resolveReaction(false)}>
              Take the hit <span className="hint">save your reaction</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero controls */}
      {phase === "hero" && (
        <>
          <div className="pips" aria-label={`${heroActions} of 3 actions remaining`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`pip ${i < heroActions ? "" : "spent"}`}>◆</span>
            ))}
            <span className="pips-label">{heroActions} / 3 actions</span>
          </div>

          {targeting && (
            <p className="muted" style={{ textAlign: "center" }}>
              Choose a foe to {targeting === "strike" ? "Strike" : "Demoralize"} — or pick another action.
            </p>
          )}

          <div className="actions combat-actions">
            <button
              className={`btn ${targeting === "strike" ? "correct" : ""}`}
              onClick={() => setTargeting(targeting === "strike" ? null : "strike")}
              disabled={!canAct}
            >
              Strike <span className="hint">+{(heroC?.attackBonus ?? 0) + nextMap}{nextMap ? ` · MAP ${nextMap}` : " · no penalty"}</span>
            </button>
            <button
              className={`btn ${targeting === "demoralize" ? "correct" : ""}`}
              onClick={() => setTargeting(targeting === "demoralize" ? null : "demoralize")}
              disabled={!canAct}
            >
              Demoralize <span className="hint">+{heroC?.intimidationBonus} vs Will · no attack penalty</span>
            </button>
            <button className="btn" onClick={heroRaiseShield} disabled={!canAct || heroC?.shieldRaised}>
              Raise a Shield <span className="hint">enables Shield Block</span>
            </button>
            <button className="btn primary" onClick={() => { setTargeting(null); endTurn(combatants); }}>
              {heroActions > 0 ? "End turn (skip remaining)" : "End turn"}
            </button>
          </div>
        </>
      )}

      {phase === "auto" && (
        <p className="muted" style={{ textAlign: "center", marginTop: 14 }}>
          {current?.name}&apos;s turn…
        </p>
      )}
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
