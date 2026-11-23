"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LessonScene, type LessonBuilder } from "./LessonScene";
import {
  IconArrow,
  IconChevron,
  IconCode,
  IconFlame,
  IconRepeat,
  IconSearch,
  IconShuffle,
  IconSpeaker,
} from "./icons";
import { ALL_CODE_QUESTIONS, CODE_UNITS, type CodeQuestion, type CodeUnit } from "@/dutch/code";
import { GRAMMAR } from "@/dutch/grammar";
import { buildCodeLesson, buildLesson, codeId, type PoolItem } from "@/dutch/lesson";
import { CODE_GROUP, GROUPS, recommend, statsFor, unitIds, unitsOf } from "@/dutch/path";
import {
  currentStreak,
  DAILY_GOAL,
  loadProgress,
  resetProgress,
  todayXp,
  type DutchSave,
} from "@/dutch/progress";
import { searchTerms } from "@/dutch/search";
import { isDue, type ProgressMap } from "@/dutch/srs";
import { termId, type Term, type Unit } from "@/dutch/types";
import { ALL_TERMS, TOTAL_TERMS, UNITS } from "@/dutch/vocab";
import { canSpeak, onVoicesReady, speakDutch } from "@/lib/speech";

type Tab = "leren" | "woordenboek" | "grammatica";
type View = { kind: "home" } | { kind: "lesson"; title: string; build: LessonBuilder; run: number };

const seed = () => Math.floor(Math.random() * 1e9);
const poolOf = (unit: Unit): PoolItem[] => unit.terms.map((term) => ({ unitId: unit.id, term }));

export function DutchHome() {
  const [save, setSave] = useState<DutchSave | null>(null);
  const [view, setView] = useState<View>({ kind: "home" });
  const [tab, setTab] = useState<Tab>("leren");
  const [audio, setAudio] = useState(false);

  const refresh = useCallback(() => setSave(loadProgress()), []);
  useEffect(refresh, [refresh]);
  useEffect(() => {
    setAudio(canSpeak());
    return onVoicesReady(() => setAudio(canSpeak()));
  }, []);

  const progress = useMemo(() => save?.terms ?? {}, [save]);

  const startWords = (title: string, pool: PoolItem[]) =>
    setView({
      kind: "lesson",
      title,
      run: 0,
      build: (p, a) => buildLesson(pool, { size: 12, seed: seed(), progress: p, audio: a }),
    });

  const startCode = (title: string, questions: CodeQuestion[]) =>
    setView({
      kind: "lesson",
      title,
      run: 0,
      build: (p) => buildCodeLesson(questions, { size: 8, seed: seed(), progress: p }),
    });

  if (view.kind === "lesson") {
    return (
      <div className="dk dk-wrap" lang="en">
        <LessonScene
          key={view.run}
          title={view.title}
          build={view.build}
          onExit={() => {
            refresh();
            setView({ kind: "home" });
            window.scrollTo({ top: 0 });
          }}
          onAgain={() => setView({ ...view, run: view.run + 1 })}
        />
      </div>
    );
  }

  const now = Date.now();
  const dueWords = ALL_TERMS.filter((t) => {
    const st = progress[termId(t.unitId, t.term.nl)];
    return st && isDue(st, now);
  });
  const dueCode = ALL_CODE_QUESTIONS.filter((q) => {
    const st = progress[codeId(q)];
    return st && isDue(st, now);
  });
  const dueTotal = dueWords.length + dueCode.length;

  const startReview = () =>
    setView({
      kind: "lesson",
      title: "Herhaling",
      run: 0,
      build: (p, a) => {
        const s = seed();
        return [
          ...buildLesson(dueWords, { size: 10, seed: s, progress: p, audio: a }),
          ...buildCodeLesson(dueCode, { size: 4, seed: s, progress: p }),
        ];
      },
    });

  const today = todayXp(save, now);
  const streak = currentStreak(save, now);
  const goalPct = Math.min(100, Math.round((today / DAILY_GOAL) * 100));

  return (
    <div className="dk">
      <header className="dk-top">
        <div className="dk-wrap">
        <div className="dk-top-row">
          <div className="dk-brand">
            <Link className="dk-link" href="/" aria-label="Terug naar het menu">
              ← <span className="dk-hide-sm">Menu</span>
            </Link>
            <h1>Code &amp; Koffie</h1>
          </div>
          <div className="dk-meters">
            <div className="dk-meter" title={`Dagdoel: ${today} van ${DAILY_GOAL} XP`}>
              <GoalRing pct={goalPct} />
              <span>
                <b>{today}</b>/{DAILY_GOAL} XP<span className="dk-hide-sm"> vandaag</span>
              </span>
            </div>
            <div className={`dk-meter ${streak > 0 ? "lit" : ""}`} title="Dagen op rij met je dagdoel gehaald">
              <IconFlame size={16} />
              <span>
                <b>{streak}</b>
                <span className="dk-hide-sm"> {streak === 1 ? "dag" : "dagen"}</span>
              </span>
            </div>
          </div>
        </div>
        <nav className="dk-tabs" role="tablist" aria-label="Onderdelen">
          {(
            [
              ["leren", "Leren"],
              ["woordenboek", "Woordenboek"],
              ["grammatica", "Grammatica"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              className={`dk-tab ${tab === id ? "on" : ""}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        </div>
      </header>

      <div className="dk-wrap">

      {tab === "leren" && (
        <LearnTab
          save={save}
          progress={progress}
          now={now}
          audio={audio}
          dueTotal={dueTotal}
          onReview={startReview}
          onWords={startWords}
          onCode={startCode}
          onReset={() => {
            if (confirm("Alle voortgang wissen? Dit kan niet ongedaan worden gemaakt.")) {
              resetProgress();
              refresh();
            }
          }}
        />
      )}
      {tab === "woordenboek" && <DictionaryTab audio={audio} />}
      {tab === "grammatica" && <GrammarTab />}
      </div>
    </div>
  );
}

function GoalRing({ pct }: { pct: number }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="dk-ring" aria-hidden>
      <circle cx="12" cy="12" r={r} className="track" />
      <circle
        cx="12"
        cy="12"
        r={r}
        className="fill"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        transform="rotate(-90 12 12)"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ Leren */

function LearnTab({
  save,
  progress,
  now,
  audio,
  dueTotal,
  onReview,
  onWords,
  onCode,
  onReset,
}: {
  save: DutchSave | null;
  progress: ProgressMap;
  now: number;
  audio: boolean;
  dueTotal: number;
  onReview: () => void;
  onWords: (title: string, pool: PoolItem[]) => void;
  onCode: (title: string, questions: CodeQuestion[]) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);

  const allIds = ALL_TERMS.map((t) => termId(t.unitId, t.term.nl));
  const overall = statsFor(allIds, progress, now);
  const rec = recommend(progress, now, dueTotal);
  const csPool = UNITS.filter((u) => u.track === "cs").flatMap(poolOf);
  const isNew = overall.seen === 0;

  return (
    <div className="dk-page">
      <section className="dk-next" aria-label="Volgende stap">
        <div className="dk-next-main">
          {rec.kind === "review" && (
            <>
              <p className="dk-eyebrow">Ga verder</p>
              <h2>Herhaal {rec.due} {rec.due === 1 ? "item" : "items"}</h2>
              <p className="dk-muted">
                These are due again. Reviewing right before you forget is what makes words stick.
              </p>
              <button className="dk-btn primary lg" onClick={onReview}>
                Herhaling starten <IconArrow />
              </button>
            </>
          )}
          {rec.kind === "unit" && (
            <>
              <p className="dk-eyebrow">{isNew ? "Begin hier" : rec.started ? "Ga verder" : "Volgende les"}</p>
              <h2 lang="nl">{rec.unit.title}</h2>
              <p className="dk-muted">
                {rec.unit.subtitle}. {rec.unit.blurb}
              </p>
              <button className="dk-btn primary lg" onClick={() => onWords(rec.unit.title, poolOf(rec.unit))}>
                {rec.started ? "Verder oefenen" : "Les starten"} <IconArrow />
              </button>
            </>
          )}
          {rec.kind === "code" && (
            <>
              <p className="dk-eyebrow">Volgende les</p>
              <h2 lang="nl">{rec.unit.title}</h2>
              <p className="dk-muted">
                {rec.unit.subtitle}. {rec.unit.blurb}
              </p>
              <button className="dk-btn primary lg" onClick={() => onCode(rec.unit.title, rec.unit.questions)}>
                Les starten <IconArrow />
              </button>
            </>
          )}
          {rec.kind === "done" && (
            <>
              <p className="dk-eyebrow">Alles gezien</p>
              <h2>Niets te herhalen op dit moment</h2>
              <p className="dk-muted">
                You have met every word in the course. Come back later for reviews, or practise any unit below.
              </p>
            </>
          )}
        </div>
        <dl className="dk-totals">
          <div>
            <dt>Gekend</dt>
            <dd>{overall.mastered}</dd>
          </div>
          <div>
            <dt>Gezien</dt>
            <dd>
              {overall.seen}
              <small>/{TOTAL_TERMS}</small>
            </dd>
          </div>
          <div>
            <dt>Lessen</dt>
            <dd>{save?.lessons ?? 0}</dd>
          </div>
        </dl>
      </section>

      <div className="dk-quick">
        <button className="dk-quick-btn" onClick={onReview} disabled={dueTotal === 0}>
          <IconRepeat />
          <span>
            <b>Herhalen</b>
            <small>{dueTotal > 0 ? `${dueTotal} klaar om te herhalen` : "Niets te herhalen"}</small>
          </span>
        </button>
        <button className="dk-quick-btn" onClick={() => onWords("Informatica door elkaar", csPool)}>
          <IconShuffle />
          <span>
            <b>Informatica door elkaar</b>
            <small>Een mix uit alle informatica-lessen</small>
          </span>
        </button>
        <button className="dk-quick-btn" onClick={() => onCode("Code lezen door elkaar", ALL_CODE_QUESTIONS)}>
          <IconCode />
          <span>
            <b>Code lezen</b>
            <small>{ALL_CODE_QUESTIONS.length} vragen over echte code</small>
          </span>
        </button>
      </div>

      {GROUPS.map((group) => {
        const units = unitsOf(group);
        const gStats = statsFor(units.flatMap(unitIds), progress, now);
        return (
          <section className="dk-group" key={group.id}>
            <div className="dk-group-head">
              <div>
                <h2 lang="nl">{group.title}</h2>
                <p className="dk-muted">{group.subtitle}</p>
              </div>
              <span className="dk-group-count">
                {gStats.seen}/{gStats.total} gezien
              </span>
            </div>
            <div className="dk-grid">
              {units.map((u) => (
                <UnitCard
                  key={u.id}
                  unit={u}
                  progress={progress}
                  now={now}
                  audio={audio}
                  open={open === u.id}
                  onToggle={() => setOpen(open === u.id ? null : u.id)}
                  onStart={() => onWords(u.title, poolOf(u))}
                />
              ))}
            </div>
          </section>
        );
      })}

      <section className="dk-group">
        <div className="dk-group-head">
          <div>
            <h2 lang="nl">{CODE_GROUP.title}</h2>
            <p className="dk-muted">{CODE_GROUP.subtitle}</p>
          </div>
          <span className="dk-group-count">
            {ALL_CODE_QUESTIONS.filter((q) => progress[codeId(q)]).length}/{ALL_CODE_QUESTIONS.length} gezien
          </span>
        </div>
        <div className="dk-grid">
          {CODE_UNITS.map((u) => (
            <CodeCard key={u.id} unit={u} progress={progress} now={now} onStart={() => onCode(u.title, u.questions)} />
          ))}
        </div>
      </section>

      <footer className="dk-foot">
        <p>
          Je voortgang wordt alleen in deze browser bewaard — geen account nodig.{" "}
          <button className="dk-link" onClick={onReset}>
            Voortgang wissen
          </button>
        </p>
      </footer>
    </div>
  );
}

function StatusChip({ seen, total, mastered, due }: { seen: number; total: number; mastered: number; due: number }) {
  if (due > 0) return <span className="dk-chip due">{due} herhalen</span>;
  if (seen === 0) return <span className="dk-chip new">Nieuw</span>;
  if (mastered === total) return <span className="dk-chip done">Gekend</span>;
  if (seen === total) return <span className="dk-chip ok">Alles gezien</span>;
  return <span className="dk-chip busy">Bezig</span>;
}

function UnitCard({
  unit,
  progress,
  now,
  audio,
  open,
  onToggle,
  onStart,
}: {
  unit: Unit;
  progress: ProgressMap;
  now: number;
  audio: boolean;
  open: boolean;
  onToggle: () => void;
  onStart: () => void;
}) {
  const st = statsFor(unitIds(unit), progress, now);
  const seenPct = (st.seen / st.total) * 100;
  const masteredPct = (st.mastered / st.total) * 100;
  const isSentences = unit.terms[0]?.kind === "sentence";

  return (
    <article
      className={`d-unit dk-unit ${open ? "open" : ""}`}
      style={{ ["--tone" as string]: unit.accent } as React.CSSProperties}
    >
      <div className="dk-unit-head">
        <h3 lang="nl">{unit.title}</h3>
        <StatusChip {...st} />
      </div>
      <p className="dk-unit-sub">{unit.subtitle}</p>
      <div className="dk-bar" aria-hidden>
        <span className="seen" style={{ width: `${seenPct}%` }} />
        <span className="mastered" style={{ width: `${masteredPct}%` }} />
      </div>
      <p className="dk-unit-count">
        {st.seen}/{st.total} {isSentences ? "zinnen" : "woorden"} gezien
        {st.mastered > 0 && ` · ${st.mastered} gekend`}
      </p>
      <div className="dk-unit-actions">
        <button className="dk-btn primary sm" onClick={onStart}>
          Oefenen
        </button>
        <button className="dk-btn ghost sm" onClick={onToggle} aria-expanded={open}>
          {isSentences ? "Zinnenlijst" : "Woordenlijst"} <IconChevron size={14} open={open} />
        </button>
      </div>

      {open && (
        <ul className="d-list dk-list">
          {unit.terms.map((t) => (
            <TermRow key={t.nl} term={t} audio={audio} />
          ))}
        </ul>
      )}
    </article>
  );
}

function CodeCard({
  unit,
  progress,
  now,
  onStart,
}: {
  unit: CodeUnit;
  progress: ProgressMap;
  now: number;
  onStart: () => void;
}) {
  const st = statsFor(unit.questions.map(codeId), progress, now);
  return (
    <article className="d-unit dk-unit" style={{ ["--tone" as string]: unit.accent } as React.CSSProperties}>
      <div className="dk-unit-head">
        <h3 lang="nl">{unit.title}</h3>
        <StatusChip {...st} />
      </div>
      <p className="dk-unit-sub">{unit.subtitle}</p>
      <div className="dk-bar" aria-hidden>
        <span className="seen" style={{ width: `${(st.seen / st.total) * 100}%` }} />
        <span className="mastered" style={{ width: `${(st.mastered / st.total) * 100}%` }} />
      </div>
      <p className="dk-unit-count">
        {st.seen}/{st.total} vragen gezien
      </p>
      <div className="dk-unit-actions">
        <button className="dk-btn primary sm" onClick={onStart}>
          Oefenen
        </button>
      </div>
    </article>
  );
}

function TermRow({ term, audio, unitTitle }: { term: Term; audio: boolean; unitTitle?: string }) {
  return (
    <li className="dk-term">
      <div className="dk-term-row">
        <span className="dk-term-nl" lang="nl">
          {term.nl}
          {audio && (
            <button className="d-speak tiny" onClick={() => speakDutch(term.nl)} aria-label={`Spreek "${term.nl}" uit`}>
              <IconSpeaker size={13} />
            </button>
          )}
        </span>
        <span className="dk-term-en">{term.en}</span>
      </div>
      {term.def && <p className="d-def">{term.def}</p>}
      {term.note && <p className="d-note">{term.note}</p>}
      {term.example && (
        <p className="d-example">
          <i lang="nl">{term.example.nl}</i> — {term.example.en}
        </p>
      )}
      {unitTitle && (
        <p className="dk-term-unit" lang="nl">
          {unitTitle}
        </p>
      )}
    </li>
  );
}

/* ------------------------------------------------------------ Woordenboek */

const SUGGESTIONS = ["teller", "compiler", "indienen", "half acht", "deadlock", "gebuisd", "map", "graaf"];

function DictionaryTab({ audio }: { audio: boolean }) {
  const [query, setQuery] = useState("");
  const hits = useMemo(() => searchTerms(query, 40), [query]);
  const trimmed = query.trim();

  return (
    <div className="dk-page">
      <div className="dk-search">
        <IconSearch />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek een woord — Nederlands of Engels"
          aria-label="Zoek in het woordenboek"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus
        />
      </div>

      {trimmed.length < 2 ? (
        <div className="dk-empty">
          <p>
            Heard a word in class? Type it here — with or without the article, accents or capitals — in Dutch or in
            English. {TOTAL_TERMS} words and sentences, each with its meaning and usage.
          </p>
          <div className="dk-suggest">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="dk-chip-btn" onClick={() => setQuery(s)} lang="nl">
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : hits.length === 0 ? (
        <div className="dk-empty">
          <p>
            Niets gevonden voor <b>“{trimmed}”</b>. Check the spelling, or try the English word.
          </p>
        </div>
      ) : (
        <>
          <p className="dk-result-count">
            {hits.length === 40 ? "Eerste 40 resultaten" : `${hits.length} ${hits.length === 1 ? "resultaat" : "resultaten"}`}
          </p>
          <ul className="dk-list flat">
            {hits.map((h) => (
              <TermRow key={`${h.unit.id}:${h.term.nl}`} term={h.term} audio={audio} unitTitle={h.unit.title} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- Grammatica */

function GrammarTab() {
  const [open, setOpen] = useState<string | null>(GRAMMAR[0]?.id ?? null);
  return (
    <div className="dk-page">
      <p className="dk-lead">
        The dozen rules that explain most mistakes an English speaker makes in Dutch — with examples from class and
        from code.
      </p>
      <div className="dk-acc">
        {GRAMMAR.map((g) => {
          const isOpen = open === g.id;
          return (
            <section className={`dk-acc-item ${isOpen ? "open" : ""}`} key={g.id}>
              <button className="dk-acc-head" onClick={() => setOpen(isOpen ? null : g.id)} aria-expanded={isOpen}>
                <span>
                  <b lang="nl">{g.title}</b>
                  <small>{g.titleEn}</small>
                </span>
                <IconChevron open={isOpen} />
              </button>
              {isOpen && (
                <div className="dk-acc-body">
                  <p className="dk-acc-summary">{g.summary}</p>
                  <ul className="dk-acc-points">
                    {g.points.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                  <div className="dk-acc-examples">
                    {g.examples.map((e, i) => (
                      <p key={i}>
                        <span lang="nl">{e.nl}</span>
                        <small>{e.en}</small>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
