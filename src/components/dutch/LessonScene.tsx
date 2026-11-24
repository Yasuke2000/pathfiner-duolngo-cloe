"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { judge, normalize, type Verdict } from "@/dutch/grade";
import { wrapsOnPhone } from "@/dutch/code";
import { expectedOf, termOf, type Exercise } from "@/dutch/lesson";
import {
  DAILY_GOAL,
  loadProgress,
  recordAnswer,
  saveProgress,
  todayXp,
  type DutchSave,
} from "@/dutch/progress";
import type { ProgressMap } from "@/dutch/srs";
import type { UiKey } from "@/dutch/ui";
import { canSpeak, onVoicesReady, speakDutch } from "@/lib/speech";
import { sfx } from "@/lib/sound";
import { IconSpeaker } from "./icons";
import { useUi } from "./settings";

type Phase = "answer" | "checked" | "done";
type T = (key: UiKey, vars?: Record<string, string | number>) => string;

/** Builds the lesson once we know what this learner already knows. */
export type LessonBuilder = (progress: ProgressMap, audio: boolean) => Exercise[];

interface Miss {
  id: string;
  asked: string;
  answer: string;
}

/** A one-line description of what an exercise asked, for the end-of-lesson recap. */
function askedOf(ex: Exercise, t: T): string {
  switch (ex.kind) {
    case "choose":
    case "type":
    case "build":
      return ex.prompt;
    case "article":
      return t("asked.article", { noun: ex.noun });
    case "listen":
      return t("asked.listen");
    case "code":
      return ex.q.question;
  }
}

/** What was asked, without interface wording — this is what goes into the mistake log. */
function askedRaw(ex: Exercise): string {
  switch (ex.kind) {
    case "choose":
    case "type":
    case "build":
      return ex.prompt;
    case "article":
      return ex.noun;
    case "listen":
      return ex.spoken;
    case "code":
      return ex.q.question;
  }
}

export function LessonScene({
  title,
  build,
  onExit,
  onAgain,
}: {
  title: string;
  build: LessonBuilder;
  onExit: () => void;
  onAgain: () => void;
}) {
  const { t } = useUi();
  const [save, setSave] = useState<DutchSave | null>(null);
  const [audio, setAudio] = useState(false);
  const [queue, setQueue] = useState<Exercise[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("answer");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  const [stats, setStats] = useState({ asked: 0, right: 0, xp: 0 });
  const [misses, setMisses] = useState<Miss[]>([]);
  const retried = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loaded = loadProgress();
    setSave(loaded);
    const withAudio = canSpeak();
    setAudio(withAudio);
    setQueue(build(loaded.terms, withAudio));
    // Ask the browser not to evict this site's storage under disk pressure.
    void navigator.storage?.persist?.().catch(() => undefined);
  }, [build]);

  // Some browsers load voices late; re-check so the listen exercises light up.
  useEffect(() => onVoicesReady(() => setAudio(canSpeak())), []);

  const ex = queue?.[idx];

  useEffect(() => {
    if (phase !== "answer" || !ex) return;
    if (ex.kind === "type" || ex.kind === "listen") inputRef.current?.focus();
    else cardRef.current?.focus(); // so the number keys work straight away
    if (ex.kind === "listen") speakDutch(ex.spoken);
  }, [phase, ex]);

  const answerOf = useCallback(
    (e: Exercise): string => {
      if (e.kind === "choose" || e.kind === "article" || e.kind === "code") return picked ?? "";
      if (e.kind === "build") return built.map((i) => e.words[i]).join(" ");
      return typed;
    },
    [picked, built, typed],
  );

  const ready = ex ? answerOf(ex).trim().length > 0 : false;

  /** `given` is what she answered; empty when she chose "I don't know". */
  function settle(v: Verdict, given: string) {
    if (!ex) return;
    const ok = v !== "wrong";
    setVerdict(v);
    setPhase("checked");
    if (ok) sfx.level();
    else sfx.miss();

    setSave((prev) => {
      const updated = recordAnswer(prev ?? loadProgress(), ex.id, ok, Date.now(), {
        kind: ex.kind,
        asked: askedRaw(ex),
        given,
        expected: expectedOf(ex),
      });
      saveProgress(updated);
      return updated;
    });
    setStats((s) => ({ asked: s.asked + 1, right: s.right + (ok ? 1 : 0), xp: s.xp + (ok ? 10 : 2) }));

    if (!ok) {
      setMisses((m) =>
        m.some((x) => x.id === ex.id) ? m : [...m, { id: ex.id, asked: askedOf(ex, t), answer: expectedOf(ex) }],
      );
      // Anything missed comes back once more before the lesson ends.
      if (!retried.current.has(ex.id)) {
        retried.current.add(ex.id);
        setQueue((q) => (q ? [...q, ex] : q));
      }
    }
  }

  function check() {
    if (!ex || !ready || phase !== "answer") return;
    const given = answerOf(ex);
    let v: Verdict;
    if (ex.kind === "choose") v = given === ex.answer ? "correct" : "wrong";
    else if (ex.kind === "article") v = given === ex.answer ? "correct" : "wrong";
    else if (ex.kind === "code") v = given === ex.q.answer ? "correct" : "wrong";
    else if (ex.kind === "build") v = normalize(given) === normalize(ex.answer) ? "correct" : "wrong";
    else v = judge(given, ex.accepted).verdict;
    settle(v, given);
  }

  function next() {
    if (!queue) return;
    setVerdict(null);
    setTyped("");
    setPicked(null);
    setBuilt([]);
    if (idx + 1 >= queue.length) {
      setPhase("done");
      sfx.victory();
      setSave((prev) => {
        const base = prev ?? loadProgress();
        const updated = { ...base, lessons: base.lessons + 1 };
        saveProgress(updated);
        return updated;
      });
    } else {
      setIdx(idx + 1);
      setPhase("answer");
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!ex) return;
    if (e.key === "Enter") {
      e.preventDefault();
      if (phase === "answer") check();
      else if (phase === "checked") next();
      return;
    }
    // 1–4 pick an option, unless the learner is typing an answer.
    if (phase !== "answer" || (e.target as HTMLElement).tagName === "INPUT") return;
    const n = Number(e.key);
    if (!Number.isInteger(n) || n < 1) return;
    if (ex.kind === "choose" || ex.kind === "code") {
      if (ex.options[n - 1]) setPicked(ex.options[n - 1]);
    } else if (ex.kind === "article" && n <= 2) {
      setPicked(n === 1 ? "de" : "het");
    }
  }

  if (queue === null) {
    return (
      <div className="dk-card d-lesson">
        <p className="dk-muted">{t("lesson.loading")}</p>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="dk-card d-done">
        <h2>{t("lesson.empty.title")}</h2>
        <p className="dk-muted">{t("lesson.empty.body")}</p>
        <div className="d-actions">
          <button className="dk-btn primary" onClick={onExit}>
            {t("lesson.back")}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const pct = stats.asked ? Math.round((stats.right / stats.asked) * 100) : 0;
    const goalPct = Math.min(100, Math.round((todayXp(save) / DAILY_GOAL) * 100));
    return (
      <div className="dk-card d-done">
        <p className="dk-eyebrow">
          {t("lesson.done")} · {title}
        </p>
        <h2>{t("lesson.pct", { n: pct })}</h2>
        <div className="d-done-stats">
          <div>
            <b>
              {stats.right}/{stats.asked}
            </b>
            <span>{t("lesson.stat.right")}</span>
          </div>
          <div>
            <b>+{stats.xp}</b>
            <span>{t("lesson.stat.xp")}</span>
          </div>
          <div>
            <b>{goalPct}%</b>
            <span>{t("lesson.stat.goal")}</span>
          </div>
        </div>

        {misses.length > 0 ? (
          <div className="d-recap">
            <h3>{t("lesson.recap")}</h3>
            <p className="dk-muted">{t("lesson.recap.sub")}</p>
            <ul>
              {misses.map((m) => (
                <li key={m.id}>
                  <span className="d-recap-q">{m.asked}</span>
                  <span className="d-recap-a">{m.answer}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="dk-muted">{t("lesson.perfect")}</p>
        )}

        <div className="d-actions">
          <button className="dk-btn" onClick={onExit}>
            {t("lesson.back")}
          </button>
          <button className="dk-btn primary" onClick={onAgain} autoFocus>
            {t("lesson.again")}
          </button>
        </div>
      </div>
    );
  }

  if (!ex) return null;

  const total = queue.length;
  const term = termOf(ex);
  const options = ex.kind === "choose" || ex.kind === "code" ? ex.options : null;
  const correctOption = ex.kind === "choose" ? ex.answer : ex.kind === "code" ? ex.q.answer : null;
  const answerLang = ex.kind === "choose" || ex.kind === "type" ? (ex.dir === "en>nl" ? "nl" : "en") : "nl";

  return (
    <div className="dk-card d-lesson" onKeyDown={onKeyDown} ref={cardRef} tabIndex={-1}>
      <div className="d-head">
        <button className="dk-link" onClick={onExit} aria-label={t("lesson.stop")}>
          ✕
        </button>
        <div
          className="d-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={idx}
          aria-label={t("lesson.progress", { a: idx + 1, b: total })}
        >
          <span style={{ width: `${(idx / total) * 100}%` }} />
        </div>
        <span className="d-count">
          {idx + 1}/{total}
        </span>
      </div>

      <p className="dk-eyebrow">
        {title} · {t(ex.kind === "code" && ex.q.lang === "opgave" ? "kind.task" : (`kind.${ex.kind}` as UiKey))}
      </p>
      <Prompt ex={ex} audio={audio} t={t} />

      {options && (
        <div
          className={`d-options ${ex.kind === "code" ? "stack" : ""} ${ex.kind === "code" && ex.q.codeOptions ? "mono" : ""}`}
          lang={ex.kind === "code" ? "nl" : answerLang}
        >
          {options.map((o, i) => (
            <button
              key={o}
              className={`d-option ${picked === o ? "sel" : ""} ${
                phase === "checked" && o === correctOption ? "right" : ""
              } ${phase === "checked" && picked === o && o !== correctOption ? "wrong" : ""}`}
              onClick={() => phase === "answer" && setPicked(o)}
              disabled={phase === "checked"}
              aria-pressed={picked === o}
            >
              <kbd aria-hidden>{i + 1}</kbd>
              <span>{o}</span>
            </button>
          ))}
        </div>
      )}

      {ex.kind === "article" && (
        <div className="d-options two" lang="nl">
          {(["de", "het"] as const).map((a, i) => (
            <button
              key={a}
              className={`d-option big ${picked === a ? "sel" : ""} ${
                phase === "checked" && a === ex.answer ? "right" : ""
              } ${phase === "checked" && picked === a && a !== ex.answer ? "wrong" : ""}`}
              onClick={() => phase === "answer" && setPicked(a)}
              disabled={phase === "checked"}
              aria-pressed={picked === a}
            >
              <kbd aria-hidden>{i + 1}</kbd>
              <span>{a}</span>
            </button>
          ))}
        </div>
      )}

      {ex.kind === "build" && (
        <div lang="nl">
          <div className="d-build-line">
            {built.length === 0 && <span className="dk-muted">{t("prompt.buildHint")}</span>}
            {built.map((wi, pos) => (
              <button
                key={`${wi}-${pos}`}
                className="d-chip placed"
                onClick={() => phase === "answer" && setBuilt(built.filter((_, p) => p !== pos))}
                disabled={phase === "checked"}
              >
                {ex.words[wi]}
              </button>
            ))}
          </div>
          <div className="d-bank">
            {ex.words.map((w, i) =>
              built.includes(i) ? (
                <span key={i} className="d-chip used" aria-hidden>
                  {w}
                </span>
              ) : (
                <button
                  key={i}
                  className="d-chip"
                  onClick={() => phase === "answer" && setBuilt([...built, i])}
                  disabled={phase === "checked"}
                >
                  {w}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {(ex.kind === "type" || ex.kind === "listen") && (
        <>
          <input
            ref={inputRef}
            className="d-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={
              ex.kind === "listen"
                ? t("input.listen")
                : ex.dir === "en>nl"
                  ? t("input.toDutch")
                  : t("input.toEnglish")
            }
            aria-label={t("input.label")}
            disabled={phase === "checked"}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            lang={ex.kind === "listen" || ex.dir === "en>nl" ? "nl" : "en"}
          />
          <p className="d-hint">{t("input.hint")}</p>
        </>
      )}

      {phase === "checked" && (
        <div className={`d-feedback ${verdict}`} role="status">
          <p className="d-verdict">
            {verdict === "correct" && t("verdict.correct")}
            {verdict === "typo" && t("verdict.typo")}
            {verdict === "wrong" && t("verdict.wrong")}
          </p>
          {(verdict !== "correct" || ex.kind === "type" || ex.kind === "listen") && (
            <p className="d-answer">{expectedOf(ex)}</p>
          )}
          {ex.kind === "code" && (
            <>
              <p className="d-def" lang="nl">
                {ex.q.explain}
              </p>
              <p className="d-example">{ex.q.explainEn}</p>
            </>
          )}
          {term?.def && <p className="d-def">{term.def}</p>}
          {term?.note && <p className="d-note">{term.note}</p>}
          {ex.kind !== "listen" && term?.example && (
            <p className="d-example">
              <i lang="nl">{term.example.nl}</i> — {term.example.en}
            </p>
          )}
        </div>
      )}

      <div className="d-actions">
        {phase === "answer" ? (
          <>
            <button className="dk-btn ghost" onClick={() => settle("wrong", "")}>
              {t("btn.idk")}
            </button>
            <button className="dk-btn primary" onClick={check} disabled={!ready}>
              {t("btn.check")}
            </button>
          </>
        ) : (
          <button className="dk-btn primary" onClick={next} autoFocus>
            {idx + 1 >= queue.length ? t("btn.finish") : t("btn.next")}
          </button>
        )}
      </div>
    </div>
  );
}

function Prompt({ ex, audio, t }: { ex: Exercise; audio: boolean; t: T }) {
  if (ex.kind === "code") {
    return (
      <div className="d-prompt">
        <div className="d-codewrap">
          <span className="d-lang">{ex.q.lang}</span>
          <pre className={`d-code ${wrapsOnPhone(ex.q.lang) ? "wrap" : ""} ${ex.q.lang === "opgave" ? "prose" : ""}`}>
            <code>{ex.q.code}</code>
          </pre>
        </div>
        <h2 className="d-word d-q" lang="nl">
          {ex.q.question}
        </h2>
        <p className="d-gloss">{ex.q.questionEn}</p>
      </div>
    );
  }
  if (ex.kind === "listen") {
    return (
      <div className="d-prompt">
        <button className="d-speak" onClick={() => speakDutch(ex.spoken)} aria-label={t("prompt.replay")}>
          <IconSpeaker size={26} />
        </button>
        <p className="d-gloss">{t("prompt.listen")}</p>
      </div>
    );
  }
  if (ex.kind === "article") {
    return (
      <div className="d-prompt">
        <h2 className="d-word" lang="nl">
          … {ex.noun}
        </h2>
        <p className="d-gloss">
          {ex.term.en} — {t("prompt.article")}
        </p>
      </div>
    );
  }
  if (ex.kind === "build") {
    return (
      <div className="d-prompt">
        <p className="d-gloss">{t("prompt.build")}</p>
        <h2 className="d-word">{ex.prompt}</h2>
      </div>
    );
  }
  const dutchSide = ex.dir === "nl>en";
  return (
    <div className="d-prompt">
      <p className="d-gloss">{dutchSide ? t("prompt.meaning") : t("prompt.toDutch")}</p>
      <h2 className="d-word" lang={dutchSide ? "nl" : "en"}>
        {ex.prompt}
        {dutchSide && audio && (
          <button className="d-speak small" onClick={() => speakDutch(ex.prompt)} aria-label={t("speak", { word: ex.prompt })}>
            <IconSpeaker size={16} />
          </button>
        )}
      </h2>
    </div>
  );
}
