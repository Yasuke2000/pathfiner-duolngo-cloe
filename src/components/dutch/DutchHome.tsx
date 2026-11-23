"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LessonScene, type LessonBuilder } from "./LessonScene";
import { ProgressTab } from "./ProgressTab";
import { SettingsProvider, useUi } from "./settings";
import { UnitIcon } from "./UnitIcon";
import {
  IconArrow,
  IconChevron,
  IconCode,
  IconFlame,
  IconMoon,
  IconRepeat,
  IconSearch,
  IconShuffle,
  IconSpeaker,
  IconSun,
} from "./icons";
import { ALL_CODE_QUESTIONS, CODE_UNITS, type CodeQuestion, type CodeUnit } from "@/dutch/code";
import { GRAMMAR } from "@/dutch/grammar";
import { buildCodeLesson, buildLesson, codeId, type PoolItem } from "@/dutch/lesson";
import { CODE_GROUP, GROUPS, recommend, statsFor, unitIds, unitsOf } from "@/dutch/path";
import { currentStreak, DAILY_GOAL, loadProgress, todayXp, type DutchSave } from "@/dutch/progress";
import { searchTerms } from "@/dutch/search";
import { isDue, type ProgressMap } from "@/dutch/srs";
import { termId, type Term, type Unit } from "@/dutch/types";
import { ALL_TERMS, TOTAL_TERMS, UNITS } from "@/dutch/vocab";
import { canSpeak, onVoicesReady, speakDutch } from "@/lib/speech";

type Tab = "learn" | "dict" | "grammar" | "progress";
type View = { kind: "home" } | { kind: "lesson"; title: string; build: LessonBuilder; run: number };

const seed = () => Math.floor(Math.random() * 1e9);
const poolOf = (unit: Unit): PoolItem[] => unit.terms.map((term) => ({ unitId: unit.id, term }));

export function DutchHome() {
  return (
    <SettingsProvider>
      <App />
    </SettingsProvider>
  );
}

function App() {
  const { lang, theme, setLang, setTheme, t } = useUi();
  const [save, setSave] = useState<DutchSave | null>(null);
  const [view, setView] = useState<View>({ kind: "home" });
  const [tab, setTab] = useState<Tab>("learn");
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
      <div className="dk" data-theme={theme}>
        <div className="dk-wrap">
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
      </div>
    );
  }

  const now = Date.now();
  const dueWords = ALL_TERMS.filter((x) => {
    const st = progress[termId(x.unitId, x.term.nl)];
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
      title: t("quick.review"),
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

  const meters = (
    <>
      <div className="dk-meter" title={t("goal.title", { n: today, goal: DAILY_GOAL })}>
        <Ring pct={goalPct} size={22} stroke={3} />
        <span>
          <b>{today}</b>/{DAILY_GOAL} {t("goal.short")}
          <span className="dk-hide-md">{t("goal.today")}</span>
        </span>
      </div>
      <div className={`dk-meter ${streak > 0 ? "lit" : ""}`} title={t("streak.title")}>
        <IconFlame size={15} />
        <span>
          <b>{streak}</b> {streak === 1 ? t("streak.day") : t("streak.days")}
        </span>
      </div>
    </>
  );

  const tabs: [Tab, string][] = [
    ["learn", t("tab.learn")],
    ["dict", t("tab.dict")],
    ["grammar", t("tab.grammar")],
    ["progress", t("tab.progress")],
  ];

  return (
    <div className="dk" data-theme={theme}>
      <header className="dk-top">
        <div className="dk-wrap">
          <div className="dk-top-row">
            <div className="dk-brand">
              <Link className="dk-link" href="/" aria-label={t("nav.back")}>
                ← <span className="dk-hide-sm">{t("nav.menu")}</span>
              </Link>
              <h1>Code &amp; Koffie</h1>
            </div>
            <div className="dk-tools">
              <div className="dk-meters dk-hide-sm">{meters}</div>
              <div className="dk-seg" role="group" aria-label={t("settings.lang")}>
                {(["en", "nl"] as const).map((l) => (
                  <button key={l} className={lang === l ? "on" : ""} aria-pressed={lang === l} onClick={() => setLang(l)}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                className="dk-icon-btn"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={t(theme === "dark" ? "settings.theme.light" : "settings.theme.dark")}
                title={t(theme === "dark" ? "settings.theme.light" : "settings.theme.dark")}
              >
                {theme === "dark" ? <IconSun size={17} /> : <IconMoon size={17} />}
              </button>
            </div>
          </div>
          <nav className="dk-tabs" role="tablist" aria-label={t("tabs.label")}>
            {tabs.map(([id, label]) => (
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
        {tab === "learn" && (
          <>
            <div className="dk-meters dk-mobile-meters">{meters}</div>
            <LearnTab
              save={save}
              progress={progress}
              now={now}
              audio={audio}
              dueTotal={dueTotal}
              onReview={startReview}
              onWords={startWords}
              onCode={startCode}
            />
          </>
        )}
        {tab === "dict" && <DictionaryTab audio={audio} />}
        {tab === "grammar" && <GrammarTab />}
        {tab === "progress" && (
          <ProgressTab
            save={save}
            progress={progress}
            now={now}
            onWords={startWords}
            onCode={startCode}
            onChanged={refresh}
          />
        )}
      </div>
    </div>
  );
}

export function Ring({
  pct,
  size,
  stroke,
  children,
}: {
  pct: number;
  size: number;
  stroke: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="dk-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} className="track" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="fill"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(100, Math.max(0, pct)) / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {children && <span className="dk-ring-label">{children}</span>}
    </span>
  );
}

/* ------------------------------------------------------------------ Learn */

function LearnTab({
  save,
  progress,
  now,
  audio,
  dueTotal,
  onReview,
  onWords,
  onCode,
}: {
  save: DutchSave | null;
  progress: ProgressMap;
  now: number;
  audio: boolean;
  dueTotal: number;
  onReview: () => void;
  onWords: (title: string, pool: PoolItem[]) => void;
  onCode: (title: string, questions: CodeQuestion[]) => void;
}) {
  const { t, pick } = useUi();
  const [open, setOpen] = useState<string | null>(null);

  const allIds = ALL_TERMS.map((x) => termId(x.unitId, x.term.nl));
  const overall = statsFor(allIds, progress, now);
  const rec = recommend(progress, now, dueTotal);
  const csPool = UNITS.filter((u) => u.track === "cs").flatMap(poolOf);
  const isNew = overall.seen === 0;
  const coursePct = Math.round((overall.seen / overall.total) * 100);
  const name = (u: { title: string; subtitle: string }) => pick(u.title, u.subtitle);
  const other = (u: { title: string; subtitle: string }) => pick(u.subtitle, u.title);

  return (
    <div className="dk-page">
      <section className="dk-next" aria-label={t("next.label")}>
        <div className="dk-next-main">
          {rec.kind === "review" && (
            <>
              <p className="dk-eyebrow">{t("next.continue")}</p>
              <h2>{rec.due === 1 ? t("next.review.title.one") : t("next.review.title", { n: rec.due })}</h2>
              <p className="dk-muted">{t("next.review.body")}</p>
              <button className="dk-btn primary lg" onClick={onReview}>
                {t("next.review.start")} <IconArrow />
              </button>
            </>
          )}
          {(rec.kind === "unit" || rec.kind === "code") && (
            <>
              <p className="dk-eyebrow">
                {isNew ? t("next.begin") : rec.kind === "unit" && rec.started ? t("next.continue") : t("next.lesson")}
              </p>
              <h2>{name(rec.unit)}</h2>
              <p className="dk-next-sub">{other(rec.unit)}</p>
              <p className="dk-muted">{rec.unit.blurb}</p>
              <button
                className="dk-btn primary lg"
                onClick={() =>
                  rec.kind === "unit"
                    ? onWords(name(rec.unit), poolOf(rec.unit))
                    : onCode(name(rec.unit), rec.unit.questions)
                }
              >
                {rec.kind === "unit" && rec.started ? t("next.resume") : t("next.start")} <IconArrow />
              </button>
            </>
          )}
          {rec.kind === "done" && (
            <>
              <p className="dk-eyebrow">{t("next.done.eyebrow")}</p>
              <h2>{t("next.done.title")}</h2>
              <p className="dk-muted">{t("next.done.body")}</p>
            </>
          )}
        </div>
        <aside className="dk-next-side">
          <Ring pct={coursePct} size={104} stroke={9}>
            <b>{coursePct}%</b>
          </Ring>
          <div>
            <p className="dk-next-ring-label">{t("course.seen")}</p>
            <dl className="dk-totals">
              <div>
                <dt>{t("totals.seen")}</dt>
                <dd>
                  {overall.seen}
                  <small>/{TOTAL_TERMS}</small>
                </dd>
              </div>
              <div>
                <dt>{t("totals.known")}</dt>
                <dd>{overall.mastered}</dd>
              </div>
              <div>
                <dt>{t("totals.lessons")}</dt>
                <dd>{save?.lessons ?? 0}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>

      <div className="dk-quick">
        <button className="dk-quick-btn" onClick={onReview} disabled={dueTotal === 0}>
          <span className="dk-quick-ico">
            <IconRepeat />
          </span>
          <span>
            <b>{t("quick.review")}</b>
            <small>{dueTotal > 0 ? t("quick.review.ready", { n: dueTotal }) : t("quick.review.none")}</small>
          </span>
        </button>
        <button className="dk-quick-btn" onClick={() => onWords(t("quick.mix"), csPool)}>
          <span className="dk-quick-ico">
            <IconShuffle />
          </span>
          <span>
            <b>{t("quick.mix")}</b>
            <small>{t("quick.mix.sub")}</small>
          </span>
        </button>
        <button className="dk-quick-btn" onClick={() => onCode(t("quick.code"), ALL_CODE_QUESTIONS)}>
          <span className="dk-quick-ico">
            <IconCode />
          </span>
          <span>
            <b>{t("quick.code")}</b>
            <small>{t("quick.code.sub", { n: ALL_CODE_QUESTIONS.length })}</small>
          </span>
        </button>
      </div>

      {GROUPS.map((group, gi) => {
        const units = unitsOf(group);
        const gStats = statsFor(units.flatMap(unitIds), progress, now);
        return (
          <section className="dk-group" key={group.id}>
            <div className="dk-group-head">
              <span className="dk-step" aria-hidden>
                {gi + 1}
              </span>
              <div>
                <h2>{pick(group.title, group.titleEn)}</h2>
                <p className="dk-muted">{group.subtitle}</p>
              </div>
              <span className="dk-group-count">{t("group.seen", { a: gStats.seen, b: gStats.total })}</span>
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
                  onStart={() => onWords(name(u), poolOf(u))}
                />
              ))}
            </div>
          </section>
        );
      })}

      <section className="dk-group">
        <div className="dk-group-head">
          <span className="dk-step" aria-hidden>
            {GROUPS.length + 1}
          </span>
          <div>
            <h2>{pick(CODE_GROUP.title, CODE_GROUP.titleEn)}</h2>
            <p className="dk-muted">{CODE_GROUP.subtitle}</p>
          </div>
          <span className="dk-group-count">
            {t("group.seen", {
              a: ALL_CODE_QUESTIONS.filter((q) => progress[codeId(q)]).length,
              b: ALL_CODE_QUESTIONS.length,
            })}
          </span>
        </div>
        <div className="dk-grid">
          {CODE_UNITS.map((u) => (
            <CodeCard key={u.id} unit={u} progress={progress} now={now} onStart={() => onCode(name(u), u.questions)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusChip({ seen, total, mastered, due }: { seen: number; total: number; mastered: number; due: number }) {
  const { t } = useUi();
  if (due > 0) return <span className="dk-chip due">{t("chip.due", { n: due })}</span>;
  if (seen === 0) return <span className="dk-chip new">{t("chip.new")}</span>;
  if (mastered === total) return <span className="dk-chip done">{t("chip.done")}</span>;
  if (seen === total) return <span className="dk-chip ok">{t("chip.allSeen")}</span>;
  return <span className="dk-chip busy">{t("chip.busy")}</span>;
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
  const { t, pick } = useUi();
  const st = statsFor(unitIds(unit), progress, now);
  const isSentences = unit.terms[0]?.kind === "sentence";

  return (
    <article
      className={`d-unit dk-unit ${open ? "open" : ""}`}
      style={{ ["--tone" as string]: unit.accent } as React.CSSProperties}
    >
      <div className="dk-unit-head">
        <span className="dk-unit-ico">
          <UnitIcon unitId={unit.id} />
        </span>
        <div className="dk-unit-titles">
          <h3>{pick(unit.title, unit.subtitle)}</h3>
          <p className="dk-unit-sub">{pick(unit.subtitle, unit.title)}</p>
        </div>
        <StatusChip {...st} />
      </div>
      <div className="dk-bar" aria-hidden>
        <span className="seen" style={{ width: `${(st.seen / st.total) * 100}%` }} />
        <span className="mastered" style={{ width: `${(st.mastered / st.total) * 100}%` }} />
      </div>
      <p className="dk-unit-count">
        {t(isSentences ? "unit.sentences" : "unit.words", { a: st.seen, b: st.total })}
        {st.mastered > 0 && ` · ${t("unit.known", { n: st.mastered })}`}
      </p>
      <div className="dk-unit-actions">
        <button className="dk-btn primary sm" onClick={onStart}>
          {t("btn.practise")}
        </button>
        <button className="dk-btn ghost sm" onClick={onToggle} aria-expanded={open}>
          {t(isSentences ? "btn.sentencelist" : "btn.wordlist")} <IconChevron size={14} open={open} />
        </button>
      </div>

      {open && (
        <ul className="d-list dk-list">
          {unit.terms.map((term) => (
            <TermRow key={term.nl} term={term} audio={audio} />
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
  const { t, pick } = useUi();
  const st = statsFor(unit.questions.map(codeId), progress, now);
  return (
    <article className="d-unit dk-unit" style={{ ["--tone" as string]: unit.accent } as React.CSSProperties}>
      <div className="dk-unit-head">
        <span className="dk-unit-ico">
          <UnitIcon unitId={unit.id} />
        </span>
        <div className="dk-unit-titles">
          <h3>{pick(unit.title, unit.subtitle)}</h3>
          <p className="dk-unit-sub">{pick(unit.subtitle, unit.title)}</p>
        </div>
        <StatusChip {...st} />
      </div>
      <div className="dk-bar" aria-hidden>
        <span className="seen" style={{ width: `${(st.seen / st.total) * 100}%` }} />
        <span className="mastered" style={{ width: `${(st.mastered / st.total) * 100}%` }} />
      </div>
      <p className="dk-unit-count">{t("unit.questions", { a: st.seen, b: st.total })}</p>
      <div className="dk-unit-actions">
        <button className="dk-btn primary sm" onClick={onStart}>
          {t("btn.practise")}
        </button>
      </div>
    </article>
  );
}

export function TermRow({ term, audio, unitTitle }: { term: Term; audio: boolean; unitTitle?: string }) {
  const { t } = useUi();
  return (
    <li className="dk-term">
      <div className="dk-term-row">
        <span className="dk-term-nl" lang="nl">
          {term.nl}
          {audio && (
            <button className="d-speak tiny" onClick={() => speakDutch(term.nl)} aria-label={t("speak", { word: term.nl })}>
              <IconSpeaker size={13} />
            </button>
          )}
        </span>
        <span className="dk-term-en" lang="en">
          {term.en}
        </span>
      </div>
      {term.def && <p className="d-def">{term.def}</p>}
      {term.note && <p className="d-note">{term.note}</p>}
      {term.example && (
        <p className="d-example">
          <i lang="nl">{term.example.nl}</i> — {term.example.en}
        </p>
      )}
      {unitTitle && <p className="dk-term-unit">{unitTitle}</p>}
    </li>
  );
}

/* -------------------------------------------------------------- Dictionary */

const SUGGESTIONS = ["teller", "compiler", "indienen", "half acht", "deadlock", "gebuisd", "map", "graaf"];
const LIMIT = 40;

function DictionaryTab({ audio }: { audio: boolean }) {
  const { t, pick } = useUi();
  const [query, setQuery] = useState("");
  const hits = useMemo(() => searchTerms(query, LIMIT), [query]);
  const trimmed = query.trim();

  return (
    <div className="dk-page">
      <div className="dk-search">
        <IconSearch />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("dict.placeholder")}
          aria-label={t("dict.label")}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus
        />
      </div>

      {trimmed.length < 2 ? (
        <div className="dk-empty">
          <p>{t("dict.intro", { n: TOTAL_TERMS })}</p>
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
          <p>{t("dict.none", { q: trimmed })}</p>
        </div>
      ) : (
        <>
          <p className="dk-result-count">
            {hits.length === LIMIT
              ? t("dict.first", { n: LIMIT })
              : hits.length === 1
                ? t("dict.results.one")
                : t("dict.results", { n: hits.length })}
          </p>
          <ul className="dk-list flat">
            {hits.map((h) => (
              <TermRow
                key={`${h.unit.id}:${h.term.nl}`}
                term={h.term}
                audio={audio}
                unitTitle={pick(h.unit.title, h.unit.subtitle)}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- Grammar */

function GrammarTab() {
  const { t, pick } = useUi();
  const [open, setOpen] = useState<string | null>(GRAMMAR[0]?.id ?? null);
  return (
    <div className="dk-page">
      <p className="dk-lead">{t("gram.lead")}</p>
      <div className="dk-acc">
        {GRAMMAR.map((g) => {
          const isOpen = open === g.id;
          return (
            <section className={`dk-acc-item ${isOpen ? "open" : ""}`} key={g.id}>
              <button className="dk-acc-head" onClick={() => setOpen(isOpen ? null : g.id)} aria-expanded={isOpen}>
                <span>
                  <b>{pick(g.title, g.titleEn)}</b>
                  <small>{pick(g.titleEn, g.title)}</small>
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
