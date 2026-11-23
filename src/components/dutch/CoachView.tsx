"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ActivityChart, Kpi, MemoryBar } from "./charts";
import { SettingsProvider, useUi } from "./settings";
import { IconMoon, IconSun, IconUpload } from "./icons";
import { decodeTransfer, importSave } from "@/dutch/backup";
import { ALL_CODE_QUESTIONS } from "@/dutch/code";
import { LEVELS } from "@/dutch/concepts";
import {
  conceptStats,
  kindStats,
  missedQuestions,
  recentMistakes,
  summarise,
  weakConcepts,
  type ConceptStat,
} from "@/dutch/insights";
import { codeId } from "@/dutch/lesson";
import { CODE_GROUP, GROUPS, statsFor, unitIds, unitsOf } from "@/dutch/path";
import { currentStreak, loadProgress, type DutchSave } from "@/dutch/progress";
import { activitySeries, strengthBuckets, weakest } from "@/dutch/stats";
import { termId } from "@/dutch/types";
import type { UiKey } from "@/dutch/ui";
import { ALL_TERMS, TOTAL_TERMS } from "@/dutch/vocab";

/**
 * The owner's view. The learner sends a report (the same file or code as her
 * backup) and this page turns it into answers to "what does she not understand
 * yet?". The report is parsed in the browser and never stored or uploaded.
 */
export function CoachView() {
  return (
    <SettingsProvider>
      <Coach />
    </SettingsProvider>
  );
}

function Coach() {
  const { t, lang, theme, setLang, setTheme } = useUi();
  const [report, setReport] = useState<DutchSave | null>(null);
  const [error, setError] = useState(false);
  const [code, setCode] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function openFile(file: File | undefined) {
    if (!file) return;
    try {
      setReport(importSave(await file.text()));
      setError(false);
    } catch {
      setError(true);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function openCode() {
    try {
      setReport(await decodeTransfer(code));
      setError(false);
      setCode("");
    } catch {
      setError(true);
    }
  }

  return (
    <div className="dk" data-theme={theme}>
      <header className="dk-top solo">
        <div className="dk-wrap">
          <div className="dk-top-row">
            <div className="dk-brand">
              <Link className="dk-link" href="/dutch" aria-label={t("coach.back")}>
                ← <span className="dk-hide-sm">Code &amp; Koffie</span>
              </Link>
              <h1>{t("coach.title")}</h1>
            </div>
            <div className="dk-tools">
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
              >
                {theme === "dark" ? <IconSun size={17} /> : <IconMoon size={17} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="dk-wrap">
        {report === null ? (
          <div className="dk-page">
            <section className="dk-panel dk-coach-load">
              <h2>{t("coach.title")}</h2>
              <p className="dk-panel-sub wide">{t("coach.lead")}</p>
              <div className="dk-backup-actions">
                <button className="dk-btn primary" onClick={() => fileRef.current?.click()}>
                  <IconUpload size={16} /> {t("coach.load.file")}
                </button>
                <button
                  className="dk-btn"
                  onClick={() => {
                    setReport(loadProgress());
                    setError(false);
                  }}
                >
                  {t("coach.load.own")}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={(e) => openFile(e.target.files?.[0])}
                  data-testid="report-file"
                />
              </div>
              <div className="dk-backup-paste">
                <textarea
                  className="dk-code-box"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t("coach.load.code.placeholder")}
                  aria-label={t("coach.load.code.label")}
                  rows={2}
                  spellCheck={false}
                />
                <button className="dk-btn" onClick={openCode} disabled={code.trim().length === 0}>
                  {t("coach.load.code.go")}
                </button>
              </div>
              {error && (
                <p className="dk-msg err" role="alert">
                  {t("backup.err.invalid")}
                </p>
              )}
            </section>
          </div>
        ) : (
          <Dashboard report={report} onClose={() => setReport(null)} />
        )}
      </div>
    </div>
  );
}

function Dashboard({ report, onClose }: { report: DutchSave; onClose: () => void }) {
  const { t, pick, lang } = useUi();
  const now = Date.now();
  const progress = report.terms;
  const allIds = ALL_TERMS.map((x) => termId(x.unitId, x.term.nl));
  const overall = statsFor(allIds, progress, now);
  const sum = summarise(report, now);
  const weakC = weakConcepts(progress);
  const concepts = conceptStats(progress);
  const missed = missedQuestions(report);
  const kinds = kindStats(report);
  const log = recentMistakes(report, 40);
  const words = weakest(ALL_TERMS, progress, 15);
  const codeById = new Map(ALL_CODE_QUESTIONS.map((q) => [codeId(q), q]));

  const last =
    sum.daysSince === null
      ? t("coach.last.never")
      : sum.daysSince === 0
        ? t("coach.last.today")
        : sum.daysSince === 1
          ? t("coach.last.yesterday")
          : t("coach.last.days", { n: sum.daysSince });

  const when = (ms: number) =>
    new Date(ms).toLocaleString(lang === "nl" ? "nl-BE" : "en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const sections = [
    ...GROUPS.map((g) => ({
      id: g.id,
      name: pick(g.title, g.titleEn),
      ...statsFor(unitsOf(g).flatMap(unitIds), progress, now),
    })),
    {
      id: CODE_GROUP.id,
      name: pick(CODE_GROUP.title, CODE_GROUP.titleEn),
      ...statsFor(ALL_CODE_QUESTIONS.map(codeId), progress, now),
    },
  ];

  const answerText = (given: string) => (given.trim() ? given : `— ${t("coach.idk")}`);

  return (
    <div className="dk-page">
      <div className="dk-coach-bar">
        <p className="dk-muted">{t("coach.lead").split(". ")[0]}.</p>
        <button className="dk-btn sm" onClick={onClose}>
          {t("coach.close")}
        </button>
      </div>

      <div className="dk-kpis">
        <Kpi label={t("coach.kpi.last")} value={last} sub={sum.lastActive ?? undefined} />
        <Kpi label={t("coach.kpi.active")} value={sum.activeDays14} sub={t("coach.kpi.active.sub")} />
        <Kpi
          label={t("prog.accuracy")}
          value={sum.pct === null ? "–" : `${sum.pct}%`}
          sub={t("prog.accuracy.sub", { n: sum.answers })}
        />
        <Kpi label={t("prog.seen")} value={overall.seen} sub={t("prog.of", { n: TOTAL_TERMS })} />
        <Kpi label={t("prog.known")} value={overall.mastered} sub={t("prog.of", { n: TOTAL_TERMS })} />
        <Kpi label={t("prog.streak")} value={currentStreak(report, now)} sub={t("prog.lessons.sub", { n: report.lessons })} />
      </div>

      <div className="dk-panels">
        <section className="dk-panel wide">
          <h2>{t("coach.attention")}</h2>
          <p className="dk-panel-sub wide">{t("coach.attention.sub")}</p>
          {weakC.length === 0 ? (
            <p className="dk-muted">{t("coach.attention.none")}</p>
          ) : (
            <ul className="dk-meterlist concept">
              {weakC.map((c) => (
                <ConceptRow key={c.concept.id} c={c} />
              ))}
            </ul>
          )}
        </section>

        <section className="dk-panel wide">
          <h2>{t("coach.missed")}</h2>
          <p className="dk-panel-sub wide">{t("coach.missed.sub")}</p>
          {missed.length === 0 ? (
            <p className="dk-muted">{t("coach.missed.none")}</p>
          ) : (
            <div className="dk-missed">
              {missed.slice(0, 25).map((m) => (
                <details key={m.question.id}>
                  <summary>
                    <span className="q" lang="nl">
                      {m.question.question}
                    </span>
                    {m.concept && <span className="dk-chip">{pick(m.concept.nl, m.concept.en)}</span>}
                    <span className="dk-chip due">
                      {m.wrong === 1 ? t("coach.missed.times.one") : t("coach.missed.times", { n: m.wrong })}
                    </span>
                  </summary>
                  <div className="body">
                    <div className="d-codewrap">
                      <span className="d-lang">{m.question.lang}</span>
                      <pre className="d-code">
                        <code>{m.question.code}</code>
                      </pre>
                    </div>
                    <dl>
                      {m.lastGiven !== null && (
                        <div>
                          <dt>{t("coach.her")}</dt>
                          <dd className="bad" lang="nl">
                            {answerText(m.lastGiven)}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt>{t("coach.right")}</dt>
                        <dd className="good" lang="nl">
                          {m.question.answer}
                        </dd>
                      </div>
                    </dl>
                    <p className="d-def">{pick(m.question.explain, m.question.explainEn)}</p>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        <section className="dk-panel wide">
          <h2>{t("coach.concepts")}</h2>
          <p className="dk-panel-sub wide">{t("coach.concepts.sub")}</p>
          <div className="dk-table-scroll">
            <table className="dk-table concept">
              <thead>
                <tr>
                  <th>{t("coach.col.concept")}</th>
                  <th>{t("coach.col.level")}</th>
                  <th>{t("coach.col.accuracy")}</th>
                  <th>{t("coach.col.answers")}</th>
                  <th>{t("coach.col.coverage")}</th>
                </tr>
              </thead>
              <tbody>
                {concepts.map((c) => (
                  <tr key={c.concept.id} className={c.pct === null ? "idle" : ""}>
                    <td>{pick(c.concept.nl, c.concept.en)}</td>
                    <td>{pick(LEVELS[c.concept.level].nl, LEVELS[c.concept.level].en)}</td>
                    <td>
                      <span className="pctcell">
                        <span className="track" aria-hidden>
                          <span style={{ width: `${c.pct ?? 0}%` }} />
                        </span>
                        <b>{c.pct === null ? "–" : `${c.pct}%`}</b>
                      </span>
                    </td>
                    <td>{c.answers ? `${c.correct}/${c.answers}` : "–"}</td>
                    <td>
                      {c.attempted}/{c.questions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dk-panel">
          <h2>{t("coach.kinds")}</h2>
          <p className="dk-panel-sub">{t("coach.kinds.sub")}</p>
          {kinds.length === 0 ? (
            <p className="dk-muted">{t("coach.kinds.none")}</p>
          ) : (
            <ul className="dk-meterlist">
              {kinds.map((k) => (
                <li key={k.kind}>
                  <span className="name">{t(`kind.${k.kind}` as UiKey)}</span>
                  <span className="track" aria-hidden>
                    <span style={{ width: `${k.pct}%` }} />
                  </span>
                  <span className="fig">
                    {k.ok}/{k.n}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dk-panel">
          <h2>{t("prog.memory")}</h2>
          <p className="dk-panel-sub">{t("prog.memory.sub")}</p>
          <MemoryBar strength={strengthBuckets(allIds, progress)} total={allIds.length} />
        </section>

        <section className="dk-panel wide">
          <ActivityChart series={activitySeries(report, now, 14)} />
        </section>

        <section className="dk-panel wide">
          <h2>{t("coach.log")}</h2>
          <p className="dk-panel-sub wide">{t("coach.log.sub", { n: log.length })}</p>
          {log.length === 0 ? (
            <p className="dk-muted">{t("coach.log.none")}</p>
          ) : (
            <div className="dk-table-scroll">
              <table className="dk-table mistakes">
                <thead>
                  <tr>
                    <th>{t("coach.col.when")}</th>
                    <th>{t("coach.col.type")}</th>
                    <th>{t("coach.col.asked")}</th>
                    <th>{t("coach.her")}</th>
                    <th>{t("coach.right")}</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((m, i) => (
                    <tr key={`${m.t}-${i}`}>
                      <td>{when(m.t)}</td>
                      <td>{t(`kind.${m.kind}` as UiKey)}</td>
                      <td>{codeById.get(m.id)?.question ?? m.asked}</td>
                      <td className="bad">{answerText(m.given)}</td>
                      <td className="good">{m.expected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dk-panel">
          <h2>{t("coach.words")}</h2>
          <p className="dk-panel-sub">{t("prog.weak.sub")}</p>
          {words.length === 0 ? (
            <p className="dk-muted">{t("prog.weak.none")}</p>
          ) : (
            <ul className="dk-weak">
              {words.map((w) => (
                <li key={`${w.unitId}:${w.term.nl}`}>
                  <span className="nl" lang="nl">
                    {w.term.nl}
                  </span>
                  <span className="en">{w.term.en}</span>
                  <span className="score">{t("work.score", { ok: w.correct, n: w.seen })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dk-panel">
          <h2>{t("prog.sections")}</h2>
          <p className="dk-panel-sub">{t("prog.sections.sub")}</p>
          <ul className="dk-meterlist">
            {sections.map((s) => (
              <li key={s.id}>
                <span className="name">{s.name}</span>
                <span className="track" aria-hidden>
                  <span style={{ width: `${(s.seen / s.total) * 100}%` }} />
                </span>
                <span className="fig">
                  {s.seen}/{s.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function ConceptRow({ c }: { c: ConceptStat }) {
  const { t, pick } = useUi();
  return (
    <li>
      <span className="name">
        {pick(c.concept.nl, c.concept.en)}
        <small>{pick(LEVELS[c.concept.level].nl, LEVELS[c.concept.level].en)}</small>
      </span>
      <span className="track" aria-hidden>
        <span style={{ width: `${c.pct ?? 0}%` }} />
      </span>
      <span className="fig">{t("work.score", { ok: c.correct, n: c.answers })}</span>
    </li>
  );
}
