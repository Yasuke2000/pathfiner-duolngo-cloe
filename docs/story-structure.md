# Story structure, branch map & the rhymes

A map of every branch in *The Sunken Threshold*, the state that drives it, and
the deliberate echoes that make the beginning rhyme with the end (the
"it's like poetry — they rhyme" principle). The branch graph is validated
automatically by `src/content/course.test.ts` (no broken links, no orphans,
every path concludes).

## The spine (branch-and-bottleneck)

Setting: a cave-mouth descending into a **sunken / drowned dungeon** (a built
complex the earth swallowed and water claimed). The descent escalates: skill →
exploration/social → combat → harder combat → boss → deep vault. Ecology is
seeded (the builders breached a vault of cold light and drowned, leaving a
guardian; squatters and a drake circle the shard).

```
welcome ─▶ intro-choice ─▶ what-is-ttrpg ─▶ door
  ▶ Unit 1  teach d20 ▸ degrees ▸ chasm-setup ▸ [chasm-approach] ▸ chasm(check) ▸ after-chasm ▸ quiz ▸ unit1-crown
  ▶ Interlude  [u1-social] talk / sneak / search — the exploration & social pillar; telegraphs the next fight and seeds the shard/ecology
  ▶ Unit 2  three-action economy ▸ duel (combat) ▸ unit2-crown
  ▶ Unit 3  initiative ▸ reactions ▸ two-on-two (encounter) ▸ unit3-crown
  ▶ Unit 4  conditions ▸ Stone Sentinel (encounter) ▸ downed ▸ dying ▸ recovery ▸ unit4-crown
  ▶ Unit 5  character creation (builder) ▸ unit5-crown
  ▶ Unit 6  capstone ─▶ [4 approaches] ─▶ u6-nest ─▶ [u6-moral] ─▶ outcome ─▶ u6-handoff ─▶ graduation ─▶ departure ✦END
```

Choices fan out and recombine ("bottleneck") so the teaching never forks into an
unmaintainable tree, while persistent **qualities** color later beats.

## State (qualities) — kept parsimonious

| Quality | Set at | Read at |
|---|---|---|
| `temperament` (bold/careful/curious) | intro-choice | gated capstone option, graduation, ancestry of the ending |
| `crossedBoldly` | chasm-approach | after-chasm (how you land the leap) |
| `mastery` (0–5) | each unit crown | graduation |
| `capstoneApproach` (fight/sneak/talk/clever) | capstone | graduation |
| `morality` + `darkPath` + `corrupted` | u6-moral | graduation ending variant, GM seal, curse/blessing |
| `pronouns` | builder | Tahar's address (`lass`/`lad`/`friend`) from Unit 5 on |

## The branches & their conclusions

- **Intro temperament** — bold / careful / curious. Flavors Tahar's replies, unlocks the *curious* capstone shortcut, and is named back in the ending. (Skipped in Quick mode.)
- **Chasm approach** — commit / measured. A white (retryable) check; reflected immediately after in how you land.
- **Capstone** — fight (with YOUR built hero) / sneak / talk / clever (curious-gated). All converge on the nest.
- **The moral fork (u6-moral)** — the heart of the branching:
  - *Leave it* → merciful ending; blessing-leaning seal.
  - *Take the shard* → pragmatic.
  - *Burn the nest* → **dark path** ending.
  - *Bind the shard* (bold-gated) → **corrupted** ending — the darkest.
- **Endings** — `graduation` renders three variants (bright / dark / corrupted) then flows into `departure`: Tahar locks the spark and fades the memory, and a black-hole portal carries you home — you wake in your own bed, an ordinary life with a sleeping spark and a dream you can't place. Quick mode concludes at `short-graduation` instead. (The title screen deliberately does NOT spoil the black-hole finale.)

No path dead-ends; every branch reaches a terminal `end` node.

## The rhymes (beginning ↔ end)

Intentional echoes so the story "rhymes":

1. **The shard.** A shard of cold planar light *imbues* you at the gate (your level-0→1 spark). At the very end, the capstone shard is **the same light** — Tahar says so outright — and the universe asks what you'll do with the thing that made you. Origin ⇄ choice.
2. **"You can't lose me" ⇄ "you won't remember me."** Tahar's reassurance at the threshold is paid off — bittersweetly — at the finale ("you can't, quite").
3. **Crossing the threshold.** You enter the Sunken Threshold as no one and walk back out through it as someone — the place that swallowed a dungeon now spits out a hero with a sleeping spark.
4. **Temperament ⇄ farewell.** Who you said you were at the gate is who he salutes at the end.
5. **No one ⇄ someone.** You arrive as "no one in particular"; you leave as a named hero with a story ahead — and wake "the way every hero wakes," mid-origin, memory wiped, so the prologue slots cleanly into a real campaign as backstory.

## The hand-off loop (for GMs)

`departure` lets the player download a sealed origin (obfuscated). The GM decodes
it at `/gm` (paste or upload) to see every choice above and get a thematic
**curse + blessing** matched to the path they walked.
