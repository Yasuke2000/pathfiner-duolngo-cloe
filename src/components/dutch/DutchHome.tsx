"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LessonScene } from "./LessonScene";
import type { PoolItem } from "@/dutch/lesson";
import { loadProgress, resetProgress, type DutchSave } from "@/dutch/progress";
import { isDue, isMastered, strength } from "@/dutch/srs";
import { termId } from "@/dutch/types";
import { ALL_TERMS, TOTAL_TERMS, UNITS } from "@/dutch/vocab";
import { canSpeak, onVoicesReady, speakDutch } from "@/lib/speech";

type View = { kind: "home" } | { kind: "lesson"; title: string; pool: PoolItem[] };

export function DutchHome() {
  const [save, setSave] = useState<DutchSave | null>(null);
  const [view, setView] = useState<View>({ kind: "home" });
  const [open, setOpen] = useState<string | null>(null);
  const [audio, setAudio] = useState(false);

  const refresh = useCallback(() => setSave(loadProgress()), []);
  useEffect(refresh, [refresh]);
  useEffect(() => {
    setAudio(canSpeak());
    return onVoicesReady(() => setAudio(canSpeak()));
  }, []);

  if (view.kind === "lesson") {
    return (
      <LessonScene
        title={view.title}
        pool={view.pool}
        onExit={() => {
          refresh();
          setView({ kind: "home" });
        }}
      />
    );
  }

  const progress = save?.terms ?? {};
  const now = Date.now();
  const allIds = ALL_TERMS.map((t) => termId(t.unitId, t.term.nl));
  const known = allIds.filter((id) => isMastered(progress[id])).length;
  const due = ALL_TERMS.filter((t) => {
    const st = progress[termId(t.unitId, t.term.nl)];
    return st && isDue(st, now);
  });

  return (
    <div className="d-home">
      <div className="d-hero">
        <Link className="text-btn" href="/">
          ← Menu
        </Link>
        <h1 className="title-logo d-title">Code &amp; Koffie</h1>
        <p className="title-sub">Nederlands voor informatici — Dutch &amp; tech English, both ways</p>
        <p className="title-pitch">
          Built for someone studying computer science in Flanders: the words you actually hear in
          het labo, op kot and aan de kassa. Belgian Dutch, not textbook Dutch — with notes
          wherever Flanders and the Netherlands disagree.
        </p>

        <div className="d-stats">
          <div className="d-stat">
            <b>{known}</b>
            <span>woorden gekend</span>
          </div>
          <div className="d-stat">
            <b>{TOTAL_TERMS}</b>
            <span>woorden totaal</span>
          </div>
          <div className="d-stat">
            <b>{save?.xp ?? 0}</b>
            <span>XP</span>
          </div>
          <div className="d-stat">
            <b>{save?.lessons ?? 0}</b>
            <span>lessen</span>
          </div>
        </div>

        {due.length > 0 && (
          <button
            className="btn primary big"
            onClick={() =>
              setView({ kind: "lesson", title: "Herhaling", pool: due })
            }
          >
            🔁 Herhalen — {due.length} {due.length === 1 ? "woord" : "woorden"} klaar
          </button>
        )}
      </div>

      <div className="d-units">
        {UNITS.map((u) => {
          const pool: PoolItem[] = u.terms.map((term) => ({ unitId: u.id, term }));
          const ids = u.terms.map((t) => termId(u.id, t.nl));
          const pct = Math.round(strength(ids, progress) * 100);
          const isOpen = open === u.id;
          return (
            <div className="d-unit" key={u.id} style={{ ["--tone" as string]: u.accent } as React.CSSProperties}>
              <div className="d-unit-head">
                <div>
                  <h3>{u.title}</h3>
                  <span className="muted">{u.subtitle}</span>
                </div>
                <span className="d-pct">{pct}%</span>
              </div>
              <p className="d-blurb">{u.blurb}</p>
              <div className="d-bar">
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className="d-unit-actions">
                <button
                  className="btn primary"
                  onClick={() => setView({ kind: "lesson", title: u.title, pool })}
                >
                  Oefenen
                </button>
                <button className="btn" onClick={() => setOpen(isOpen ? null : u.id)}>
                  {isOpen ? "Verberg woordenlijst" : `Woordenlijst (${u.terms.length})`}
                </button>
              </div>

              {isOpen && (
                <ul className="d-list">
                  {u.terms.map((t) => (
                    <li key={t.nl}>
                      <div className="d-row">
                        <b className="d-nl">
                          {t.nl}
                          {audio && (
                            <button
                              className="d-speak tiny"
                              onClick={() => speakDutch(t.nl)}
                              aria-label={`Spreek "${t.nl}" uit`}
                            >
                              🔊
                            </button>
                          )}
                        </b>
                        <span className="d-en">{t.en}</span>
                      </div>
                      {t.note && <p className="d-note">💡 {t.note}</p>}
                      {t.example && (
                        <p className="d-example">
                          <i>{t.example.nl}</i> — {t.example.en}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <p className="muted d-foot">
        Voortgang wordt lokaal in je browser bewaard — geen account nodig.{" "}
        <button
          className="text-btn"
          onClick={() => {
            if (confirm("Alle voortgang wissen?")) {
              resetProgress();
              refresh();
            }
          }}
        >
          Voortgang wissen
        </button>
      </p>
    </div>
  );
}
