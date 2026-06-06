"use client";

import { useEffect, useRef, useState } from "react";
import { SPEED_MS, useReduceMotion, useSettings } from "@/lib/settings";

/**
 * Typewriter for story text, informed by the research:
 * - honors a user speed setting (incl. "instant" = no animation) and reduced motion;
 * - the FIRST click instantly completes the current block;
 * - reveals by per-character opacity so the layout never reflows as it types;
 * - exposes the full text to screen readers (the animated layer is aria-hidden).
 */
export function Typed({ paragraphs, className = "prose" }: { paragraphs: string[]; className?: string }) {
  const settings = useSettings();
  const reduce = useReduceMotion();
  const text = paragraphs.join("\n\n");
  const speed = reduce ? 0 : SPEED_MS[settings.textSpeed];

  const [count, setCount] = useState(speed === 0 ? text.length : 0);
  const [done, setDone] = useState(speed === 0);
  const at = useRef(0);

  useEffect(() => {
    if (speed === 0 || text.length === 0) {
      setCount(text.length);
      setDone(true);
      return;
    }
    at.current = 0;
    setCount(0);
    setDone(false);
    const id = setInterval(() => {
      at.current += 1;
      if (at.current >= text.length) {
        setCount(text.length);
        setDone(true);
        clearInterval(id);
      } else {
        setCount(at.current);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  // Per-paragraph character offsets into the joined string (separators are 2 chars).
  let offset = 0;
  const blocks = paragraphs.map((p) => {
    const start = offset;
    offset += p.length + 2;
    return { p, start };
  });

  return (
    <div
      className={`typed ${done ? "done" : "typing"}`}
      onClick={() => {
        if (!done) {
          setCount(text.length);
          setDone(true);
        }
      }}
    >
      <div aria-hidden="true">
        {blocks.map(({ p, start }, pi) => {
          const lastVisible = !done && count > start && count <= start + p.length;
          return (
            <p className={className} key={pi}>
              {Array.from(p).map((ch, ci) => (
                <span key={ci} style={{ opacity: start + ci < count ? 1 : 0 }}>
                  {ch}
                </span>
              ))}
              {lastVisible && <span className="caret" />}
            </p>
          );
        })}
      </div>
      <div className="sr-only">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
