"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { judge, type Verdict } from "@/dutch/grade";
import { buildLesson, expectedOf, type Exercise, type PoolItem } from "@/dutch/lesson";
import { loadProgress, recordAnswer, saveProgress, type DutchSave } from "@/dutch/progress";
import { normalize } from "@/dutch/grade";
import { canSpeak, onVoicesReady, speakDutch } from "@/lib/speech";
import { sfx } from "@/lib/sound";

type Phase = "answer" | "checked" | "done";

const LESSON_SIZE = 12;

export function LessonScene({
  title,
  pool,
  onExit,
}: {
  title: string;
  pool: PoolItem[];
  onExit: () => void;
}) {
  const [save, setSave] = useState<DutchSave | null>(null);
  const [audio, setAudio] = useState(false);
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("answer");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  const [stats, setStats] = useState({ asked: 0, right: 0, xp: 0 });
  const retried = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Build the lesson once we know what this learner already knows.
  useEffect(() => {
    const loaded = loadProgress();
    setSave(loaded);
    const withAudio = canSpeak();
    setAudio(withAudio);
    setQueue(
      buildLesson(pool, {
        size: LESSON_SIZE,
        seed: Math.floor(Math.random() * 1e9),
        progress: loaded.terms,
        audio: withAudio,
      }),
    );
  }, [pool]);

  // Some browsers load voices late; re-check so the listen exercises light up.
  useEffect(() => onVoicesReady(() => setAudio(canSpeak())), []);

  const ex = queue[idx];

  useEffect(() => {
    if (phase === "answer" && ex && (ex.kind === "type" || ex.kind === "listen")) {
      inputRef.current?.focus();
    }
    if (phase === "answer" && ex?.kind === "listen") speakDutch(ex.spoken);
  }, [phase, ex]);

  const answerOf = useCallback(
    (e: Exercise): string => {
      if (e.kind === "choose") return picked ?? "";
      if (e.kind === "article") return picked ?? "";
      if (e.kind === "build") return built.map((i) => e.words[i]).join(" ");
      return typed;
    },
    [picked, built, typed],
  );

  const ready = ex ? answerOf(ex).trim().length > 0 : false;

  function check() {
    if (!ex || !ready || phase !== "answer") return;
    const given = answerOf(ex);
    let v: Verdict;
    if (ex.kind === "choose") v = given === ex.answer ? "correct" : "wrong";
    else if (ex.kind === "article") v = given === ex.answer ? "correct" : "wrong";
    else if (ex.kind === "build") v = normalize(given) === normalize(ex.answer) ? "correct" : "wrong";
    else v = judge(given, ex.accepted).verdict;

    const ok = v !== "wrong";
    setVerdict(v);
    setPhase("checked");
    if (ok) sfx.level();
    else sfx.miss();

    setSave((prev) => {
      const base = prev ?? loadProgress();
      const next = recordAnswer(base, ex.id, ok);
      saveProgress(next);
      return next;
    });
    setStats((s) => ({ asked: s.asked + 1, right: s.right + (ok ? 1 : 0), xp: s.xp + (ok ? 10 : 2) }));

    // Anything missed comes back once more before the lesson ends.
    if (!ok && !retried.current.has(ex.id)) {
      retried.current.add(ex.id);
      setQueue((q) => [...q, ex]);
    }
  }

  function next() {
    setVerdict(null);
    setTyped("");
    setPicked(null);
    setBuilt([]);
    if (idx + 1 >= queue.length) {
      setPhase("done");
      sfx.victory();
      setSave((prev) => {
        const base = prev ?? loadProgress();
        const next = { ...base, lessons: base.lessons + 1 };
        saveProgress(next);
        return next;
      });
    } else {
      setIdx(idx + 1);
      setPhase("answer");
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (phase === "answer") check();
    else if (phase === "checked") next();
  }

  if (!queue.length) {
    return (
      <div className="card">
        <p className="muted">Les wordt klaargezet…</p>
      </div>
    );
  }

  if (phase === "done") {
    const pct = stats.asked ? Math.round((stats.right / stats.asked) * 100) : 0;
    return (
      <div className="card d-done">
        <span className="speaker">Les afgerond</span>
        <h2>{pct}% juist</h2>
        <p className="prose">
          {stats.right} van {stats.asked} goed · <b>+{stats.xp} XP</b>
        </p>
        <p className="muted">
          {pct >= 80
            ? "Goed bezig! De woorden die je miste komen vanzelf terug."
            : "Niet erg — de woorden die je miste komen binnenkort opnieuw aan bod."}
        </p>
        <div className="actions">
          <button className="btn primary" onClick={onExit}>
            Terug naar de lijst
          </button>
        </div>
      </div>
    );
  }

  const total = queue.length;
  const note = phase === "checked" ? ex.term.note : undefined;

  return (
    <div className="card d-lesson" onKeyDown={onKeyDown}>
      <div className="d-head">
        <button className="text-btn" onClick={onExit}>
          ✕ Stoppen
        </button>
        <div className="d-progress" aria-label={`Vraag ${idx + 1} van ${total}`}>
          <span style={{ width: `${(idx / total) * 100}%` }} />
        </div>
        <span className="muted d-count">
          {idx + 1}/{total}
        </span>
      </div>

      <span className="speaker">{title}</span>
      <Prompt ex={ex} audio={audio} />

      {ex.kind === "choose" && (
        <div className="d-options">
          {ex.options.map((o) => (
            <button
              key={o}
              className={`d-option ${picked === o ? "sel" : ""} ${
                phase === "checked" && o === ex.answer ? "right" : ""
              } ${phase === "checked" && picked === o && o !== ex.answer ? "wrong" : ""}`}
              onClick={() => phase === "answer" && setPicked(o)}
              disabled={phase === "checked"}
            >
              {o}
            </button>
          ))}
        </div>
      )}

      {ex.kind === "article" && (
        <div className="d-options two">
          {(["de", "het"] as const).map((a) => (
            <button
              key={a}
              className={`d-option big ${picked === a ? "sel" : ""} ${
                phase === "checked" && a === ex.answer ? "right" : ""
              } ${phase === "checked" && picked === a && a !== ex.answer ? "wrong" : ""}`}
              onClick={() => phase === "answer" && setPicked(a)}
              disabled={phase === "checked"}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {ex.kind === "build" && (
        <>
          <div className="d-build-line">
            {built.length === 0 && <span className="muted">Tik de woorden in de juiste volgorde aan…</span>}
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
        </>
      )}

      {(ex.kind === "type" || ex.kind === "listen") && (
        <input
          ref={inputRef}
          className="text-input d-input"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={ex.kind === "listen" ? "Typ wat je hoort…" : "Typ je antwoord…"}
          disabled={phase === "checked"}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          lang={ex.kind === "listen" || ex.dir === "en>nl" ? "nl" : "en"}
        />
      )}

      {phase === "checked" && (
        <div className={`d-feedback ${verdict}`}>
          <b>
            {verdict === "correct" && "Juist!"}
            {verdict === "typo" && "Juist — let op de spelling:"}
            {verdict === "wrong" && "Niet juist — het juiste antwoord is:"}
          </b>{" "}
          <span className="d-answer">{expectedOf(ex)}</span>
          {note && <p className="d-note">💡 {note}</p>}
          {ex.kind !== "listen" && ex.term.example && (
            <p className="d-example">
              <i>{ex.term.example.nl}</i> — {ex.term.example.en}
            </p>
          )}
        </div>
      )}

      <div className="actions">
        {phase === "answer" ? (
          <button className="btn primary" onClick={check} disabled={!ready}>
            Controleren
          </button>
        ) : (
          <button className="btn primary" onClick={next} autoFocus>
            {idx + 1 >= queue.length ? "Afronden" : "Volgende →"}
          </button>
        )}
      </div>
    </div>
  );
}

function Prompt({ ex, audio }: { ex: Exercise; audio: boolean }) {
  if (ex.kind === "listen") {
    return (
      <div className="d-prompt">
        <button className="d-speak" onClick={() => speakDutch(ex.spoken)} aria-label="Speel het woord opnieuw af">
          🔊
        </button>
        <span className="muted">Luister en typ het in het Nederlands.</span>
      </div>
    );
  }
  if (ex.kind === "article") {
    return (
      <div className="d-prompt">
        <h2 className="d-word">… {ex.noun}</h2>
        <span className="muted">de of het?</span>
      </div>
    );
  }
  if (ex.kind === "build") {
    return (
      <div className="d-prompt">
        <span className="muted">Zeg dit in het Nederlands:</span>
        <h2 className="d-word">{ex.prompt}</h2>
      </div>
    );
  }
  const dutchSide = ex.dir === "nl>en";
  return (
    <div className="d-prompt">
      <span className="muted">
        {dutchSide ? "Wat betekent dit?" : "Hoe zeg je dit in het Nederlands?"}
      </span>
      <h2 className="d-word">
        {ex.prompt}
        {dutchSide && audio && (
          <button className="d-speak small" onClick={() => speakDutch(ex.prompt)} aria-label="Spreek uit">
            🔊
          </button>
        )}
      </h2>
    </div>
  );
}
