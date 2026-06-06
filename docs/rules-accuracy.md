# PF2e (Remaster) rules-accuracy audit

Every mechanic the app implements, verified against Archives of Nethys /
Player Core, with what we do and any fix applied. (Sourcing caveat: AoN blocks
automated fetches, so wording was cross-checked across AoN search extracts +
reputable mirrors; the load-bearing numbers/timings are consistent.)

## Verified correct (no change needed)
- **Degrees of success + nat 20/1** — meet = success, beat/miss by 10 = crit; a
  natural 20/1 shifts one step (NOT an auto-crit), applied before other
  adjustments. (`engine/check.ts`)
- **Multiple Attack Penalty** — −5/−10, agile −4/−8, attack-trait only, resets
  each turn. (`engine/actions.ts`)
- **Dying / Wounded / Recovery (Remaster)** — Dying on 0 HP (+wounded, +1 more
  on a crit), recovery = flat DC 10 + dying; crit-succ −2 / succ −1 / **fail
  +1 + wounded / crit-fail +2 + wounded** (the harsher Remaster math), Dying 4 =
  dead. (`engine/dying.ts`, tested)
- **Off-Guard** — −2 circumstance to AC. (`effectiveAc`)
- **Demoralize** — an Intimidation check vs the target's **Will DC** (not an
  attack roll, no MAP); frightened 1 / crit frightened 2.
- **Frightened** — status penalty to all the creature's checks **and DCs**
  (incl. AC), ticks −1 at the end of its turn.
- **Shield Block** — reaction; reduces damage by the shield's Hardness (steel 5).
- **Spell DC / attack** — 10 + prof + key attr / prof + key attr; one DC for all
  ranks. (`engine/character.ts`)
- **Attribute boosts** — +1 per boost, flaw −1, +4 creation cap. (`computeAttributes`)

## Fixed in this pass
- **Raise a Shield duration** — it only lasts *until the start of your next
  turn*; the encounter tracker had it stay up forever. Now it clears at the
  start of each turn (re-raise every round). It still protects through the foes'
  turns for Shield Block.
- **Demoralize 10-minute immunity** — you could spam it every turn. Now a foe is
  immune to your Demoralize after the first attempt (shown as "Rattled
  (immune)"; the action isn't wasted on an immune target).
- **Trip has the attack trait → MAP** — Tahar's trip-then-strike now takes the
  −5 on the follow-up Strike (Trip counts as an attack action).
- **Frightened lowers the target's DCs** — Will DC (Demoralize) and Reflex DC
  (Trip) are now reduced by the foe's frightened value, not just its AC.
- **Initiative ties** — now go to the adversary (PF2e RAW), not the party.

## Deliberate simplifications (teaching slice, not a full VTT)
- No shield HP / break tracking, no cover, no Aid, no prone attack-penalty or
  stand-up cost (prone is modeled as off-guard only), no grid/flanking geometry
  (flanking/off-guard is narrated via Trip). These are out of scope for a
  level-1 onboarding crawl and don't teach anything incorrectly.
