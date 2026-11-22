/**
 * Dutch text-to-speech using the browser's own voices — no audio files, no
 * network. Prefers a Flemish (nl-BE) voice over a Netherlands one, because the
 * accent she needs to understand is the one around her.
 */

function voices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  try {
    return window.speechSynthesis.getVoices();
  } catch {
    return [];
  }
}

export function canSpeak(): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  return voices().some((v) => v.lang?.toLowerCase().startsWith("nl"));
}

function dutchVoice(): SpeechSynthesisVoice | undefined {
  const all = voices();
  return (
    all.find((v) => v.lang?.toLowerCase() === "nl-be") ??
    all.find((v) => v.lang?.toLowerCase().startsWith("nl"))
  );
}

export function speakDutch(text: string, rate = 0.9): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = dutchVoice();
    if (v) u.voice = v;
    u.lang = v?.lang ?? "nl-BE";
    u.rate = rate;
    window.speechSynthesis.speak(u);
  } catch {
    /* speech is a bonus, never a requirement */
  }
}

/** Voices load asynchronously in some browsers; call back when they're ready. */
export function onVoicesReady(cb: () => void): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return () => {};
  const handler = () => cb();
  window.speechSynthesis.addEventListener?.("voiceschanged", handler);
  return () => window.speechSynthesis.removeEventListener?.("voiceschanged", handler);
}
