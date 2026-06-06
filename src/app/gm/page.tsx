"use client";

import { useState } from "react";
import { decodeSeal, suggestCurseBlessing, type Dossier } from "@/game/seal";

const cap = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

export default function GmPage() {
  const [input, setInput] = useState("");
  const [d, setD] = useState<Dossier | null>(null);
  const [err, setErr] = useState(false);

  function decode() {
    const r = decodeSeal(input);
    setD(r);
    setErr(!r);
  }

  const cb = d ? suggestCurseBlessing(d) : null;

  return (
    <main className="shell">
      <div className="card">
        <span className="speaker">GM Tools</span>
        <h2>Decode a sealed origin</h2>
        <p className="prose">
          Paste a player&apos;s Origin Seal (the <code>PFTS1.…</code> code, or the whole file
          they downloaded). You&apos;ll see exactly what they did during their backstory — and a
          suggested curse &amp; blessing to carry into your campaign.
        </p>
        <textarea
          className="text-input"
          rows={5}
          style={{ fontFamily: "monospace", fontSize: 14, resize: "vertical" }}
          placeholder="PFTS1.…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="actions">
          <button className="btn primary" onClick={decode} disabled={!input.trim()}>
            Decode the seal
          </button>
        </div>

        {err && (
          <p className="feedback bad">
            That doesn&apos;t look like a valid seal. Make sure you pasted the whole code (it
            starts with <code>PFTS1.</code>).
          </p>
        )}

        {d && (
          <>
            <h3 className="section-h">{d.name} — level {d.level}</h3>
            <div className="stat-row">
              {d.ancestry && <Chip k="Ancestry" v={d.ancestry} />}
              {d.heritage && <Chip k="Heritage" v={d.heritage} />}
              {d.class && <Chip k="Class" v={d.class} />}
              {d.background && <Chip k="Background" v={d.background} />}
              <Chip k="Crowns" v={`${d.mastery}/5`} />
            </div>

            <h3 className="section-h">What they did</h3>
            <ul className="points">
              <li><b>Temperament:</b> {cap(d.temperament)}</li>
              <li><b>The chasm:</b> crossed {d.crossedChasm}</li>
              <li><b>The capstone:</b> {cap(d.capstone)}</li>
              <li><b>At the nest:</b> {cap(d.morality)}{d.corrupted ? " — bound the shard into their flesh" : d.darkPath ? " — burned it all" : ""}</li>
              {(d.darkPath || d.corrupted) && (
                <li style={{ borderLeftColor: "var(--crit-failure)" }}>
                  <b>⚠ Dark path:</b> {d.corrupted ? "Corrupted by planar power." : "Took the ruthless road."}
                </li>
              )}
            </ul>

            {cb && (
              <>
                <h3 className="section-h">Suggested for your table</h3>
                <div className="boon blessing">
                  <div className="boon-name">✦ Blessing — {cb.blessing.name}</div>
                  <p>{cb.blessing.effect}</p>
                </div>
                <div className="boon curse">
                  <div className="boon-name">☠ Curse — {cb.curse.name}</div>
                  <p>{cb.curse.effect}</p>
                </div>
                <p className="muted" style={{ marginTop: 10 }}>{cb.note}</p>
                <p className="muted">These are starting points — reskin or rebalance freely for your campaign.</p>
              </>
            )}

            <p className="muted" style={{ marginTop: 14 }}>Sealed {new Date(d.sealedAt).toLocaleString()}</p>
          </>
        )}
      </div>
    </main>
  );
}

function Chip({ k, v }: { k: string; v: string }) {
  return (
    <div className="stat">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}
