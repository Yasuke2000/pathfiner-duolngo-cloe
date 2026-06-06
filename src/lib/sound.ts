import type { Degree } from "@/engine/types";

/**
 * A tiny Web Audio sound engine. All sounds are synthesized at runtime (no
 * asset files), so the game stays fully local/offline. Honors a persisted mute
 * setting and only starts the AudioContext after a user gesture.
 */

let ctx: AudioContext | null = null;
let mutedCache: boolean | null = null;

function muted(): boolean {
  if (mutedCache === null) {
    try {
      mutedCache = localStorage.getItem("sfx-muted") === "1";
    } catch {
      mutedCache = false;
    }
  }
  return mutedCache;
}

export function isMuted(): boolean {
  return muted();
}

export function toggleMuted(): boolean {
  const m = !muted();
  mutedCache = m;
  try {
    localStorage.setItem("sfx-muted", m ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (m) stopMusic(); // muting silences the ambient pad too
  return m;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.18) {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  const t = a.currentTime + start;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.03);
}

function noiseBurst(start: number, dur: number, vol = 0.12, freq = 1500) {
  const a = ac();
  if (!a) return;
  const len = Math.max(1, Math.floor(a.sampleRate * dur));
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = 0.8;
  const g = a.createGain();
  g.gain.value = vol;
  const t = a.currentTime + start;
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
  src.stop(t + dur);
}

function arp(freqs: number[], step = 0.09, dur = 0.22, type: OscillatorType = "triangle", vol = 0.18) {
  freqs.forEach((f, i) => blip(f, i * step, dur, type, vol));
}

export const sfx = {
  /** Call from a user gesture (e.g. the Begin button) to unlock audio. */
  unlock() {
    ac();
  },
  click() {
    if (muted()) return;
    blip(520, 0, 0.06, "square", 0.06);
  },
  roll() {
    if (muted()) return;
    noiseBurst(0, 0.09, 0.11, 1800);
    noiseBurst(0.09, 0.08, 0.1, 1300);
    noiseBurst(0.18, 0.07, 0.09, 950);
    blip(880, 0.28, 0.05, "square", 0.07);
  },
  degree(d: Degree) {
    if (muted()) return;
    if (d === "critical-success") arp([523, 659, 784, 1046], 0.08, 0.26, "triangle", 0.2);
    else if (d === "success") arp([659, 880], 0.1, 0.2, "triangle", 0.18);
    else if (d === "failure") blip(208, 0, 0.26, "sine", 0.16);
    else {
      blip(170, 0, 0.18, "sawtooth", 0.16);
      blip(120, 0.12, 0.24, "sawtooth", 0.16);
    }
  },
  hit() {
    if (muted()) return;
    noiseBurst(0, 0.12, 0.16, 320);
    blip(110, 0, 0.12, "square", 0.16);
  },
  miss() {
    if (muted()) return;
    noiseBurst(0, 0.13, 0.06, 4200);
  },
  victory() {
    if (muted()) return;
    arp([523, 659, 784, 1046, 1318], 0.11, 0.35, "triangle", 0.2);
  },
  level() {
    if (muted()) return;
    arp([784, 988, 1318], 0.08, 0.3, "triangle", 0.2);
  },
  /** A soft page-turn whoosh between story beats. */
  page() {
    if (muted()) return;
    noiseBurst(0, 0.16, 0.035, 2600);
  },
  /** A descending sweep + shimmer for the black-hole finale. */
  portal() {
    if (muted()) return;
    const a = ac();
    if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    const t = a.currentTime;
    o.type = "sine";
    o.frequency.setValueAtTime(420, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 1.6);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + 1.8);
    noiseBurst(0.1, 1.3, 0.05, 500);
  },
  /** Start/stop a subtle ambient drone (opt-in via Settings). */
  music(on: boolean) {
    if (!on || muted()) {
      stopMusic();
      return;
    }
    if (musicGain) return; // already running
    const a = ac();
    if (!a) return;
    const g = a.createGain();
    g.gain.value = 0.0001;
    g.connect(a.destination);
    const filter = a.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 650;
    filter.connect(g);
    // A2 root with a fifth and an octave, very slightly detuned for warmth.
    [110, 110 * 1.5, 110 * 2].forEach((f, i) => {
      const o = a.createOscillator();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = f * (1 + i * 0.004);
      o.connect(filter);
      o.start();
      musicOscs.push(o);
    });
    // Slow "breathing" LFO on the master gain.
    const lfo = a.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = a.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    lfo.start();
    musicLfo = lfo;
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.linearRampToValueAtTime(0.05, a.currentTime + 3);
    musicGain = g;
  },
};

let musicGain: GainNode | null = null;
let musicLfo: OscillatorNode | null = null;
const musicOscs: OscillatorNode[] = [];

function stopMusic() {
  if (!musicGain || !ctx) return;
  const a = ctx;
  const t = a.currentTime;
  musicGain.gain.cancelScheduledValues(t);
  musicGain.gain.setValueAtTime(musicGain.gain.value, t);
  musicGain.gain.linearRampToValueAtTime(0.0001, t + 1);
  const oscs = [...musicOscs];
  const lfo = musicLfo;
  setTimeout(() => {
    oscs.forEach((o) => {
      try {
        o.stop();
      } catch {
        /* ignore */
      }
    });
    try {
      lfo?.stop();
    } catch {
      /* ignore */
    }
  }, 1100);
  musicOscs.length = 0;
  musicLfo = null;
  musicGain = null;
}
