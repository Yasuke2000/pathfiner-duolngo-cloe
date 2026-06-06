# What makes great interactive fiction — research & how we applied it

A multi-source study (inkle, Failbetter/Emily Short, Disco Elysium, Choice of
Games, A Dark Room/Reigns, Graham Nelson, Game Accessibility Guidelines) of what
makes text/choice games feel high-quality, distilled into what this teaching
game does — and what's still on the backlog.

> Sourcing caveat: many primary pages (emshort.blog, gamedeveloper.com,
> failbettergames.com) bot-blocked the fetcher, so quotes were reconstructed
> from search excerpts of those exact pages. URLs are linked for verification.

## Cross-source consensus (the big rocks)

1. **Branch-and-bottleneck, with state carried across the bottleneck.** Fix a few
   beats every playthrough hits; fan out and recombine; let *persistent variables*
   (not which branch you took) color later content. Agreed by inkle, Emily Short,
   Sam Kabo Ashwell. — Ashwell, *Standard Patterns in Choice-Based Games*; Short,
   *Beyond Branching*.
2. **Meaning comes from a world that remembers you**, not from plot forking —
   track a few numeric "qualities" (relationships, mastery, a progress counter)
   and reflect them in narration. — Failbetter QBN; Short, *Storylets: You Want Them*.
3. **Failure produces content, never removes it.** Author an entertaining *wrong*
   outcome; no dead ends. — Disco Elysium (Kurvitz: "you never prevent them from
   accessing a part of the game").
4. **Show the odds and the stat before a check.** — Disco Elysium; Fallen London
   *Broad difficulty*.
5. **One idea per beat; ~1–2 short paragraphs before the next choice.** Long text
   blocks cause measurable reading drop-off. — Ingold, *Adventures in Text*; A Dark
   Room design guide ("text is a visual medium").
6. **Typewriter effects must be optional + skippable + accessible.** Provide a
   speed setting incl. Instant; first tap completes; never break screen readers or
   reflow. (Real disagreement: VN/IF players often prefer instant text.)
7. **No fake choices; every option moves a stat or the story; give every option
   dignity; keep choice grammar parallel.** — Choice of Games (Fabulich).
8. **Respect the player:** clear goal, never make them feel stupid (explain *why*
   an outcome happened), don't make them repeat boring actions, no unwinnable
   states without warning. — Graham Nelson, *Player's Bill of Rights* (the
   parser-input half is obsolete for a click game).
9. **Readability:** ~60–70 char measure, line-height ≥1.5, large scalable text,
   dyslexia-friendly option, real `<button>`s with visible focus, move focus to
   new content, honor `prefers-reduced-motion`. — Game Accessibility Guidelines;
   BDA Style Guide; W3C/WAI.
10. **Juice with restraint:** reserve shake/flash for genuine peaks; pair every
    animation with sound; a ~0.5s tension pause before a dice result; subtle by
    default; always allow skip. — itch.io/Blood Moon/Wayline juice writeups; RPG
    dice-drama writeup.
11. **Onboarding:** set the goal in the first minute, deliver an early guaranteed
    win, teach just-in-time, never front-load a rules screen. — invisible-tutorial
    craft; Short on QBN openings being the riskiest part.

## Applied in this build

- ✅ **Speed/motion/dyslexia settings** + a settings panel (`lib/settings.ts`,
  `components/SettingsPanel.tsx`). Text speed incl. Instant; reduce-motion snaps
  dice; dyslexia mode swaps to a legible font with extra spacing.
- ✅ **Typewriter rewrite** (`components/Typed.tsx`): speed-aware, reflow-free
  (per-character opacity so layout is stable), full text exposed to screen
  readers, first-tap-completes.
- ✅ **Show-the-odds pre-roll panel** (`CheckScene`): DC + your modifier + exact
  probability of each degree (enumerated over all 20 faces in `degreeOdds`).
- ✅ **Readability**: ~62ch measure on prose; focus moves to each new scene;
  visible focus rings; real buttons throughout.
- ✅ **Reduced-motion** honored via OS setting *and* in-app toggle.
- ✅ **Autosave & resume** (localStorage) + Restart; no progress lost on refresh.
- ✅ **Juice restraint already largely in place**: sound paired with beats; dice
  drama; crit/fumble emphasis; mute toggle.
- ✅ **Branch-and-bottleneck** opening temperament + chasm-approach choices that
  reconverge; combat/builder/capstone already rich in real decisions.
- ✅ **Failure-as-content / no dead ends**: every check degree (incl. crit fail)
  has a narrated outcome that advances the story; gentle no-punishment model.
- ✅ **Onboarding**: title screen sets the goal; first beat is a guaranteed win;
  rules are taught just-in-time, one concept per beat.

## Backlog (high-value, not yet done)

- ⏳ **Reactive narration that names your choices/stats** — thread a few qualities
  (companion trust, temperament, mastery) into later prose with conditional text
  ("Because you flanked earlier…"). Needs light templating in the content layer.
- ⏳ **White vs. red checks** — mark concept-drills retryable (after you review the
  rule) vs. one-shot story beats. Currently all checks are effectively one-shot.
- ⏳ **Requirements/odds on choice buttons** — show stat-gated/locked options
  greyed with the missing condition (Fallen London pattern) once choices become
  stat-gated.
- ⏳ **Scrollback transcript** of past narration.
- ⏳ **A real 3D tumbling d20** + tasteful screen flash on crits.

## Key sources

- Ashwell, *Standard Patterns in Choice-Based Games* — https://heterogenoustasks.wordpress.com/2015/01/26/standard-patterns-in-choice-based-games/
- Emily Short, *Beyond Branching* — https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/
- Emily Short, *Storylets: You Want Them* — https://emshort.blog/2019/11/29/storylets-you-want-them/
- inkle, *Writing With Ink* docs — https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md
- Jon Ingold, *Adventures in Text* (GDC) — https://gdcvault.com/play/1021774/Adventures-in-Text-Innovating-in
- Disco Elysium devblog, *Active Skill Checks* — https://discoelysium.com/devblog/2016/10/06/active-skill-checks
- Choice of Games, *5 Rules for Writing Interesting Choices* — https://www.choiceofgames.com/2010/03/5-rules-for-writing-interesting-choices-in-multiple-choice-games/
- Failbetter, *Fallen London Writer Guidelines* — https://www.failbettergames.com/news/fallen-london-writer-guidelines-part-i
- A Dark Room design guide — https://github.com/doublespeakgames/adarkroom/wiki/Design-Guide
- Graham Nelson, *Player's Bill of Rights* — https://www.gamedeveloper.com/design/the-player-s-bill-of-rights
- Game Accessibility Guidelines — https://gameaccessibilityguidelines.com/
