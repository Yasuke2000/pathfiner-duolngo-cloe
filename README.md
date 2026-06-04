# The Sunken Threshold — Learn Pathfinder 2e by Playing

A **single-playthrough, teach-by-playing course** that takes a true beginner
from never-having-rolled-a-d20 to ready to sit down at a real Pathfinder 2e
(Remaster) table. You play it once, start to finish, "graduate", and go play the
real game — it is onboarding, not a game you grind.

This repository currently contains the **Phase 0 vertical slice**: one complete,
runnable learning loop that proves the core idea —

> a focused lesson → a dramatized real d20 check → narration that branches on the
> degree of success → progress and a "crown" you can earn.

The slice teaches the single most fundamental PF2e concept, **the d20 check and
its four degrees of success**, entirely through a short playable scene with a
companion NPC.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # the rules-engine unit tests
npm run build    # production build (fully static)
```

Requires Node 20+ (developed on Node 22).

## How it's built

The guiding architectural decision (from the research that scoped this project)
is to **keep the rules engine completely decoupled from the story.** Writers can
author narrative; the engine stays the single, tested source of truth for rules.

```
src/
  engine/        Pure, framework-agnostic PF2e rules. No React, no I/O.
    check.ts       resolveCheck() — the four degrees of success + nat-20/nat-1.
    stacking.ts    applyStacking() — PF2e's typed bonus/penalty rules.
    proficiency.ts proficiencyBonus() — rank value + level.
    *.test.ts      A truth-table test suite (run with `npm test`).
  game/          Bridges the engine to a playable hero.
    hero.ts        The pregenerated character the learner pilots.
    perform.ts     performCheck() — rolls + builds the labeled breakdown
                   that powers the teaching UI ("the breakdown IS the tutorial").
  content/       The course as DATA, not code.
    types.ts       Node schema (narration / teach / choice / quiz / check / end).
    course.ts      The actual lesson. Original generic-fantasy fiction.
  components/    The React player UI (Next.js App Router, client components).
    Player.tsx     Walks the scene graph; tracks XP + progress.
    CheckScene.tsx The dramatized d20: tumbling die, addends breakdown,
                   four-band degree readout, branched outcome.
  app/           Next.js 15 entry (layout, page, global styles).
```

### Why this shape

- **One engine drives every check.** `resolveCheck` + `applyStacking` are the
  highest-leverage code in the project; they are pure and unit-tested against a
  hand-written truth table (nat-20 against a brutal DC, nat-1 with a huge
  modifier, typed-bonus stacking, etc.).
- **Story is data.** Lessons are a graph of typed nodes in `content/course.ts`.
  Adding the next unit means adding nodes, not writing components.
- **Checks are tagged hand-offs.** A `check` node names a skill, attribute, DC
  and situational modifiers; the engine resolves it and the narration branches on
  the resulting degree — so a bad roll is a *story beat*, never a dead end.

### Teaching choices baked in

- **Gentle, no-hearts failure.** Every degree (including critical failure) has an
  outcome that keeps the story moving; failure is reframed, not punished.
- **The breakdown is the lesson.** Every roll shows its addends (d20, proficiency,
  ability, situational modifiers) and which were dropped by the stacking rules.
- **Accessibility.** Degrees are conveyed by label + symbol, not color alone;
  motion respects `prefers-reduced-motion`.
- **Single playthrough.** No streaks, daily goals, or leaderboards — the goal is
  confidence and a clean hand-off to a real table.

## Where the full course goes next

The slice ends by naming the next unit. The intended spine (each unit gated by a
"boss" milestone, ending in a capstone adventure + a "join a table" hand-off):

1. Dice & Degrees of Success ← **this slice**
2. The Three-Action Economy
3. First Guided Combat
4. Conditions
5. Character Creation
6. Exploration & Social
7. Capstone Solo Adventure → graduation & table hand-off

## Licensing note

All fiction here is original generic fantasy. The project reproduces only PF2e
**rules mechanics** (degrees of success, the check math), which are usable under
Paizo's ORC/OGL with the Community Use Policy, and uses no Golarion setting IP.
