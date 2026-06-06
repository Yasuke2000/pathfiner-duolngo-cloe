import { resolve, type BuildState } from "./builder";
import type { Flags } from "@/content/types";

// A light, reversible obfuscation — enough that a player can't just read their
// sealed origin, but the GM can decode it. NOT real cryptography; don't use it
// for secrets that matter.
const KEY = "tahar-of-a-hundred-worlds";
const PREFIX = "PFTS1.";

function xorBytes(bytes: Uint8Array): Uint8Array {
  const k = new TextEncoder().encode(KEY);
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ k[i % k.length];
  return out;
}

export interface Dossier {
  v: number;
  name: string;
  ancestry?: string;
  heritage?: string;
  class?: string;
  background?: string;
  level: number;
  temperament: string | null;
  crossedChasm: string;
  capstone: string | null;
  morality: string;
  darkPath: boolean;
  corrupted: boolean;
  mastery: number;
  sealedAt: string;
}

export function buildDossier(build: BuildState | null, flags: Flags): Dossier {
  const r = build ? resolve(build) : {};
  return {
    v: 1,
    name: build?.name?.trim() || "Unnamed Wanderer",
    ancestry: "ancestry" in r ? r.ancestry?.name : undefined,
    heritage: "heritage" in r ? r.heritage?.name : undefined,
    class: "cls" in r ? r.cls?.name : undefined,
    background: "background" in r ? r.background?.name : undefined,
    level: 1,
    temperament: (flags.temperament as string) ?? null,
    crossedChasm: flags.crossedBoldly ? "boldly, full commit" : "measured, ready to catch the ledge",
    capstone: (flags.capstoneApproach as string) ?? null,
    morality: (flags.morality as string) ?? "untested",
    darkPath: !!flags.darkPath,
    corrupted: !!flags.corrupted,
    mastery: Number(flags.mastery) || 0,
    sealedAt: new Date().toISOString(),
  };
}

export function encodeSeal(d: Dossier): string {
  const bytes = new TextEncoder().encode(JSON.stringify(d));
  const x = xorBytes(bytes);
  let bin = "";
  for (const b of x) bin += String.fromCharCode(b);
  return PREFIX + btoa(bin);
}

export function decodeSeal(s: string): Dossier | null {
  try {
    const b64 = s.trim().replace(/\s+/g, "").replace(PREFIX, "");
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const json = new TextDecoder().decode(xorBytes(bytes));
    const d = JSON.parse(json);
    return typeof d === "object" && d && "name" in d ? (d as Dossier) : null;
  } catch {
    return null;
  }
}

export interface Boon {
  name: string;
  effect: string;
}

/** Suggest a thematic blessing + curse for the GM, based on the origin. */
export function suggestCurseBlessing(d: Dossier): { blessing: Boon; curse: Boon; note: string } {
  let blessing: Boon;
  let curse: Boon;

  if (d.corrupted) {
    blessing = {
      name: "Shardbound Conduit",
      effect:
        "Once per day, as a free action, channel the planar shard: your next damaging Strike or spell deals +1d6 force damage and sheds bright light for a round.",
    };
    curse = {
      name: "Shard-Sick",
      effect:
        "The power is not entirely yours. On a critical failure on any save, you become Stupefied 1 until the end of your next turn as the shard flares. The GM may, once per session, have the shard 'want' something.",
    };
  } else if (d.darkPath) {
    blessing = {
      name: "Ash-Forged Resolve",
      effect: "You burned a path clean once. You gain a +1 status bonus to saves vs. fear, and ignore the first point of frightened each combat.",
    };
    curse = {
      name: "The Cinder Debt",
      effect:
        "Something survived the fire — or remembers it. Once per session the GM introduces a complication tied to what you destroyed (a hunter, a rumor, a guilt-borne vision).",
    };
  } else if (d.morality === "merciful") {
    blessing = {
      name: "The Spared Flame",
      effect: "Mercy is remembered. Once per session, call on it: re-roll a failed save or skill check, or a small kindness returns to you at a key moment (GM's call).",
    };
    curse = {
      name: "Soft-Hearted",
      effect: "You hesitate to finish a beaten foe. The first time each combat you reduce an enemy to 0 HP, you can't also act against another that round unless you spend an action steadying yourself.",
    };
  } else if (d.morality === "pragmatic") {
    blessing = {
      name: "Borrowed Spark",
      effect: "The shard you kept hums useful. Gain a +1 item bonus to one skill of the GM's choosing while you carry it.",
    };
    curse = {
      name: "It Whispers",
      effect: "The shard wants to be used. When you roll a natural 1, the GM may offer you power to reroll — at a price you won't know until later.",
    };
  } else {
    blessing = {
      name: "Untouched",
      effect: "You left the nest as you found it and asked for nothing. You begin the campaign with one extra Hero Point at your first session.",
    };
    curse = {
      name: "The Pull",
      effect: "You walked away from power once. It noticed. The GM may have echoes of the planar shard surface around you at dramatic moments.",
    };
  }

  const temper =
    d.temperament === "bold"
      ? "Plays bold and headfirst — reward decisive action; punish recklessness sparingly."
      : d.temperament === "careful"
        ? "Plays careful and clever — reward planning and patience."
        : d.temperament === "curious"
          ? "Plays curious — feed them lore, secrets, and third options."
          : "Temperament untested — read them at the table.";

  return { blessing, curse, note: temper };
}

function trigger(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Download the sealed origin as a .txt the player hands to their GM. */
export function downloadSeal(build: BuildState | null, flags: Flags) {
  const d = buildDossier(build, flags);
  const code = encodeSeal(d);
  const slug = d.name.replace(/\s+/g, "-").toLowerCase();
  const body = [
    "=== PATHFINDER ORIGIN SEAL ===",
    "Give this whole file to your Game Master. Do not open it expecting to read it —",
    "it's sealed. Your GM can decode it at the game's /gm page.",
    "",
    code,
    "",
  ].join("\n");
  trigger(`${slug}-origin-seal.txt`, body);
}
