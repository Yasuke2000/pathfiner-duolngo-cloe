import { RANK_VALUE } from "@/engine/proficiency";
import type { ProficiencyRank } from "@/engine/types";
import { SKILLS } from "@/content/srd";
import {
  buildAttrs,
  derived,
  exportCharacter,
  resolve,
  trainedSkills,
  type BuildState,
} from "./builder";

function triggerDownload(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const slug = (b: BuildState) =>
  (b.name.trim() || "character").replace(/\s+/g, "-").toLowerCase();

/** The app's own clean, documented JSON. */
export function downloadAppJson(b: BuildState) {
  triggerDownload(`${slug(b)}.json`, JSON.stringify(exportCharacter(b), null, 2), "application/json");
}

const score = (mod: number) => 10 + mod * 2;
const rv = (r: ProficiencyRank) => RANK_VALUE[r];

/**
 * Best-effort Pathbuilder-2e-format export. Pathbuilder's JSON is the community
 * de-facto interchange (it imports into Foundry via Pathmuncher, Roll20, etc.),
 * so we emit its shape. Marked experimental: the format is large and we only
 * populate the level-1 fields this builder tracks.
 */
export function pathbuilderBuild(b: BuildState) {
  const { ancestry, background, cls } = resolve(b);
  const attrs = buildAttrs(b);
  const feat = cls?.feats.find((f) => f.id === b.featId);
  const armorRank = cls ? rv(cls.armor.rank) : 0;

  return {
    success: true,
    build: {
      name: b.name.trim() || "Unnamed Hero",
      class: cls?.name ?? "",
      dualClass: null,
      level: 1,
      ancestry: ancestry?.name ?? "",
      heritage: "",
      background: background?.name ?? "",
      alignment: "N",
      gender: "",
      age: "",
      deity: "",
      size: 2,
      sizeName: "Medium",
      keyability: cls?.keyAttr ?? "str",
      languages: ["Common"],
      attributes: {
        ancestryhp: ancestry?.hp ?? 0,
        classhp: cls?.hp ?? 0,
        bonushp: 0,
        bonushpPerLevel: 0,
        speed: ancestry?.speed ?? 25,
        speedBonus: 0,
      },
      abilities: {
        str: score(attrs.str),
        dex: score(attrs.dex),
        con: score(attrs.con),
        int: score(attrs.int),
        wis: score(attrs.wis),
        cha: score(attrs.cha),
        breakdown: {},
      },
      proficiencies: {
        classDC: cls ? rv(cls.classDcRank) : 0,
        perception: cls ? rv(cls.perception) : 0,
        fortitude: cls ? rv(cls.saves.fort) : 0,
        reflex: cls ? rv(cls.saves.ref) : 0,
        will: cls ? rv(cls.saves.will) : 0,
        heavy: armorRank,
        medium: armorRank,
        light: armorRank,
        unarmored: armorRank,
        advanced: 0,
        martial: cls ? rv(cls.weapon.rank) : 0,
        simple: cls ? rv(cls.weapon.rank) : 0,
        unarmed: cls ? rv(cls.weapon.rank) : 0,
        castingArcane: cls?.spell?.tradition === "arcane" ? rv(cls.spell.rank) : 0,
        castingDivine: cls?.spell?.tradition === "divine" ? rv(cls.spell.rank) : 0,
        castingOccult: 0,
        castingPrimal: 0,
      },
      feats: feat ? [[feat.name, null, "Class Feat", 1]] : [],
      specials: [],
      lores: [],
      equipment: [],
      specificProficiencies: { trained: [], expert: [], master: [], legendary: [] },
      trainedSkills: trainedSkills(b).map(
        (k) => SKILLS.find((s) => s.key === k)?.name ?? k,
      ),
      money: { cp: 0, sp: 0, gp: 15, pp: 0 },
    },
  };
}

export function downloadPathbuilderJson(b: BuildState) {
  triggerDownload(`${slug(b)}-pathbuilder.json`, JSON.stringify(pathbuilderBuild(b), null, 2), "application/json");
}

const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

/** Generate a clean one-page printable PDF character sheet. */
export async function downloadPdf(b: BuildState) {
  const { jsPDF } = await import("jspdf");
  const { ancestry, background, cls } = resolve(b);
  const attrs = buildAttrs(b);
  const s = derived(b);
  const feat = cls?.feats.find((f) => f.id === b.featId);

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;
  let y = 0;

  // Header band
  doc.setFillColor(36, 29, 56);
  doc.rect(0, 0, W, 86, "F");
  doc.setTextColor(231, 198, 107);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(b.name.trim() || "New Hero", M, 44);
  doc.setTextColor(220, 216, 235);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(
    `Level 1 ${ancestry?.name ?? ""} ${cls?.name ?? ""}${background ? ` · ${background.name}` : ""}`,
    M,
    66,
  );
  y = 120;

  const section = (title: string) => {
    doc.setTextColor(120, 90, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), M, y);
    doc.setDrawColor(210, 200, 175);
    doc.line(M, y + 5, W - M, y + 5);
    y += 22;
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
  };

  const ATTR_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
  section("Attributes");
  const colW = (W - 2 * M) / 6;
  ATTR_KEYS.forEach((k, i) => {
    const x = M + i * colW + colW / 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(fmt(attrs[k]), x, y + 6, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(k.toUpperCase(), x, y + 22, { align: "center" });
    doc.setTextColor(30, 30, 30);
  });
  y += 48;

  if (s) {
    section("Defenses");
    doc.text(`HP ${s.hp}     AC ${s.ac}     Perception ${fmt(s.perception)}     Speed ${s.speed} ft`, M, y);
    y += 18;
    doc.text(`Fortitude ${fmt(s.fort)}     Reflex ${fmt(s.ref)}     Will ${fmt(s.will)}`, M, y);
    y += 30;

    section("Offense");
    doc.text(`Weapon attack ${fmt(s.attack)}     Class DC ${s.classDc}`, M, y);
    y += 18;
    if (s.spellDc !== undefined) {
      doc.text(`Spell DC ${s.spellDc}     Spell attack ${fmt(s.spellAttack ?? 0)}`, M, y);
      y += 18;
    }
    y += 12;
  }

  section("Trained skills");
  const skills = trainedSkills(b)
    .map((k) => SKILLS.find((x) => x.key === k)?.name ?? k)
    .join(", ");
  doc.text(doc.splitTextToSize(skills || "—", W - 2 * M), M, y);
  y += 36;

  if (feat) {
    section("Signature feat");
    doc.setFont("helvetica", "bold");
    doc.text(feat.name, M, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(feat.desc, W - 2 * M), M, y);
  }

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Built with the Pathfinder 2e Learn & Play teaching app — a streamlined level-1 hero.",
    M,
    doc.internal.pageSize.getHeight() - 36,
  );

  doc.save(`${slug(b)}.pdf`);
}
