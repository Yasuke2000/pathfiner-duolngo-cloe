"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Kpi } from "./charts";
import { useUi } from "./settings";
import { IconArrow, IconCopy, IconDownload, IconTarget, IconUpload } from "./icons";
import { decodeTransfer, encodeTransfer, exportSave, importSave, mergeSaves } from "@/dutch/backup";
import type { CodeQuestion } from "@/dutch/code";
import { questionsFor, weakConcepts } from "@/dutch/insights";
import type { PoolItem } from "@/dutch/lesson";
import { statsFor } from "@/dutch/path";
import {
  currentStreak,
  DAILY_GOAL,
  dayKey,
  loadProgress,
  resetProgress,
  saveProgress,
  type DutchSave,
} from "@/dutch/progress";
import { weakest } from "@/dutch/stats";
import type { ProgressMap } from "@/dutch/srs";
import { termId } from "@/dutch/types";
import { ALL_TERMS, TOTAL_TERMS } from "@/dutch/vocab";

/**
 * The learner's own progress page. Deliberately short: a few numbers and a list
 * of what to work on. The detailed analysis lives in the coach view, which
 * reads a report she chooses to send.
 */
export function ProgressTab({
  save,
  progress,
  now,
  onWords,
  onCode,
  onChanged,
}: {
  save: DutchSave | null;
  progress: ProgressMap;
  now: number;
  onWords: (title: string, pool: PoolItem[]) => void;
  onCode: (title: string, questions: CodeQuestion[]) => void;
  onChanged: () => void;
}) {
  const { t, pick } = useUi();
  const allIds = ALL_TERMS.map((x) => termId(x.unitId, x.term.nl));
  const overall = statsFor(allIds, progress, now);
  const streak = currentStreak(save, now);
  const weakWords = weakest(ALL_TERMS, progress, 8);
  const concepts = weakConcepts(progress).slice(0, 6);

  return (
    <div className="dk-page">
      <div className="dk-kpis three">
        <Kpi label={t("prog.seen")} value={overall.seen} sub={t("prog.of", { n: TOTAL_TERMS })} />
        <Kpi label={t("prog.known")} value={overall.mastered} sub={t("prog.of", { n: TOTAL_TERMS })} />
        <Kpi label={t("prog.streak")} value={streak} sub={t("prog.streak.sub", { goal: DAILY_GOAL })} />
      </div>

      <div className="dk-panels">
        <section className="dk-panel wide">
          <h2>{t("work.title")}</h2>
          <p className="dk-panel-sub wide">{t("work.sub")}</p>

          <div className="dk-work">
            <div>
              <h3>{t("work.concepts")}</h3>
              {concepts.length === 0 ? (
                <p className="dk-muted dk-work-none">{t("work.concepts.none")}</p>
              ) : (
                <ul className="dk-worklist">
                  {concepts.map((c) => {
                    const name = pick(c.concept.nl, c.concept.en);
                    return (
                      <li key={c.concept.id}>
                        <span className="name">{name}</span>
                        <span className="score">{t("work.score", { ok: c.correct, n: c.answers })}</span>
                        <button className="dk-btn sm" onClick={() => onCode(name, questionsFor(c.concept.id))}>
                          {t("btn.practise")}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <div className="dk-work-head">
                <h3>{t("work.words")}</h3>
                {weakWords.length > 0 && (
                  <button className="dk-btn primary sm" onClick={() => onWords(t("prog.weak.title"), weakWords)}>
                    <IconTarget size={15} /> {t("prog.weak.practise")}
                  </button>
                )}
              </div>
              {weakWords.length === 0 ? (
                <p className="dk-muted dk-work-none">{t("prog.weak.none")}</p>
              ) : (
                <ul className="dk-weak">
                  {weakWords.map((w) => (
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
            </div>
          </div>
        </section>

        <section className="dk-panel wide">
          <SharePanel onChanged={onChanged} />
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------- report, backup, transfer */

function SharePanel({ onChanged }: { onChanged: () => void }) {
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
      <div className="dk-panel-head">
        <h2>{t("share.title")}</h2>
        <Link className="dk-btn ghost sm" href="/dutch/coach">
          {t("share.coach")} <IconArrow size={15} />
        </Link>
      </div>
      <p className="dk-panel-sub wide">{t("share.body")}</p>

      <div className="dk-backup-actions">
        <button className="dk-btn" onClick={download}>
          <IconDownload size={16} /> {t("backup.download")}
        </button>
        <button className="dk-btn" onClick={copyCode}>
          <IconCopy size={16} /> {t("backup.copy")}
        </button>
        <button className="dk-btn" onClick={() => fileRef.current?.click()}>
          <IconUpload size={16} /> {t("backup.restore")}
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
        <span>
          {t("backup.privacy")}{" "}
          <Link className="dk-link" href="/dutch/legal">
            {t("consent.page")}
          </Link>
        </span>
        <button className="dk-link danger" onClick={reset}>
          {t("backup.reset")}
        </button>
      </div>
    </>
  );
}
