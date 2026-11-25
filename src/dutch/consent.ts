import { CONSENT_VERSION } from "./legal";

/** Whether the person has seen and acknowledged the notice, and which version. */
const KEY = "dutch-consent-v1";

export interface Consent {
  version: number;
  at: string;
}

export function loadConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Partial<Consent>;
    return typeof c.version === "number" ? { version: c.version, at: c.at ?? "" } : null;
  } catch {
    return null;
  }
}

/** True once the person has acknowledged the current version of the notice. */
export function hasConsented(now = Date.now()): boolean {
  const c = loadConsent();
  return !!c && c.version >= CONSENT_VERSION;
  void now;
}

export function recordConsent(now = Date.now()): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ version: CONSENT_VERSION, at: new Date(now).toISOString() }));
  } catch {
    /* ignore */
  }
}
