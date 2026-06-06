"use client";

import { useState } from "react";
import { ATTRS, ATTR_NAME } from "@/engine/character";
import type { Attr } from "@/engine/types";
import {
  ANCESTRIES,
  ANCESTRY_FEATS,
  BACKGROUNDS,
  CLASS_GLYPH,
  CLASSES,
  HERITAGES,
  LANGUAGE_POOL,
  SKILLS,
} from "@/content/srd";
import {
  ancestryFeats,
  buildAttrs,
  derived,
  emptyBuild,
  PRONOUN_LABELS,
  grantedLanguages,
  isComplete,
  languageBudget,
  quickBuild,
  resolve,
  skillBudget,
  spellcasting,
  startingGear,
  trainedSkills,
  type BuildState,
} from "@/game/builder";
import { downloadAppJson, downloadPathbuilderJson, downloadPdf } from "@/game/export";
import type { BuilderNode } from "@/content/types";

type Step =
  | "name" | "ancestry" | "heritage" | "background" | "class"
  | "boosts" | "skills" | "languages" | "spells" | "feats" | "review";

const STEPS: Step[] = [
  "name", "ancestry", "heritage", "background", "class",
  "boosts", "skills", "languages", "spells", "feats", "review",
];
const STEP_TITLE: Record<Step, string> = {
  name: "Name your hero",
  ancestry: "Choose an ancestry",
  heritage: "Choose a heritage",
  background: "Choose a background",
  class: "Choose a class",
  boosts: "Assign your four free boosts",
  skills: "Train your skills",
  languages: "Languages",
  spells: "Learn your spells",
  feats: "Pick your feats",
  review: "Your character",
};

const mod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function BuilderScene({
  node,
  onResolved,
  onBuilt,
}: {
  node: BuilderNode;
  onResolved: (next: string, bonusXp?: number) => void;
  onBuilt?: (build: BuildState) => void;
}) {
  const [build, setBuild] = useState<BuildState>(emptyBuild());
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const set = (patch: Partial<BuildState>) => setBuild((b) => ({ ...b, ...patch }));

  const { ancestry, background, cls } = resolve(build);
  const budget = skillBudget(build);
  const langBudget = languageBudget(build);
  const sc = spellcasting(build);

  function toggleIn(key: "skills" | "languages" | "cantrips" | "spells", value: string, max: number, lock?: (v: string) => boolean) {
    if (lock?.(value)) return;
    const cur = build[key];
    if (cur.includes(value)) set({ [key]: cur.filter((x) => x !== value) } as Partial<BuildState>);
    else if (cur.length < max) set({ [key]: [...cur, value] } as Partial<BuildState>);
  }

  function toggleBoost(a: Attr) {
    const has = build.freeBoosts.includes(a);
    if (has) set({ freeBoosts: build.freeBoosts.filter((x) => x !== a) });
    else if (build.freeBoosts.length < 4) set({ freeBoosts: [...build.freeBoosts, a] });
  }

  function stepValid(s: Step): boolean {
    switch (s) {
      case "name": return build.name.trim().length > 0;
      case "ancestry": return !!build.ancestryId;
      case "heritage": return !!build.heritageId;
      case "background": return !!build.backgroundId;
      case "class": return !!build.classId;
      case "boosts": return build.freeBoosts.length === 4;
      case "skills": return build.skills.length === budget;
      case "languages": return build.languages.length === langBudget;
      case "spells": return !sc || (build.cantrips.length === sc.cantripsKnown && build.spells.length === sc.spellsKnown);
      case "feats": return !!build.featId && !!build.ancestryFeatId;
      case "review": return isComplete(build);
    }
  }

  function missingHint(s: Step): string | null {
    if (stepValid(s)) return null;
    switch (s) {
      case "name": return "Enter a name to continue.";
      case "boosts": return `Pick ${4 - build.freeBoosts.length} more attribute${4 - build.freeBoosts.length === 1 ? "" : "s"}.`;
      case "skills": return `Choose ${budget - build.skills.length} more skill${budget - build.skills.length === 1 ? "" : "s"}.`;
      case "languages": return `Choose ${langBudget - build.languages.length} more language${langBudget - build.languages.length === 1 ? "" : "s"}.`;
      case "spells":
        if (!sc) return null;
        return `Pick ${sc.cantripsKnown - build.cantrips.length} cantrip(s) and ${sc.spellsKnown - build.spells.length} spell(s).`;
      case "feats": return !build.featId ? "Choose a class feat." : "Choose an ancestry feat.";
      default: return "Make a selection to continue.";
    }
  }

  function doQuickBuild() {
    setBuild(quickBuild(build.name));
    setI(STEPS.indexOf("review"));
  }

  return (
    <div className="card">
      <div className="builder-head">
        <span className="speaker">Character Creation · Step {i + 1} of {STEPS.length}</span>
        <button className="mute-btn quickbuild" title="Build a random valid hero" onClick={doQuickBuild}>
          ✨ Surprise me
        </button>
      </div>
      <h2>{STEP_TITLE[step]}</h2>

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
          <p className="muted" style={{ margin: "14px 0 6px" }}>How should Tahar refer to you?</p>
          <div className="seg">
            {PRONOUN_LABELS.map((p) => (
              <button
                key={p.id}
                className={`seg-btn ${build.pronouns === p.id ? "on" : ""}`}
                onClick={() => set({ pronouns: p.id })}
              >
                {p.label}
              </button>
            ))}
          </div>
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
          onPick={(id) => set({ ancestryId: id, heritageId: undefined, ancestryFeatId: undefined, languages: [] })}
        />
      )}

      {step === "heritage" && ancestry && (
        <OptionList
          options={(HERITAGES[ancestry.id] ?? []).map((h) => ({ id: h.id, title: h.name, desc: h.blurb }))}
          selected={build.heritageId}
          onPick={(id) => set({ heritageId: id })}
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
            title: `${CLASS_GLYPH[c.id] ?? ""} ${c.name}`,
            desc: `${c.blurb} · key ${ATTR_NAME[c.keyAttr]} · ${c.hp} HP/level`,
          }))}
          selected={build.classId}
          onPick={(id) => set({ classId: id, featId: undefined, skills: [], cantrips: [], spells: [] })}
        />
      )}

      {step === "boosts" && (
        <>
          <p>Each boost raises an attribute by +1, to four <b>different</b> attributes. A stat can collect boosts across steps to reach its +4 cap.</p>
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
          <p>Pick <b>{budget}</b> skills to be Trained in (class choices + your Intelligence).{background && <> Your background already trains <b>{cap(background.skill)}</b>.</>}</p>
          <div className="skill-grid">
            {SKILLS.map((s) => {
              const fromBg = background?.skill === s.key;
              const on = fromBg || build.skills.includes(s.key);
              const full = !on && build.skills.length >= budget;
              return (
                <button key={s.key} className={`btn ${on ? "correct" : ""}`} disabled={fromBg || full} onClick={() => toggleIn("skills", s.key, budget)}>
                  {s.name} <span className="hint">{ATTR_NAME[s.attr].slice(0, 3)}{fromBg ? " · background" : ""}</span>
                </button>
              );
            })}
          </div>
          <p className="muted">{build.skills.length} / {budget} chosen</p>
        </>
      )}

      {step === "languages" && (
        <>
          <p>You speak {grantedLanguages(build).map((l) => <b key={l}>{l} </b>)} from your ancestry.</p>
          {langBudget === 0 ? (
            <p className="muted">Your Intelligence grants no bonus languages — onward.</p>
          ) : (
            <>
              <p>Your Intelligence lets you learn <b>{langBudget}</b> more:</p>
              <div className="skill-grid">
                {LANGUAGE_POOL.filter((l) => !grantedLanguages(build).includes(l)).map((l) => {
                  const on = build.languages.includes(l);
                  const full = !on && build.languages.length >= langBudget;
                  return (
                    <button key={l} className={`btn ${on ? "correct" : ""}`} disabled={full} onClick={() => toggleIn("languages", l, langBudget)}>
                      {l}
                    </button>
                  );
                })}
              </div>
              <p className="muted">{build.languages.length} / {langBudget} chosen</p>
            </>
          )}
        </>
      )}

      {step === "spells" && (
        sc ? (
          <>
            <p>As {cls?.name === "Cleric" ? "a divine" : "an arcane"} caster, choose your starting magic.</p>
            <h3 className="section-h">Cantrips ({build.cantrips.length}/{sc.cantripsKnown}) — at-will</h3>
            <div className="actions">
              {sc.cantrips.map((s) => {
                const on = build.cantrips.includes(s.id);
                const full = !on && build.cantrips.length >= sc.cantripsKnown;
                return (
                  <button key={s.id} className={`btn ${on ? "correct" : ""}`} disabled={full} onClick={() => toggleIn("cantrips", s.id, sc.cantripsKnown)}>
                    {s.name}<span className="hint">{s.desc}</span>
                  </button>
                );
              })}
            </div>
            <h3 className="section-h">1st-rank spells ({build.spells.length}/{sc.spellsKnown})</h3>
            <div className="actions">
              {sc.spells.map((s) => {
                const on = build.spells.includes(s.id);
                const full = !on && build.spells.length >= sc.spellsKnown;
                return (
                  <button key={s.id} className={`btn ${on ? "correct" : ""}`} disabled={full} onClick={() => toggleIn("spells", s.id, sc.spellsKnown)}>
                    {s.name}<span className="hint">{s.desc}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p className="muted">Your class doesn&apos;t cast spells — your power is steel and skill. Onward.</p>
        )
      )}

      {step === "feats" && cls && (
        <>
          <h3 className="section-h">Class feat</h3>
          <OptionList
            options={cls.feats.map((f) => ({ id: f.id, title: f.name, desc: f.desc }))}
            selected={build.featId}
            onPick={(id) => set({ featId: id })}
          />
          <h3 className="section-h">Ancestry feat</h3>
          <OptionList
            options={ancestryFeats(build).map((f) => ({ id: f.id, title: f.name, desc: f.desc }))}
            selected={build.ancestryFeatId}
            onPick={(id) => set({ ancestryFeatId: id })}
          />
        </>
      )}

      {step === "review" && <Sheet build={build} full />}
      {step !== "review" && (ancestry || cls) && <Sheet build={build} />}

      {step === "review" && (
        <div className="actions combat-actions" style={{ marginTop: 18 }}>
          <button className="btn" onClick={() => downloadPdf(build)} disabled={!isComplete(build)}>
            ⬇ PDF sheet <span className="hint">printable, bring-to-table</span>
          </button>
          <button className="btn" onClick={() => downloadAppJson(build)} disabled={!isComplete(build)}>
            ⬇ JSON <span className="hint">this app&apos;s format</span>
          </button>
          <button className="btn" onClick={() => downloadPathbuilderJson(build)} disabled={!isComplete(build)}>
            ⬇ Pathbuilder JSON <span className="hint">experimental · for VTT import</span>
          </button>
        </div>
      )}

      {step !== "review" && missingHint(step) && <p className="muted" style={{ marginTop: 14 }}>{missingHint(step)}</p>}

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
          <button
            className="btn primary"
            onClick={() => {
              onBuilt?.(build);
              onResolved(node.next, 20);
            }}
            disabled={!isComplete(build)}
          >
            Finish — this hero is yours
          </button>
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
  const { ancestry, heritage, background, cls } = resolve(build);
  const sc = spellcasting(build);
  const glyph = (cls && CLASS_GLYPH[cls.id]) || "🧝";

  return (
    <div className="sheet">
      <div className="sheet-head">
        <div className="sheet-id">
          <span className="portrait" aria-hidden>{glyph}</span>
          <div>
            <strong>{build.name.trim() || "New Hero"}</strong>
            <div className="muted">
              {[heritage?.name, ancestry?.name, cls?.name].filter(Boolean).join(" ") || "Level 1"}
              {background ? ` · ${background.name}` : ""}
            </div>
          </div>
        </div>
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
          <div><span className="muted">Trained skills: </span>{trainedSkills(build).map(cap).join(", ") || "—"}</div>
          <div><span className="muted">Languages: </span>{[...grantedLanguages(build), ...build.languages].join(", ")}</div>
          {sc && (
            <div>
              <span className="muted">Spells: </span>
              {[...build.cantrips, ...build.spells]
                .map((id) => sc.cantrips.concat(sc.spells).find((s) => s.id === id)?.name ?? id)
                .join(", ") || "—"}
            </div>
          )}
          {cls && build.featId && (
            <div><span className="muted">Class feat: </span>{cls.feats.find((f) => f.id === build.featId)?.name}</div>
          )}
          {build.ancestryFeatId && (
            <div>
              <span className="muted">Ancestry feat: </span>
              {ancestryFeats(build).find((f) => f.id === build.ancestryFeatId)?.name}
            </div>
          )}
          <div><span className="muted">Gear: </span>{startingGear(build).join(", ")}</div>
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
