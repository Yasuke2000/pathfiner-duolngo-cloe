"use client";

import { useRef, useState } from "react";
import { useUi } from "./settings";
import { IconCopy, IconDownload, IconTarget, IconUpload } from "./icons";
import { decodeTransfer, encodeTransfer, exportSave, importSave, mergeSaves } from "@/dutch/backup";
import { ALL_CODE_QUESTIONS } from "@/dutch/code";
import { codeId, type PoolItem } from "@/dutch/lesson";
import { CODE_GROUP, GROUPS, statsFor, unitIds, unitsOf } from "@/dutch/path";
import {
  currentStreak,
  DAILY_GOAL,
  dayKey,
  loadProgress,
  resetProgress,
  saveProgress,
  type DutchSave,
} from "@/dutch/progress";
import { accuracy, activitySeries, strengthBuckets, weakest, type ActivityDay } from "@/dutch/stats";
import type { ProgressMap } from "@/dutch/srs";
import { termId } from "@/dutch/types";
import { ALL_TERMS, TOTAL_TERMS } from "@/dutch/vocab";

export function ProgressTab({
  save,
  progress,
  now,
  onWords,
  onChanged,
}: {
  save: DutchSave | null;
  progress: ProgressMap;
  now: number;
  onWords: (title: string, pool: PoolItem[]) => void;
  onChanged: () => void;
}) {
  const { t, pick, lang } = useUi();
  const allIds = ALL_TERMS.map((x) => termId(x.unitId, x.term.nl));
  const overall = statsFor(allIds, progress, now);
  const acc = accuracy(progress);
  const streak = currentStreak(save, now);
  const series = activitySeries(save, now, 14);
  const strength = strengthBuckets(allIds, progress);
  const weak = weakest(ALL_TERMS, progress, 8);

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

  return (
    <div className="dk-page">
      <div className="dk-kpis">
        <Kpi label={t("prog.seen")} value={overall.seen} sub={t("prog.of", { n: TOTAL_TERMS })} />
        <Kpi label={t("prog.known")} value={overall.mastered} sub={t("prog.of", { n: TOTAL_TERMS })} />
        <Kpi
          label={t("prog.accuracy")}
          value={acc.pct === null ? "–" : `${acc.pct}%`}
          sub={t("prog.accuracy.sub", { n: acc.answers })}
        />
        <Kpi label={t("prog.streak")} value={streak} sub={t("prog.streak.sub", { goal: DAILY_GOAL })} />
        <Kpi label={t("prog.xp")} value={save?.xp ?? 0} sub={t("prog.lessons.sub", { n: save?.lessons ?? 0 })} />
      </div>

      <div className="dk-panels">
        <section className="dk-panel wide">
          <ActivityChart series={series} lang={lang} />
        </section>

        <section className="dk-panel">
          <h2>{t("prog.memory")}</h2>
          <p className="dk-panel-sub">{t("prog.memory.sub")}</p>
          <MemoryBar strength={strength} total={allIds.length} />
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

        <section className="dk-panel wide">
          <div className="dk-panel-head">
            <div>
              <h2>{t("prog.weak")}</h2>
              <p className="dk-panel-sub">{t("prog.weak.sub")}</p>
            </div>
            {weak.length > 0 && (
              <button className="dk-btn primary sm" onClick={() => onWords(t("prog.weak.title"), weak)}>
                <IconTarget size={15} /> {t("prog.weak.practise")}
              </button>
            )}
          </div>
          {weak.length === 0 ? (
            <p className="dk-muted">{t("prog.weak.none")}</p>
          ) : (
            <ul className="dk-weak">
              {weak.map((w) => (
                <li key={`${w.unitId}:${w.term.nl}`}>
                  <span className="nl" lang="nl">
                    {w.term.nl}
                  </span>
                  <span className="en">{w.term.en}</span>
                  <span className="score">{t("prog.weak.score", { ok: w.correct, n: w.seen })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dk-panel wide">
          <BackupPanel onChanged={onChanged} />
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="dk-kpi">
      <span className="label">{label}</span>
      <b className="value">{value}</b>
      <span className="sub">{sub}</span>
    </div>
  );
}

/* --------------------------------------------------------------- activity */

/** Round the axis top up to a clean number that leaves headroom above the goal. */
function axisTop(max: number): number {
  const step = max <= 200 ? 50 : max <= 500 ? 100 : 250;
  return Math.max(step * 2, Math.ceil(max / step) * step);
}

function ActivityChart({ series, lang }: { series: ActivityDay[]; lang: string }) {
  const { t } = useUi();
  const [active, setActive] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);

  const max = Math.max(DAILY_GOAL, ...series.map((d) => d.xp));
  const top = axisTop(max);
  const ticks = [top, top / 2, 0];
  const empty = series.every((d) => d.xp === 0);
  const fmt = (day: string) =>
    new Date(`${day}T12:00:00`).toLocaleDateString(lang === "nl" ? "nl-BE" : "en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  const hovered = active === null ? null : series[active];

  return (
    <>
      <div className="dk-panel-head">
        <div>
          <h2>{t("prog.activity")}</h2>
          <p className="dk-panel-sub">{t("prog.activity.sub")}</p>
        </div>
        <button className="dk-btn ghost sm" onClick={() => setAsTable(!asTable)}>
          {asTable ? t("prog.chart") : t("prog.table")}
        </button>
      </div>

      {asTable ? (
        <table className="dk-table">
          <thead>
            <tr>
              <th>{t("prog.col.day")}</th>
              <th>{t("prog.col.xp")}</th>
              <th>{t("prog.col.answers")}</th>
              <th>{t("prog.col.correct")}</th>
            </tr>
          </thead>
          <tbody>
            {[...series].reverse().map((d) => (
              <tr key={d.day}>
                <td>{fmt(d.day)}</td>
                <td>{d.xp}</td>
                <td>{d.n}</td>
                <td>{d.ok}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="dk-chart" onMouseLeave={() => setActive(null)}>
          <div className="dk-chart-y" aria-hidden>
            {ticks.map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
          <div className="dk-chart-plot">
            {ticks.map((v) => (
              <span key={v} className="grid" style={{ bottom: `${(v / top) * 100}%` }} aria-hidden />
            ))}
            <span className="goal" style={{ bottom: `${(DAILY_GOAL / top) * 100}%` }} aria-hidden />

            <div className="dk-chart-cols">
              {series.map((d, i) => (
                <div
                  key={d.day}
                  className={`col ${active === i ? "on" : ""}`}
                  tabIndex={0}
                  role="img"
                  aria-label={`${fmt(d.day)}: ${t("prog.activity.tip", { xp: d.xp, n: d.n, ok: d.ok })}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                >
                  {d.xp > 0 && (
                    <span className="bar" style={{ height: `${(d.xp / top) * 100}%` }}>
                      {d.isToday && <em>{d.xp}</em>}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {hovered && active !== null && (
              <div
                className="dk-tip"
                style={{
                  left: `${((active + 0.5) / series.length) * 100}%`,
                  bottom: `calc(${(hovered.xp / top) * 100}% + 10px)`,
                  transform: `translateX(${active < 2 ? "-20%" : active > series.length - 3 ? "-80%" : "-50%"})`,
                }}
                role="status"
              >
                <b>{hovered.xp} XP</b>
                <span>{fmt(hovered.day)}</span>
                <span>
                  {hovered.n} · {hovered.ok} ✓
                </span>
              </div>
            )}
          </div>
          <div className="dk-chart-x" aria-hidden>
            {series.map((d) => (
              <span key={d.day} className={d.isToday ? "today" : ""}>
                {d.label}
              </span>
            ))}
          </div>
        </div>
      )}
      {!asTable && (
        <p className="dk-chart-key">
          <span className="line" aria-hidden /> {t("prog.activity.goal")} · {DAILY_GOAL} XP
        </p>
      )}
      {empty && !asTable && <p className="dk-muted dk-chart-empty">{t("prog.activity.none")}</p>}
    </>
  );
}

/* ----------------------------------------------------------------- memory */

function MemoryBar({
  strength,
  total,
}: {
  strength: { unseen: number; learning: number; almost: number; known: number };
  total: number;
}) {
  const { t } = useUi();
  // Ordered from strongest to weakest, so the bar reads like a progress bar.
  const parts = [
    { key: "known", label: t("prog.mem.known"), n: strength.known },
    { key: "almost", label: t("prog.mem.almost"), n: strength.almost },
    { key: "learning", label: t("prog.mem.learning"), n: strength.learning },
    { key: "unseen", label: t("prog.mem.unseen"), n: strength.unseen },
  ];
  const share = (n: number) => (total ? (n / total) * 100 : 0);

  return (
    <>
      <div className="dk-segbar" role="img" aria-label={parts.map((p) => `${p.label}: ${p.n}`).join(", ")}>
        {parts
          .filter((p) => p.n > 0)
          .map((p) => (
            <span
              key={p.key}
              className={`seg ${p.key}`}
              style={{ flexGrow: p.n }}
              title={`${p.label}: ${p.n} (${Math.round(share(p.n))}%)`}
            >
              {share(p.n) >= 9 && <i>{Math.round(share(p.n))}%</i>}
            </span>
          ))}
      </div>
      <ul className="dk-legend">
        {parts.map((p) => (
          <li key={p.key}>
            <span className={`swatch ${p.key}`} aria-hidden />
            <span className="name">{p.label}</span>
            <span className="fig">{p.n}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ----------------------------------------------------------------- backup */

function BackupPanel({ onChanged }: { onChanged: () => void }) {
  const { t } = useUi();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [code, setCode] = useState("");
  const [shown, setShown] = useState("");

  const ok = (text: string) => setMessage({ kind: "ok", text });
  const err = (text: string) => setMessage({ kind: "err", text });

  function applyImport(incoming: DutchSave) {
    const merged = mergeSaves(loadProgress(), incoming);
    saveProgress(merged);
    onChanged();
    ok(t("backup.done.import", { n: Object.keys(merged.terms).length }));
  }

  function download() {
    const blob = new Blob([exportSave(loadProgress())], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code-en-koffie-backup-${dayKey(Date.now())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    ok(t("backup.done.download"));
  }

  async function restore(file: File | undefined) {
    if (!file) return;
    try {
      applyImport(importSave(await file.text()));
    } catch {
      err(t("backup.err.invalid"));
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function copyCode() {
    const text = await encodeTransfer(loadProgress());
    setShown(text);
    try {
      await navigator.clipboard.writeText(text);
      ok(t("backup.done.copy"));
    } catch {
      err(t("backup.err.clipboard"));
    }
  }

  async function importCode() {
    try {
      applyImport(await decodeTransfer(code));
      setCode("");
    } catch {
      err(t("backup.err.invalid"));
    }
  }

  function reset() {
    if (!confirm(t("backup.reset.confirm"))) return;
    resetProgress();
    onChanged();
    setMessage(null);
  }

  return (
    <>
      <h2>{t("backup.title")}</h2>
      <p className="dk-panel-sub wide">{t("backup.body")}</p>

      <div className="dk-backup-actions">
        <button className="dk-btn" onClick={download}>
          <IconDownload size={16} /> {t("backup.download")}
        </button>
        <button className="dk-btn" onClick={() => fileRef.current?.click()}>
          <IconUpload size={16} /> {t("backup.restore")}
        </button>
        <button className="dk-btn" onClick={copyCode}>
          <IconCopy size={16} /> {t("backup.copy")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => restore(e.target.files?.[0])}
          data-testid="backup-file"
        />
      </div>

      {shown && (
        <textarea className="dk-code-box" readOnly value={shown} rows={3} onFocus={(e) => e.currentTarget.select()} />
      )}

      <p className="dk-panel-sub wide">{t("backup.transfer.help")}</p>
      <div className="dk-backup-paste">
        <textarea
          className="dk-code-box"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("backup.paste.placeholder")}
          aria-label={t("backup.paste.label")}
          rows={2}
          spellCheck={false}
        />
        <button className="dk-btn" onClick={importCode} disabled={code.trim().length === 0}>
          {t("backup.paste.go")}
        </button>
      </div>

      {message && (
        <p className={`dk-msg ${message.kind}`} role="status">
          {message.text}
        </p>
      )}

      <div className="dk-backup-foot">
        <span>{t("backup.privacy")}</span>
        <button className="dk-link danger" onClick={reset}>
          {t("backup.reset")}
        </button>
      </div>
    </>
  );
}
