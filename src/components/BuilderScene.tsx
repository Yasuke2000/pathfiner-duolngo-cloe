"use client";

import { useState } from "react";
import { ATTRS, ATTR_NAME } from "@/engine/character";
import type { Attr } from "@/engine/types";
import { ANCESTRIES, BACKGROUNDS, CLASSES, SKILLS } from "@/content/srd";
import {
  buildAttrs,
  derived,
  emptyBuild,
  exportCharacter,
  isComplete,
  resolve,
  skillBudget,
  trainedSkills,
  type BuildState,
} from "@/game/builder";
import type { BuilderNode } from "@/content/types";

type Step = "name" | "ancestry" | "background" | "class" | "boosts" | "skills" | "feat" | "review";
const STEPS: Step[] = ["name", "ancestry", "background", "class", "boosts", "skills", "feat", "review"];
const STEP_TITLE: Record<Step, string> = {
  name: "Name your hero",
  ancestry: "Choose an ancestry",
  background: "Choose a background",
  class: "Choose a class",
  boosts: "Assign your four free boosts",
  skills: "Train your skills",
  feat: "Pick a signature feat",
  review: "Your character",
};

const mod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export function BuilderScene({
  node,
  onResolved,
}: {
  node: BuilderNode;
  onResolved: (next: string, bonusXp?: number) => void;
}) {
  const [build, setBuild] = useState<BuildState>(emptyBuild());
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const set = (patch: Partial<BuildState>) => setBuild((b) => ({ ...b, ...patch }));

  const { ancestry, background, cls } = resolve(build);
  const budget = skillBudget(build);

  function stepValid(s: Step): boolean {
    switch (s) {
      case "name": return build.name.trim().length > 0;
      case "ancestry": return !!build.ancestryId;
      case "background": return !!build.backgroundId;
      case "class": return !!build.classId;
      case "boosts": return build.freeBoosts.length === 4;
      case "skills": return build.skills.length === budget;
      case "feat": return !!build.featId;
      case "review": return isComplete(build);
    }
  }

  function toggleBoost(a: Attr) {
    const has = build.freeBoosts.includes(a);
    if (has) set({ freeBoosts: build.freeBoosts.filter((x) => x !== a) });
    else if (build.freeBoosts.length < 4) set({ freeBoosts: [...build.freeBoosts, a] });
  }

  function toggleSkill(key: string) {
    if (background?.skill === key) return; // background skill is locked on
    const has = build.skills.includes(key);
    if (has) set({ skills: build.skills.filter((x) => x !== key) });
    else if (build.skills.length < budget) set({ skills: [...build.skills, key] });
  }

  function download() {
    const data = exportCharacter(build);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(build.name.trim() || "character").replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card">
      <span className="speaker">Character Creation · Step {i + 1} of {STEPS.length}</span>
      <h2>{STEP_TITLE[step]}</h2>

      {/* ---- Step body ---- */}
      {step === "name" && (
        <>
          {node.intro.map((l, k) => <p key={k}>{l}</p>)}
          <input
            className="text-input"
            placeholder="e.g. Dain, Sera, Pib…"
            value={build.name}
            onChange={(e) => set({ name: e.target.value })}
            maxLength={28}
          />
        </>
      )}

      {step === "ancestry" && (
        <OptionList
          options={ANCESTRIES.map((a) => ({
            id: a.id,
            title: a.name,
            desc: `${a.blurb} · ${a.hp} HP, ${a.speed} ft · ${a.boosts.map((x) => ATTR_NAME[x]).join(", ")}${a.flaw ? `, −${ATTR_NAME[a.flaw]}` : ""}`,
          }))}
          selected={build.ancestryId}
          onPick={(id) => set({ ancestryId: id })}
        />
      )}

      {step === "background" && (
        <OptionList
          options={BACKGROUNDS.map((bg) => ({
            id: bg.id,
            title: bg.name,
            desc: `${bg.blurb} · ${bg.boosts.map((x) => ATTR_NAME[x]).join(", ")} · trains ${cap(bg.skill)}`,
          }))}
          selected={build.backgroundId}
          onPick={(id) => set({ backgroundId: id })}
        />
      )}

      {step === "class" && (
        <OptionList
          options={CLASSES.map((c) => ({
            id: c.id,
            title: c.name,
            desc: `${c.blurb} · key ${ATTR_NAME[c.keyAttr]} · ${c.hp} HP/level`,
          }))}
          selected={build.classId}
          onPick={(id) => set({ classId: id, featId: undefined, skills: [] })}
        />
      )}

      {step === "boosts" && (
        <>
          <p>Each boost raises an attribute by +1. They all go to <b>different</b> attributes — so pick four. (You can stack more onto a stat across earlier steps, which is how a key attribute reaches +4.)</p>
          <div className="boost-grid">
            {ATTRS.map((a) => {
              const on = build.freeBoosts.includes(a);
              const full = build.freeBoosts.length >= 4 && !on;
              return (
                <button key={a} className={`btn ${on ? "correct" : ""}`} disabled={full} onClick={() => toggleBoost(a)}>
                  {ATTR_NAME[a]}
                  <span className="hint">now {mod(buildAttrs(build)[a])}</span>
                </button>
              );
            })}
          </div>
          <p className="muted">{build.freeBoosts.length} / 4 selected</p>
        </>
      )}

      {step === "skills" && (
        <>
          <p>Pick <b>{budget}</b> skills to be Trained in (class choices + your Intelligence). {background && <>Your background already trains <b>{cap(background.skill)}</b>.</>}</p>
          <div className="skill-grid">
            {SKILLS.map((s) => {
              const fromBg = background?.skill === s.key;
              const on = fromBg || build.skills.includes(s.key);
              const full = !on && build.skills.length >= budget;
              return (
                <button key={s.key} className={`btn ${on ? "correct" : ""}`} disabled={fromBg || full} onClick={() => toggleSkill(s.key)}>
                  {s.name} <span className="hint">{ATTR_NAME[s.attr].slice(0, 3)}{fromBg ? " · background" : ""}</span>
                </button>
              );
            })}
          </div>
          <p className="muted">{build.skills.length} / {budget} chosen</p>
        </>
      )}

      {step === "feat" && cls && (
        <OptionList
          options={cls.feats.map((f) => ({ id: f.id, title: f.name, desc: f.desc }))}
          selected={build.featId}
          onPick={(id) => set({ featId: id })}
        />
      )}

      {step === "review" && <Sheet build={build} full />}

      {/* ---- Live sheet (except on review, which shows the full one) ---- */}
      {step !== "review" && (ancestry || cls) && <Sheet build={build} />}

      {/* ---- Nav ---- */}
      <div className="actions combat-actions">
        {i > 0 && (
          <button className="btn" onClick={() => setI(i - 1)}>
            ← Back
          </button>
        )}
        {step !== "review" ? (
          <button className="btn primary" onClick={() => setI(i + 1)} disabled={!stepValid(step)}>
            Next →
          </button>
        ) : (
          <>
            <button className="btn" onClick={download} disabled={!isComplete(build)}>
              ⬇ Download character (.json)
            </button>
            <button className="btn primary" onClick={() => onResolved(node.next, 20)} disabled={!isComplete(build)}>
              Finish — this hero is yours
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function OptionList({
  options,
  selected,
  onPick,
}: {
  options: { id: string; title: string; desc: string }[];
  selected?: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="actions">
      {options.map((o) => (
        <button key={o.id} className={`btn ${selected === o.id ? "correct" : ""}`} onClick={() => onPick(o.id)}>
          {o.title}
          <span className="hint">{o.desc}</span>
        </button>
      ))}
    </div>
  );
}

function Sheet({ build, full = false }: { build: BuildState; full?: boolean }) {
  const attrs = buildAttrs(build);
  const stats = derived(build);
  const { ancestry, background, cls } = resolve(build);

  return (
    <div className="sheet">
      <div className="sheet-head">
        <strong>{build.name.trim() || "New Hero"}</strong>
        <span className="muted">
          {[ancestry?.name, cls?.name].filter(Boolean).join(" ") || "Level 1"}
          {background ? ` · ${background.name}` : ""}
        </span>
      </div>

      <div className="attr-row">
        {ATTRS.map((a) => (
          <div key={a} className="attr">
            <span className="k">{a.toUpperCase()}</span>
            <span className="v">{mod(attrs[a])}</span>
          </div>
        ))}
      </div>

      {stats && (
        <div className="stat-row">
          <Stat k="HP" v={stats.hp} />
          <Stat k="AC" v={stats.ac} />
          <Stat k="Fort" v={mod(stats.fort)} />
          <Stat k="Ref" v={mod(stats.ref)} />
          <Stat k="Will" v={mod(stats.will)} />
          <Stat k="Perc" v={mod(stats.perception)} />
          <Stat k="Attack" v={mod(stats.attack)} />
          <Stat k="Class DC" v={stats.classDc} />
          {stats.spellDc !== undefined && <Stat k="Spell DC" v={stats.spellDc} />}
          <Stat k="Speed" v={`${stats.speed}ft`} />
        </div>
      )}

      {full && (
        <div className="sheet-skills">
          <div className="muted" style={{ marginBottom: 4 }}>Trained skills</div>
          {trainedSkills(build).map((k) => cap(k)).join(", ") || "—"}
          {cls && build.featId && (
            <div style={{ marginTop: 8 }}>
              <span className="muted">Feat: </span>
              {cls.feats.find((f) => f.id === build.featId)?.name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const Stat = ({ k, v }: { k: string; v: number | string }) => (
  <div className="stat">
    <span className="k">{k}</span>
    <span className="v">{v}</span>
  </div>
);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
