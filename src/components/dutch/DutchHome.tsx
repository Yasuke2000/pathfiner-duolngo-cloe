"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LessonScene } from "./LessonScene";
import type { PoolItem } from "@/dutch/lesson";
import { loadProgress, resetProgress, type DutchSave } from "@/dutch/progress";
import { isDue, isMastered, strength } from "@/dutch/srs";
import { termId, type Unit } from "@/dutch/types";
import type { ProgressMap } from "@/dutch/srs";
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

  const start = (title: string, pool: PoolItem[]) => setView({ kind: "lesson", title, pool });
  const life = UNITS.filter((u) => u.track === "life");
  const cs = UNITS.filter((u) => u.track === "cs");
  const csPool: PoolItem[] = cs.flatMap((u) => u.terms.map((term) => ({ unitId: u.id, term })));

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
          het labo, op kot and aan de kassa — plus the whole technical vocabulary of the degree,
          from de compiler to NP-volledig, each with what it means and a sentence you&apos;ll hear.
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

        <div className="d-hero-actions">
          {due.length > 0 && (
            <button className="btn primary big" onClick={() => start("Herhaling", due)}>
              🔁 Herhalen — {due.length} {due.length === 1 ? "woord" : "woorden"} klaar
            </button>
          )}
          <button className="btn big" onClick={() => start("Informatica — alles door elkaar", csPool)}>
            💻 Informatica door elkaar
          </button>
        </div>
      </div>

      <h2 className="d-track-h">Dagelijks leven &amp; de unief</h2>
      <p className="d-track-sub">Surviving the day, the classroom and the paperwork.</p>
      <div className="d-units">
        {life.map((u) => (
          <UnitCard
            key={u.id}
            unit={u}
            progress={progress}
            audio={audio}
            open={open === u.id}
            onToggle={() => setOpen(open === u.id ? null : u.id)}
            onStart={start}
          />
        ))}
      </div>

      <h2 className="d-track-h">Informatica</h2>
      <p className="d-track-sub">
        The degree itself — coding, compilers, algorithms, data structures, operating systems,
        networks, software engineering, theory and the language of lectures.
      </p>
      <div className="d-units">
        {cs.map((u) => (
          <UnitCard
            key={u.id}
            unit={u}
            progress={progress}
            audio={audio}
            open={open === u.id}
            onToggle={() => setOpen(open === u.id ? null : u.id)}
            onStart={start}
          />
        ))}
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

function UnitCard({
  unit,
  progress,
  audio,
  open,
  onToggle,
  onStart,
}: {
  unit: Unit;
  progress: ProgressMap;
  audio: boolean;
  open: boolean;
  onToggle: () => void;
  onStart: (title: string, pool: PoolItem[]) => void;
}) {
  const pool: PoolItem[] = unit.terms.map((term) => ({ unitId: unit.id, term }));
  const ids = unit.terms.map((t) => termId(unit.id, t.nl));
  const pct = Math.round(strength(ids, progress) * 100);

  return (
    <div className="d-unit" style={{ ["--tone" as string]: unit.accent } as React.CSSProperties}>
      <div className="d-unit-head">
        <div>
          <h3>{unit.title}</h3>
          <span className="muted">{unit.subtitle}</span>
        </div>
        <span className="d-pct">{pct}%</span>
      </div>
      <p className="d-blurb">{unit.blurb}</p>
      <div className="d-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="d-unit-actions">
        <button className="btn primary" onClick={() => onStart(unit.title, pool)}>
          Oefenen
        </button>
        <button className="btn" onClick={onToggle}>
          {open ? "Verberg woordenlijst" : `Woordenlijst (${unit.terms.length})`}
        </button>
      </div>

      {open && (
        <ul className="d-list">
          {unit.terms.map((t) => (
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
              {t.def && <p className="d-def">{t.def}</p>}
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
}
