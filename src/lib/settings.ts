"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export type TextSpeed = "slow" | "normal" | "fast" | "instant";

export interface Settings {
  textSpeed: TextSpeed;
  reduceMotion: boolean;
  dyslexia: boolean;
  music: boolean;
}

const DEFAULTS: Settings = { textSpeed: "normal", reduceMotion: false, dyslexia: false, music: false };
const KEY = "settings-v1";

/** Milliseconds per character for the typewriter. instant = no animation. */
export const SPEED_MS: Record<TextSpeed, number> = { slow: 26, normal: 13, fast: 6, instant: 0 };

let state: Settings = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULTS;
}

function applyDom() {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.dataset.dyslexic = state.dyslexia ? "1" : "0";
  el.dataset.motion = state.reduceMotion ? "reduce" : "full";
}

function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    state = load();
    loaded = true;
    applyDom();
  }
}

export function getSettings(): Settings {
  ensureLoaded();
  return state;
}

export function setSettings(patch: Partial<Settings>) {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  applyDom();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  ensureLoaded();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings, () => DEFAULTS);
}

/** True if the user (or the OS) wants reduced motion. */
export function useReduceMotion(): boolean {
  const s = useSettings();
  const [media, setMedia] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMedia(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return s.reduceMotion || media;
}
