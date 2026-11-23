import { emptySave, LOG_LIMIT, type DayStat, type DutchSave, type KindStat, type Mistake } from "./progress";
import type { ProgressMap, TermState } from "./srs";

/**
 * Backup, restore and device-to-device transfer.
 *
 * Progress lives in the browser's local storage: private and instant, but tied
 * to one browser on one device. These functions turn it into a file (or a
 * pasteable code) and merge one back in — so clearing browser data or switching
 * from laptop to phone does not cost months of practice.
 */
export const BACKUP_FORMAT = "code-en-koffie.progress";
export const BACKUP_VERSION = 1;
const CODE_PREFIX = "CK1.";

interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  save: DutchSave;
}

export function exportSave(save: DutchSave, now = Date.now()): string {
  const file: BackupFile = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date(now).toISOString(),
    save,
  };
  return JSON.stringify(file);
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isDay = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Keep only well-formed data; anything unexpected is dropped rather than trusted. */
function sanitize(raw: unknown): DutchSave {
  if (!raw || typeof raw !== "object") throw new Error("not-a-backup");
  const r = raw as Record<string, unknown>;
  if (!r.terms || typeof r.terms !== "object") throw new Error("not-a-backup");

  const terms: ProgressMap = {};
  for (const [id, v] of Object.entries(r.terms as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const s = v as Record<string, unknown>;
    if (!isNum(s.box) || !isNum(s.due) || !isNum(s.seen) || !isNum(s.correct)) continue;
    terms[id] = {
      box: Math.min(5, Math.max(0, Math.round(s.box))),
      due: s.due,
      seen: Math.max(0, Math.round(s.seen)),
      correct: Math.max(0, Math.min(Math.round(s.seen), Math.round(s.correct))),
    };
  }

  const history: Record<string, DayStat> = {};
  if (r.history && typeof r.history === "object") {
    for (const [day, v] of Object.entries(r.history as Record<string, unknown>)) {
      if (!isDay(day) || !v || typeof v !== "object") continue;
      const d = v as Record<string, unknown>;
      if (isNum(d.xp) && isNum(d.n) && isNum(d.ok)) history[day] = { xp: d.xp, n: d.n, ok: d.ok };
    }
  }

  const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 400) : "");
  const log: Mistake[] = [];
  if (Array.isArray(r.log)) {
    for (const v of r.log) {
      if (!v || typeof v !== "object") continue;
      const m = v as Record<string, unknown>;
      if (!isNum(m.t) || typeof m.id !== "string") continue;
      log.push({ t: m.t, id: m.id, kind: str(m.kind), asked: str(m.asked), given: str(m.given), expected: str(m.expected) });
    }
  }

  const kinds: Record<string, KindStat> = {};
  if (r.kinds && typeof r.kinds === "object") {
    for (const [kind, v] of Object.entries(r.kinds as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const k = v as Record<string, unknown>;
      if (isNum(k.n) && isNum(k.ok)) kinds[kind] = { n: Math.max(0, k.n), ok: Math.max(0, Math.min(k.n, k.ok)) };
    }
  }

  return {
    ...emptySave(),
    terms,
    xp: isNum(r.xp) ? Math.max(0, r.xp) : 0,
    lessons: isNum(r.lessons) ? Math.max(0, r.lessons) : 0,
    day: isDay(r.day) ? r.day : undefined,
    dayXp: isNum(r.dayXp) ? r.dayXp : undefined,
    streak: isNum(r.streak) ? r.streak : undefined,
    goalDay: isDay(r.goalDay) ? r.goalDay : undefined,
    history,
    log: log.length ? log.sort((a, b) => a.t - b.t).slice(-LOG_LIMIT) : undefined,
    kinds: Object.keys(kinds).length ? kinds : undefined,
  };
}

/** Parse a backup file. Throws `Error("not-a-backup")` for anything else. */
export function importSave(text: string): DutchSave {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("not-a-backup");
  }
  const file = parsed as Partial<BackupFile>;
  if (!file || file.format !== BACKUP_FORMAT || !file.save) throw new Error("not-a-backup");
  return sanitize(file.save);
}

function betterTerm(a: TermState | undefined, b: TermState | undefined): TermState | undefined {
  if (!a) return b;
  if (!b) return a;
  // More practice wins; on a tie, the one scheduled further out (more recent).
  if (a.seen !== b.seen) return a.seen > b.seen ? a : b;
  return a.due >= b.due ? a : b;
}

/**
 * Combine two saves without losing anything from either: per word the copy with
 * more practice, per day the busier record. Importing the same backup twice
 * changes nothing.
 */
export function mergeSaves(local: DutchSave, incoming: DutchSave): DutchSave {
  const terms: ProgressMap = {};
  for (const id of new Set([...Object.keys(local.terms), ...Object.keys(incoming.terms)])) {
    const best = betterTerm(local.terms[id], incoming.terms[id]);
    if (best) terms[id] = best;
  }

  const history: Record<string, DayStat> = {};
  for (const day of new Set([...Object.keys(local.history ?? {}), ...Object.keys(incoming.history ?? {})])) {
    const a = local.history?.[day];
    const b = incoming.history?.[day];
    history[day] = !a ? b! : !b ? a : a.n >= b.n ? a : b;
  }

  const newer = (incoming.goalDay ?? "") > (local.goalDay ?? "") ? incoming : local;
  const latestDay = [local.day, incoming.day].filter(Boolean).sort().pop();
  const dayXpCandidates = [local, incoming].filter((s) => s.day === latestDay).map((s) => s.dayXp ?? 0);

  // Mistakes from both sides, without duplicates, oldest first.
  const seenLog = new Set<string>();
  const log: Mistake[] = [];
  for (const m of [...(local.log ?? []), ...(incoming.log ?? [])].sort((a, b) => a.t - b.t)) {
    const key = `${m.t}|${m.id}|${m.given}`;
    if (seenLog.has(key)) continue;
    seenLog.add(key);
    log.push(m);
  }

  const kinds: Record<string, KindStat> = {};
  for (const kind of new Set([...Object.keys(local.kinds ?? {}), ...Object.keys(incoming.kinds ?? {})])) {
    const a = local.kinds?.[kind];
    const b = incoming.kinds?.[kind];
    kinds[kind] = !a ? b! : !b ? a : a.n >= b.n ? a : b;
  }

  return {
    terms,
    xp: Math.max(local.xp, incoming.xp),
    lessons: Math.max(local.lessons, incoming.lessons),
    day: latestDay,
    dayXp: dayXpCandidates.length ? Math.max(...dayXpCandidates) : undefined,
    streak: newer.streak,
    goalDay: newer.goalDay,
    history,
    log: log.length ? log.slice(-LOG_LIMIT) : undefined,
    kinds: Object.keys(kinds).length ? kinds : undefined,
  };
}

/* ---- transfer code: the same backup, gzipped and base64url-encoded --------- */

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, transform: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(transform);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** A compact code that carries the whole save, for copy-paste between devices. */
export async function encodeTransfer(save: DutchSave, now = Date.now()): Promise<string> {
  const bytes = new TextEncoder().encode(exportSave(save, now));
  return CODE_PREFIX + toBase64Url(await pipe(bytes, new CompressionStream("gzip")));
}

export async function decodeTransfer(code: string): Promise<DutchSave> {
  const trimmed = code.trim();
  if (!trimmed.startsWith(CODE_PREFIX)) throw new Error("not-a-backup");
  try {
    const bytes = await pipe(fromBase64Url(trimmed.slice(CODE_PREFIX.length)), new DecompressionStream("gzip"));
    return importSave(new TextDecoder().decode(bytes));
  } catch {
    throw new Error("not-a-backup");
  }
}
