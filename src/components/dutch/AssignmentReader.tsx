"use client";

import { useMemo, useState } from "react";
import { IconArrow, IconSpeaker } from "./icons";
import { useUi } from "./settings";
import { annotate, assignmentGlossary, type Assignment, type GlossEntry } from "@/dutch/assignments";
import { CODE_UNITS, type CodeQuestion } from "@/dutch/code";
import type { PoolItem } from "@/dutch/lesson";
import { UNIT_BY_ID } from "@/dutch/vocab";
import { speakDutch } from "@/lib/speech";

/**
 * A real assignment, readable. The Dutch text is the main thing; every word
 * from the assignment vocabulary is underlined and explains itself when tapped,
 * and the English version of a paragraph is one tap away — after she has tried.
 */
export function AssignmentReader({
  assignment,
  audio,
  onBack,
  onWords,
  onCode,
}: {
  assignment: Assignment;
  audio: boolean;
  onBack: () => void;
  onWords: (title: string, pool: PoolItem[]) => void;
  onCode: (title: string, questions: CodeQuestion[]) => void;
}) {
  const { t, pick } = useUi();
  const glossary = useMemo(() => assignmentGlossary(), []);
  const [showEn, setShowEn] = useState(false);
  /** Which word is open: "<section>-<block>-<piece>". */
  const [active, setActive] = useState<string | null>(null);

  const words = UNIT_BY_ID.get(assignment.wordsUnit);
  const sentences = UNIT_BY_ID.get(assignment.sentencesUnit);
  const questions = CODE_UNITS.find((u) => u.id === assignment.questionsUnit);
  const poolOf = (unitId: string): PoolItem[] =>
    (UNIT_BY_ID.get(unitId)?.terms ?? []).map((term) => ({ unitId, term }));

  const practice = (
    <div className="dk-assign-actions">
      {questions && (
        <button className="dk-btn primary" onClick={() => onCode(pick(questions.title, questions.subtitle), questions.questions)}>
          {t("assign.questions", { n: questions.questions.length })} <IconArrow size={16} />
        </button>
      )}
      {words && (
        <button className="dk-btn" onClick={() => onWords(pick(words.title, words.subtitle), poolOf(words.id))}>
          {t("assign.words", { n: words.terms.length })}
        </button>
      )}
      {sentences && (
        <button className="dk-btn" onClick={() => onWords(pick(sentences.title, sentences.subtitle), poolOf(sentences.id))}>
          {t("assign.sentences", { n: sentences.terms.length })}
        </button>
      )}
    </div>
  );

  return (
    <div className="dk-page dk-assign">
      <button className="dk-link dk-assign-back" onClick={onBack}>
        ← {t("lesson.back")}
      </button>

      <header className="dk-assign-head">
        <p className="dk-eyebrow">{t("assign.eyebrow")}</p>
        <h2 lang="nl">{assignment.title}</h2>
        <p className="dk-muted">{assignment.about}</p>
        {practice}
      </header>

      <div className="dk-assign-bar">
        <p className="dk-muted">{t("assign.tip")}</p>
        <button className="dk-btn sm" onClick={() => setShowEn(!showEn)} aria-pressed={showEn}>
          {showEn ? t("assign.hideEn") : t("assign.showEn")}
        </button>
      </div>

      <article className="dk-assign-text">
        {assignment.sections.map((section, si) => (
          <section key={section.heading}>
            <h3 lang="nl">{section.heading}</h3>
            {showEn && <p className="dk-assign-en heading">{section.headingEn}</p>}
            {section.blocks.map((block, bi) => {
              const key = `${si}-${bi}`;
              const pieces = annotate(block.nl, glossary);
              const open = active?.startsWith(`${key}-`) ? pieces[Number(active.split("-")[2])]?.entry : undefined;
              return (
                <div key={key} className={`dk-assign-block ${block.bullet ? "bullet" : ""}`}>
                  <p lang="nl">
                    {pieces.map((piece, pi) =>
                      piece.entry ? (
                        <button
                          key={pi}
                          className={`dk-gloss ${active === `${key}-${pi}` ? "on" : ""}`}
                          onClick={() => setActive(active === `${key}-${pi}` ? null : `${key}-${pi}`)}
                          aria-expanded={active === `${key}-${pi}`}
                        >
                          {piece.text}
                        </button>
                      ) : (
                        <span key={pi}>{piece.text}</span>
                      ),
                    )}
                  </p>
                  {open && <GlossCard entry={open} audio={audio} />}
                  {showEn && <p className="dk-assign-en">{block.en}</p>}
                </div>
              );
            })}
          </section>
        ))}
      </article>

      <details className="dk-assign-summary">
        <summary>
          <span>
            <b>{t("assign.summary")}</b>
            <small>{t("assign.summary.sub")}</small>
          </span>
        </summary>
        <div className="dk-assign-classes">
          {assignment.summary.map((c) => (
            <section key={c.name}>
              <h4>{c.name}</h4>
              {c.fields.length > 0 && (
                <>
                  <p className="label">{t("assign.fields")}</p>
                  <ul>
                    {c.fields.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </>
              )}
              <p className="label">{t("assign.ctor")}</p>
              <p>{c.ctor}</p>
              <p className="label">{t("assign.methods")}</p>
              <ul>
                {c.methods.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              {c.watch && (
                <p className="d-note">
                  <b>{t("assign.watch")}:</b> {c.watch}
                </p>
              )}
            </section>
          ))}
        </div>
      </details>

      <div className="dk-assign-foot">
        <h3>{t("assign.practise")}</h3>
        {practice}
      </div>
    </div>
  );
}

function GlossCard({ entry, audio }: { entry: GlossEntry; audio: boolean }) {
  const { t } = useUi();
  return (
    <div className="dk-gloss-card" role="note">
      <div className="dk-term-row">
        <span className="dk-term-nl" lang="nl">
          {entry.nl}
          {audio && (
            <button className="d-speak tiny" onClick={() => speakDutch(entry.nl)} aria-label={t("speak", { word: entry.nl })}>
              <IconSpeaker size={13} />
            </button>
          )}
        </span>
        <span className="dk-term-en">{entry.en}</span>
      </div>
      {entry.def && <p className="d-def">{entry.def}</p>}
      {entry.note && <p className="d-note">{entry.note}</p>}
    </div>
  );
}
