"use client";

import { useState } from "react";
import type { HandoffNode } from "@/content/types";
import type { BuildState } from "@/game/builder";
import { downloadAppJson, downloadPathbuilderJson, downloadPdf } from "@/game/export";

export function HandoffScene({
  node,
  character,
  onResolved,
}: {
  node: HandoffNode;
  character: BuildState | null;
  onResolved: (next: string, bonusXp?: number) => void;
}) {
  const [checked, setChecked] = useState<boolean[]>(node.checklist.map(() => false));
  const done = checked.filter(Boolean).length;

  const toggle = (i: number) =>
    setChecked((c) => c.map((v, k) => (k === i ? !v : v)));

  return (
    <div className="card">
      <span className="speaker">The hand-off</span>
      <h2>{node.prompt}</h2>
      {node.intro.map((l, i) => (
        <p key={i}>{l}</p>
      ))}

      {/* Exports */}
      <h3 className="section-h">Take your character with you</h3>
      {character ? (
        <div className="actions combat-actions">
          <button className="btn" onClick={() => downloadPdf(character)}>
            ⬇ PDF sheet <span className="hint">printable, bring-to-table</span>
          </button>
          <button className="btn" onClick={() => downloadAppJson(character)}>
            ⬇ JSON <span className="hint">this app&apos;s format</span>
          </button>
          <button className="btn" onClick={() => downloadPathbuilderJson(character)}>
            ⬇ Pathbuilder JSON <span className="hint">experimental · for VTT import</span>
          </button>
        </div>
      ) : (
        <p className="muted">Build a character in the previous step to export a sheet here.</p>
      )}
      <p className="muted" style={{ marginTop: 8 }}>
        The PDF is a clean one-page sheet you can print or save. The Pathbuilder-format JSON
        targets the community interchange that many VTT importers (e.g. Foundry via Pathmuncher)
        read — it&apos;s experimental, so double-check the import.
      </p>

      {/* Readiness checklist */}
      <h3 className="section-h">Table-readiness checklist <span className="muted">({done}/{node.checklist.length})</span></h3>
      <ul className="checklist">
        {node.checklist.map((item, i) => (
          <li key={i} className={checked[i] ? "on" : ""}>
            <button onClick={() => toggle(i)} aria-pressed={checked[i]}>
              <span className="box">{checked[i] ? "✓" : ""}</span>
              <span>{item}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Resources */}
      <h3 className="section-h">Where to find your first game</h3>
      <ul className="points">
        {node.resources.map((r, i) => (
          <li key={i}>
            <b>{r.label}.</b> {r.detail}
          </li>
        ))}
      </ul>

      <div className="actions">
        <button className="btn primary" onClick={() => onResolved(node.next, 0)}>
          I&apos;m ready — graduate
        </button>
      </div>
    </div>
  );
}
