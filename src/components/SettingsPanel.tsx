"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { setSettings, useSettings, type TextSpeed } from "@/lib/settings";
import { isMuted, sfx, toggleMuted } from "@/lib/sound";
import { COMMUNITY_USE_NOTICE } from "@/lib/config";
import { SupportButton } from "./SupportButton";

const SPEEDS: { id: TextSpeed; label: string }[] = [
  { id: "slow", label: "Slow" },
  { id: "normal", label: "Normal" },
  { id: "fast", label: "Fast" },
  { id: "instant", label: "Instant" },
];

export function SettingsPanel({ onRestart }: { onRestart: () => void }) {
  const [open, setOpen] = useState(false);
  const s = useSettings();
  const [muted, setMuted] = useState(false);
  useEffect(() => setMuted(isMuted()), [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button className="mute-btn" aria-label="Settings" title="Settings" onClick={() => setOpen(true)}>
        ⚙
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div className="modal-scrim" onClick={() => setOpen(false)}>
          <div className="modal" role="dialog" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
            <h2>Settings</h2>

            <div className="setting">
              <span className="setting-label">Text speed</span>
              <div className="seg">
                {SPEEDS.map((sp) => (
                  <button
                    key={sp.id}
                    className={`seg-btn ${s.textSpeed === sp.id ? "on" : ""}`}
                    onClick={() => setSettings({ textSpeed: sp.id })}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            <Toggle
              label="Sound effects"
              on={!muted}
              onChange={() => {
                const nowMuted = toggleMuted();
                setMuted(nowMuted);
                if (!nowMuted) {
                  sfx.unlock();
                  sfx.click();
                }
              }}
            />

            <Toggle
              label="Ambient music"
              hint="A subtle background drone"
              on={s.music}
              onChange={() => {
                const on = !s.music;
                setSettings({ music: on });
                sfx.unlock();
                sfx.music(on);
              }}
            />

            <Toggle
              label="Reduce motion"
              hint="Snap animations & dice to their result"
              on={s.reduceMotion}
              onChange={() => setSettings({ reduceMotion: !s.reduceMotion })}
            />

            <Toggle
              label="Dyslexia-friendly text"
              hint="Highly legible font + extra spacing"
              on={s.dyslexia}
              onChange={() => setSettings({ dyslexia: !s.dyslexia })}
            />

            <div className="setting">
              <button
                className="btn"
                onClick={() => {
                  if (confirm("Restart the whole course from the beginning? Your progress will be cleared.")) {
                    onRestart();
                    setOpen(false);
                  }
                }}
              >
                Restart course <span className="hint">clears saved progress</span>
              </button>
            </div>

            <div className="setting about">
              <span className="setting-label">About</span>
            </div>
            <p className="about-notice">{COMMUNITY_USE_NOTICE}</p>
            <div style={{ marginTop: 10 }}>
              <SupportButton />
            </div>
            <p style={{ marginTop: 10 }}>
              <a className="text-btn" href="/gm">GM: decode a player&apos;s sealed origin →</a>
            </p>

            <div className="actions">
              <button className="btn primary" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onChange: () => void;
}) {
  return (
    <button className="setting toggle" role="switch" aria-checked={on} onClick={onChange}>
      <span className="setting-label">
        {label}
        {hint && <span className="hint">{hint}</span>}
      </span>
      <span className={`switch ${on ? "on" : ""}`}>
        <span className="knob" />
      </span>
    </button>
  );
}
