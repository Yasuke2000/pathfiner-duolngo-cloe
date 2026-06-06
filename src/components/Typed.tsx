"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A lightweight typewriter for story text. Types the paragraphs in sequence,
 * shows a blinking caret while running, and instantly completes when clicked.
 * Respects prefers-reduced-motion (renders everything at once).
 */
export function Typed({
  paragraphs,
  className = "prose",
  speed = 12,
}: {
  paragraphs: string[];
  className?: string;
  speed?: number;
}) {
  const text = paragraphs.join("\n\n");
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const at = useRef(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || text.length === 0) {
      setCount(text.length);
      setDone(true);
      return;
    }
    at.current = 0;
    setCount(0);
    setDone(false);
    const id = setInterval(() => {
      at.current += 2;
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

  const paras = text.slice(0, count).split("\n\n");

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
      {paras.map((p, i) => (
        <p key={i} className={className}>
          {p}
          {!done && i === paras.length - 1 && <span className="caret" aria-hidden />}
        </p>
      ))}
    </div>
  );
}
