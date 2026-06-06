import type { Course } from "./types";

/**
 * The vertical slice: a single, start-to-finish lesson that teaches the most
 * fundamental Pathfinder 2e concept — the d20 check and its four degrees of
 * success — entirely through play. You meet a companion, you roll real dice
 * against real DCs, the story branches on the result, and you "graduate" the
 * lesson. The rules are resolved by the engine; this file is pure story.
 */
export const COURSE: Course = {
  title: "The Sunken Threshold",
  subtitle: "Lesson 1 — Dice & the Four Degrees of Success",
  start: "welcome",
  nodes: {
    welcome: {
      kind: "narration",
      speaker: "Bram",
      xp: 5,
      lines: [
        "Rain ticks off your hood. Ahead, half-swallowed by the hillside, leans the broken gate of an old watchtower — the place the village calls the Sunken Threshold.",
        "A broad-shouldered woman with a lantern grins at you. “First time out, eh? Name's Bram. I'll walk you through it.”",
        "“Here's the whole game in one breath: I describe the world, you decide what your hero does, and dice settle anything uncertain. That's it. You can't break it, and you can't lose me.”",
      ],
      next: "intro-choice",
    },

    "intro-choice": {
      kind: "choice",
      speaker: "Bram",
      prompt: "Before we step inside — what kind of adventurer are you, deep down?",
      options: [
        { label: "Bold and brash", hint: "Charge in first, think later", next: "intro-bold", set: ({ set }) => set({ temperament: "bold" }) },
        { label: "Careful and clever", hint: "Look before you leap", next: "intro-careful", set: ({ set }) => set({ temperament: "careful" }) },
        { label: "Curious about everything", hint: "Ask all the questions", next: "intro-curious", set: ({ set }) => set({ temperament: "curious" }) },
      ],
    },
    "intro-bold": {
      kind: "narration",
      speaker: "Bram",
      lines: ["“Ha — a charger! We'll temper that with a little sense, but courage is half this game. Come on.”"],
      next: "what-is-ttrpg",
    },
    "intro-careful": {
      kind: "narration",
      speaker: "Bram",
      lines: ["“Careful keeps you breathing. Smart. The dice tend to punish the reckless… most of the time. Let's go.”"],
      next: "what-is-ttrpg",
    },
    "intro-curious": {
      kind: "narration",
      speaker: "Bram",
      lines: ["“Curiosity is the finest trait an adventurer can carry. Ask away — that's exactly how you'll learn. After me.”"],
      next: "what-is-ttrpg",
    },

    "what-is-ttrpg": {
      kind: "teach",
      title: "What you're actually doing",
      body: [
        "Pathfinder is a story you build together by talking and rolling dice. There's no script you have to memorize.",
        "For this lesson you'll play Wren, a green-but-game frontier scout. Bram is your companion — she'll never let the story strand you.",
      ],
      points: [
        "The GM describes the situation.",
        "You decide what your character tries.",
        "Dice resolve whatever's in doubt.",
      ],
      next: "door",
    },

    door: {
      kind: "teach",
      speaker: "Bram",
      title: "Not everything needs a roll",
      xp: 5,
      body: [
        "The gate's stuck. You set your shoulder to it and shove — and it grinds open with a groan. No dice needed.",
        "“When a task is trivial, the GM just tells you it works,” Bram says. “We only roll when failure is interesting. Keep that in your pocket.”",
      ],
      points: ["Trivial tasks: no roll, you just succeed."],
      next: "teach-d20",
    },

    "teach-d20": {
      kind: "teach",
      title: "The d20 check",
      body: [
        "When the outcome IS in doubt, you roll a twenty-sided die (the d20) and add your modifiers. Compare the total to a target number called the Difficulty Class, or DC.",
        "Your modifier is mostly two things: how good you are at this (your proficiency, plus your level) and your relevant ability score.",
      ],
      points: [
        "Roll d20 + modifiers.",
        "Meet or beat the DC = you succeed.",
        "Big PF2e quirk: you add your level to almost everything — that's why DCs look high.",
      ],
      next: "teach-degrees",
    },

    "teach-degrees": {
      kind: "teach",
      title: "Four degrees, not pass/fail",
      body: [
        "Pathfinder doesn't just ask “did I succeed?” It asks “how well, or how badly?” Every roll lands in one of four bands:",
      ],
      points: [
        "Beat the DC by 10+  →  Critical Success",
        "Meet or beat the DC  →  Success",
        "Miss the DC  →  Failure",
        "Miss the DC by 10+  →  Critical Failure",
        "Then the die itself talks: a natural 20 bumps you up one band, a natural 1 bumps you down one. (So a nat 20 is NOT an automatic crit!)",
      ],
      next: "chasm-setup",
    },

    "chasm-setup": {
      kind: "narration",
      speaker: "Bram",
      lines: [
        "Inside, the floor has collapsed into a black chasm. The far ledge is a long jump away.",
        "Bram wedges a broken beam across part of the gap. “There — a running start. That's a circumstance bonus to your jump. Watch how it stacks onto your roll.”",
        "“This one we roll for. How do you want to take it?”",
      ],
      next: "chasm-approach",
    },

    "chasm-approach": {
      kind: "choice",
      prompt: "The gap yawns below. How do you cross?",
      options: [
        { label: "A full running leap", hint: "Commit — speed off the beam", next: "chasm", set: ({ set }) => set({ crossedBoldly: true }) },
        { label: "A measured jump, ready to grab the ledge", hint: "Play it safe", next: "chasm", set: ({ set }) => set({ crossedBoldly: false }) },
      ],
    },

    chasm: {
      kind: "check",
      prompt: "Leap the chasm — Athletics vs DC 15",
      retry: true,
      spec: {
        label: "Athletics",
        skill: "athletics",
        attr: "str",
        dc: 15,
        modifiers: [
          { type: "circumstance", value: 1, source: "Bram's beam (running start)" },
        ],
      },
      outcomes: {
        "critical-success": {
          bonusXp: 10,
          next: "after-chasm",
          lines: [
            "You hit the beam at a dead sprint and FLY — clearing the gap with room to spare and landing in a clean roll.",
            "Your hand closes on something in the rubble: a small pouch of old coins.",
            "“That's a critical success — you beat the DC by ten or more,” Bram calls, hopping across after you. “The world gives you a little extra when you blow the doors off.”",
          ],
        },
        success: {
          next: "after-chasm",
          lines: [
            "You jump, catch the far ledge with both hands, and haul yourself up, breathing hard.",
            "“Clean success — you met the DC,” Bram says. “No drama, just done. Most of the game lives right here.”",
          ],
        },
        failure: {
          next: "after-chasm",
          lines: [
            "You leap a beat too early. Your boots scrabble at the edge — and Bram's hand clamps your wrist and yanks you up onto the ledge.",
            "“Missed the DC, so: failure. Happens constantly,” she says, unbothered. “Failing isn't the end of the story — it's just the next thing that happens. Up you get.”",
          ],
        },
        "critical-failure": {
          next: "after-chasm",
          lines: [
            "You misjudge it badly and drop short, sliding down to a lower shelf in a clatter of loose stone and bruised pride.",
            "Bram tosses you a rope, grinning. “Missed by ten or more — critical failure. The worst band, and you know what? Still fine. Climb up, we keep going.”",
          ],
        },
      },
    },

    "after-chasm": {
      kind: "narration",
      speaker: "Bram",
      lines: (ctx) => [
        ctx.flags.crossedBoldly
          ? "On the far ledge, Bram grins. “All-or-nothing on the jump — I like the nerve.”"
          : "On the far ledge, Bram nods. “Measured, ready to catch yourself. Smart crossing.”",
        "“See what just happened? Same jump, same dice — but the result had texture. That's the four degrees doing their work.”",
        "“Let's make sure it stuck.”",
      ],
      next: "quiz",
    },

    quiz: {
      kind: "quiz",
      speaker: "Bram",
      xp: 10,
      prompt:
        "Quick check: you roll a 14 on the die, your modifiers bring the total to 26, and the DC was 15. What's the result?",
      options: [
        {
          label: "Critical Success",
          correct: true,
          feedback:
            "Exactly. 26 beats the DC of 15 by eleven — ten or more over the DC is a critical success. The natural die wasn't a 1 or 20, so nothing shifts.",
        },
        {
          label: "Success",
          correct: false,
          feedback:
            "Close, but check the margin: 26 − 15 = 11. Beating the DC by 10 or more lifts a plain success up to a CRITICAL success. Try again.",
        },
        {
          label: "Failure",
          correct: false,
          feedback:
            "Not quite — 26 is well above the DC of 15, so you definitely succeeded. The only question is how well. Try again.",
        },
      ],
      next: "unit1-crown",
    },

    "unit1-crown": {
      kind: "end",
      xp: 15,
      enter: ({ set }) => set((f) => ({ mastery: (Number(f.mastery) || 0) + 1 })),
      title: "Unit 1 Complete",
      crown: "Degrees of Success",
      body: [
        "Bram claps you on the shoulder. “That's the engine the whole game runs on. Roll, add, compare to the DC, read the degree. Everything else is detail.”",
        "You can now resolve any check in Pathfinder 2e — and you know that failing is just the story's next turn, not a wall.",
      ],
      upNext:
        "The Three-Action Economy — the heart of every Pathfinder turn, and where most new players stumble.",
      next: "u2-intro",
    },

    // ---------------------------------------------------------------------
    // UNIT 2 — The Three-Action Economy
    // ---------------------------------------------------------------------
    "u2-intro": {
      kind: "narration",
      speaker: "Bram",
      xp: 5,
      lines: [
        "Deeper in, the passage opens into a flooded hall — and a figure rises from behind a fallen pillar: a marauder who's been looting the place, axe already in hand.",
        "“No talking our way out of this one,” Bram mutters, drawing steel. “Time you learned how a fight actually works. Stay close.”",
      ],
      next: "u2-teach-actions",
    },

    "u2-teach-actions": {
      kind: "teach",
      title: "Three actions. That's your turn.",
      body: [
        "Combat happens in rounds. On YOUR turn you get exactly three actions, plus one reaction you can use even on someone else's turn.",
        "Most things cost one action: Strike (attack), Stride (move), Raise a Shield, Demoralize a foe. You spend your three however you like.",
      ],
      points: [
        "3 actions per turn — spend them in any order.",
        "1 reaction, usable on anyone's turn.",
        "The whole game's tactics live in how you spend those three.",
      ],
      next: "u2-teach-map",
    },

    "u2-teach-map": {
      kind: "teach",
      speaker: "Bram",
      title: "Why you don't just swing three times",
      body: [
        "Here's the trap every newcomer falls into: spending all three actions on Strikes. Each attack after your first takes a stacking Multiple Attack Penalty (MAP).",
        "“Your second swing is at −5, your third at −10,” Bram says. “That third one almost never lands. The masters spend that action setting up instead — moving, raising a shield, or scaring the enemy so the NEXT hit counts.”",
      ],
      points: [
        "1st Strike: no penalty.",
        "2nd Strike: −5.",
        "3rd Strike: −10 (a near-guaranteed whiff).",
        "Demoralize, Raise a Shield, Stride: NOT attacks — no penalty.",
      ],
      next: "u2-combat",
    },

    "u2-combat": {
      kind: "combat",
      xp: 10,
      prompt: "Duel: defeat the marauder",
      intro: [
        "Watch the action pips at the bottom — each thing you do spends one. Notice the penalty climb if you keep Striking, and try spending an action on Demoralize to soften the foe up.",
      ],
      enemy: {
        name: "the marauder",
        blurb: "A scarred looter with a heavy axe.",
        ac: 16,
        maxHp: 22,
        attackBonus: 8,
        attackDamageDie: 6,
        attackDamageBonus: 3,
        willDC: 15,
      },
      victoryLines: [
        "The marauder drops the axe and slumps against the pillar, beaten.",
        "“See that?” Bram says, breathing hard. “The fights you win aren't the ones where you swing the most — they're the ones where every action earns its keep.”",
      ],
      next: "unit2-crown",
    },

    "unit2-crown": {
      kind: "end",
      xp: 20,
      enter: ({ set }) => set((f) => ({ mastery: (Number(f.mastery) || 0) + 1 })),
      title: "Unit 2 Complete",
      crown: "The Three-Action Economy",
      body: [
        "You can now run a turn the way Pathfinder intends: three deliberate actions, a reaction held in reserve, and the wisdom to not throw away a −10 swing.",
        "Roll a check, read its degree, and spend a turn well — that's the spine of the entire game, and it's yours now.",
      ],
      upNext:
        "First Guided Combat — a real fight with turn order, an ally at your side, and your first reaction.",
      next: "u3-intro",
    },

    // ---------------------------------------------------------------------
    // UNIT 3 — First Guided Combat (initiative, allies, reactions)
    // ---------------------------------------------------------------------
    "u3-intro": {
      kind: "narration",
      speaker: "Bram",
      xp: 5,
      lines: [
        "You press on — and the dark erupts. Two skulkers drop from the rafters, blades out, one lunging for you and one for Bram.",
        "“Two of them, two of us,” Bram says, settling into a stance. “This is a real fight now. Watch the turn order, keep your shield ready, and trust me to set them up for you.”",
      ],
      next: "u3-teach-initiative",
    },

    "u3-teach-initiative": {
      kind: "teach",
      title: "Initiative & turn order",
      body: [
        "When a fight starts, everyone rolls initiative (usually a Perception check). Highest goes first, then down the list, then back to the top for the next round.",
        "You only control your own turn — but what your allies and foes do on theirs matters, which is why you hold something in reserve...",
      ],
      points: [
        "Roll initiative → act in that order, round after round.",
        "Your three actions refresh at the start of each of your turns.",
        "So does your one reaction.",
      ],
      next: "u3-teach-reaction",
    },

    "u3-teach-reaction": {
      kind: "teach",
      speaker: "Bram",
      title: "Your reaction: Shield Block",
      body: [
        "You get one reaction per round, and it can fire on someone else's turn — when a specific trigger happens.",
        "“You learned to Raise a Shield last fight,” Bram says. “Here's the payoff: while it's up and a blow lands, you can spend your reaction to Shield Block and soak some of the damage. One per round — so time it.”",
      ],
      points: [
        "Raise a Shield (an action) → shield is up.",
        "Get hit while it's up → you MAY Shield Block (a reaction) to reduce the damage.",
        "One reaction per round. It refreshes on your turn.",
      ],
      next: "u3-encounter",
    },

    "u3-encounter": {
      kind: "encounter",
      xp: 10,
      prompt: "Two-on-two: hold the line with Bram",
      intro: [
        "Roll initiative and watch the order at the top. On your turn, click a foe to target it. Raise your shield so you can Shield Block when struck — and let Bram trip a skulker to leave it off-guard for your strike.",
      ],
      foes: [
        {
          id: "skulker-a",
          name: "Lurk",
          role: "foe",
          ac: 15,
          maxHp: 15,
          attackBonus: 7,
          damageDie: 6,
          damageBonus: 2,
          willDC: 14,
          reflexDC: 14,
          initiativeBonus: 6,
        },
        {
          id: "skulker-b",
          name: "Skit",
          role: "foe",
          ac: 15,
          maxHp: 15,
          attackBonus: 7,
          damageDie: 6,
          damageBonus: 2,
          willDC: 14,
          reflexDC: 14,
          initiativeBonus: 6,
        },
      ],
      victoryLines: [
        "The second skulker folds, and the hall goes quiet but for dripping water.",
        "“That,” Bram says, sheathing her blade, “is a team fight. You read the order, you blocked when it counted, and you finished what I set up. You're ready for the real thing.”",
      ],
      next: "unit3-crown",
    },

    "unit3-crown": {
      kind: "end",
      xp: 25,
      enter: ({ set }) => set((f) => ({ mastery: (Number(f.mastery) || 0) + 1 })),
      title: "Unit 3 Complete",
      crown: "Initiative, Allies & Reactions",
      body: [
        "You've now fought a real encounter: rolled initiative, taken your turns in order, targeted the right foe, fought beside an ally, and spent a reaction at the right moment.",
        "Checks, the three-action turn, and live combat with a party — that's the working core of Pathfinder 2e, and you can do all of it.",
      ],
      upNext:
        "Conditions — the levers that decide most fights, and the dying rules every player needs to understand.",
      next: "u4-intro",
    },

    // ---------------------------------------------------------------------
    // UNIT 4 — Conditions (incl. the dying/wounded/recovery loop)
    // ---------------------------------------------------------------------
    "u4-intro": {
      kind: "narration",
      speaker: "Bram",
      xp: 5,
      lines: [
        "The passage ends at a vaulted chamber. A construct of fused stone and old armor grinds to life and levels a greatsword at you.",
        "Bram whistles low. “That plating is thick — swing at it head-on and you'll mostly bounce off. We win this by stacking the deck: knock it Off-Guard, rattle it, make it easier to hit. Conditions, lass. This fight is a conditions lesson with a sword.”",
      ],
      next: "u4-teach-conditions",
    },

    "u4-teach-conditions": {
      kind: "teach",
      title: "Conditions: the levers of the game",
      body: [
        "Conditions are standardized status effects. Some are simple on/off (Prone, Blinded); others carry a number (Frightened 2, Clumsy 1). Same-named conditions don't stack — you keep the highest value.",
        "You've already used two: Off-Guard (−2 to a creature's AC — from being flanked or tripped Prone) and Frightened (a penalty to ALL its checks and DCs, ticking down by 1 each turn).",
      ],
      points: [
        "Valued (Frightened 2) vs binary (Prone). Keep the highest value, never add.",
        "Off-Guard: −2 AC. Frightened X: −X to everything, and fades by 1 each turn.",
        "Tripping a foe makes it Prone → Off-Guard. Demoralize makes it Frightened.",
        "Stack a debuff or two and a 'too-tough' foe becomes very hittable.",
      ],
      next: "u4-boss",
    },

    "u4-boss": {
      kind: "encounter",
      xp: 15,
      prompt: "Boss: bring down the Stone Sentinel",
      victoryTitle: "The Sentinel falls",
      intro: [
        "Its AC is brutal — head-on swings will mostly miss. Let Bram Trip it (Off-Guard, −2 AC) and spend an action to Demoralize (Frightened, −more). Watch its effective AC drop, then strike while it's vulnerable.",
      ],
      foes: [
        {
          id: "sentinel",
          name: "Stone Sentinel",
          role: "foe",
          ac: 21,
          maxHp: 38,
          attackBonus: 11,
          damageDie: 10,
          damageBonus: 5,
          willDC: 16,
          reflexDC: 15,
          initiativeBonus: 2,
        },
      ],
      victoryLines: [
        "With a final crack the construct topples, its animating light winking out.",
        "“See that?” Bram says. “We never out-muscled it. We made it easy to hit and THEN hit it. That's most hard fights in this game — find the lever, pull it.”",
      ],
      next: "u4-downed",
    },

    "u4-downed": {
      kind: "narration",
      speaker: "Bram",
      lines: [
        "As the Sentinel falls, a last reflex swings its blade — and catches you across the ribs. The room tilts. You hit the floor, the world going grey at the edges.",
        "“Stay with me!” Bram is already moving. “You're Dying — but that's not the end. There's a way back. You have to fight for it. Roll.”",
      ],
      next: "u4-teach-dying",
    },

    "u4-teach-dying": {
      kind: "teach",
      title: "Dying, Wounded & the recovery check",
      body: [
        "Drop to 0 HP and you're knocked out with the Dying condition (Dying 1, or 2 from a crit). You die if Dying ever reaches 4.",
        "At the start of each of your turns while Dying, you roll a recovery check — a flat d20 (no modifiers) against DC 10 + your Dying value. It's a normal four-degree check, so a nat 20 or nat 1 still swings it.",
      ],
      points: [
        "Crit success: Dying −2.   Success: Dying −1.",
        "Failure: Dying +1 (plus your Wounded value).   Crit failure: +2.",
        "Reach Dying 0 → you're stable and conscious — but gain Wounded 1.",
        "Wounded makes the NEXT knockout start higher. It's the silent killer.",
      ],
      next: "u4-recovery",
    },

    "u4-recovery": {
      kind: "recovery",
      xp: 10,
      prompt: "Fight your way back: roll recovery checks",
      startingDying: 1,
      intro: [
        "Bram is holding the room. It's on you to claw back to consciousness. Each roll is a flat d20 vs DC 10 + your Dying value — watch the meter.",
      ],
      stabilizedLines: [
        "Your vision snaps back. You're up — battered, Wounded, but breathing.",
        "“There you are,” Bram exhales. “Now you understand the scariest part of the game from the inside. You'll never misread the dying rules at a table again.”",
      ],
      next: "unit4-crown",
    },

    "unit4-crown": {
      kind: "end",
      xp: 30,
      enter: ({ set }) => set((f) => ({ mastery: (Number(f.mastery) || 0) + 1 })),
      title: "Unit 4 Complete",
      crown: "Conditions & the Dying Rules",
      body: [
        "You've learned the levers that decide fights — Off-Guard, Frightened, Prone — and survived the dying/wounded/recovery loop from the inside.",
        "Checks, the three-action turn, party combat, conditions, and death-and-dying: that's the full rules core of Pathfinder 2e. The remaining units are about making it YOUR game.",
      ],
      upNext:
        "Character Creation — build the hero you'll actually bring to a table.",
      next: "u5-intro",
    },

    // ---------------------------------------------------------------------
    // UNIT 5 — Character Creation
    // ---------------------------------------------------------------------
    "u5-intro": {
      kind: "narration",
      speaker: "Bram",
      xp: 5,
      lines: [
        "Out in the daylight again, Bram sits you down on a fallen column. “You've borrowed my Wren long enough. Now you know how the game actually plays — so let's build YOUR hero. The one you'll bring to a real table.”",
        "“We do it one choice at a time. No memorizing. I'll tell you what each pick does, and you'll watch the sheet fill itself in.”",
      ],
      next: "u5-teach-build",
    },

    "u5-teach-build": {
      kind: "teach",
      title: "How a character is built",
      body: [
        "You assemble a hero from a few interchangeable blocks, in order. Each one hands you some attribute boosts (+1 to a stat), trained skills, and abilities.",
        "Attributes are just modifiers — everyone starts at +0. Boosts come in batches; within a batch each goes to a different attribute, but a stat can collect boosts across batches to reach its +4 cap. Your key attribute is the one your class leans on.",
      ],
      points: [
        "Ancestry → Background → Class → free boosts → skills → a feat.",
        "Each boost is +1; your key stat usually ends at +4.",
        "The sheet's AC, HP, saves and attack all recompute as you choose.",
      ],
      next: "u5-builder",
    },

    "u5-builder": {
      kind: "builder",
      xp: 15,
      prompt: "Build your hero",
      intro: [
        "Start with a name — anything you like. Then we'll choose the pieces together, and you'll be able to download the finished sheet to bring to your first game.",
      ],
      next: "unit5-crown",
    },

    "unit5-crown": {
      kind: "end",
      xp: 30,
      enter: ({ set }) => set((f) => ({ mastery: (Number(f.mastery) || 0) + 1 })),
      title: "Unit 5 Complete",
      crown: "Character Creation",
      body: [
        "You built a real, rules-legal level-1 hero — and you understand every number on the sheet, because you watched each choice put it there.",
        "You can now resolve checks, run a turn, fight as a party, handle conditions and dying, and make your own character. That is, genuinely, everything you need to sit down and play.",
      ],
      upNext: "The capstone — and your hand-off to a real table.",
      next: "u6-intro",
    },

    // ---------------------------------------------------------------------
    // UNIT 6 — Capstone & the Table Hand-off
    // ---------------------------------------------------------------------
    "u6-intro": {
      kind: "narration",
      speaker: "Bram",
      xp: 5,
      lines: [
        "Evening. You and Bram make camp at the mouth of the ruin you've cleared together. She looks at you differently now.",
        "“Think about what you just did. You read checks, ran your turns, fought as a team, clawed back from dying, and built a hero of your own. That WAS an adventure — a whole dungeon, start to finish.”",
        "“One last test, then I'm sending you to a real table. The way home is blocked by a rockfall and a nervous young drake guarding its nest. How do you want to handle it?”",
      ],
      next: "u6-capstone",
    },

    "u6-capstone": {
      kind: "choice",
      speaker: "Bram",
      prompt: "The drake blocks the path. What's your approach?",
      options: [
        { label: "Fight through it", hint: "Combat — with YOUR hero", next: "u6-fight", set: ({ set }) => set({ capstoneApproach: "fight" }) },
        { label: "Sneak past while it's distracted", hint: "Exploration & Stealth", next: "u6-cap-sneak", set: ({ set }) => set({ capstoneApproach: "sneak" }) },
        { label: "Calm it and coax it aside", hint: "A social approach", next: "u6-cap-talk", set: ({ set }) => set({ capstoneApproach: "talk" }) },
        {
          label: "Spot the old winch and reroute the rockfall",
          hint: "A clever third way",
          next: "u6-cap-clever",
          requires: (ctx) => ctx.flags.temperament === "curious",
          lockedHint: "A more curious adventurer might have noticed the mechanism here.",
          set: ({ set }) => set({ capstoneApproach: "clever" }),
        },
      ],
    },

    "u6-fight": {
      kind: "encounter",
      xp: 15,
      prompt: "Capstone duel: your hero vs. the drake",
      victoryTitle: "The drake yields",
      useBuiltHero: true,
      intro: [
        "This is the real thing — these are YOUR character's numbers now, not Wren's. Bram fights at your side. Everything you've learned, all at once: initiative, your three actions, conditions, your reaction.",
      ],
      foes: [
        {
          id: "drake",
          name: "Young Drake",
          role: "foe",
          ac: 18,
          maxHp: 32,
          attackBonus: 10,
          damageDie: 8,
          damageBonus: 4,
          willDC: 17,
          reflexDC: 16,
          initiativeBonus: 8,
        },
      ],
      victoryLines: [
        "The drake screeches, beats its wings, and breaks off — the path is yours.",
        "“That was all you,” Bram says, grinning. “Your hero, your tactics, a real win. You're ready.”",
      ],
      next: "u6-handoff",
    },
    "u6-cap-sneak": {
      kind: "narration",
      lines: [
        "You wait, watch its patrol, and slip past in Avoid Notice while it's turned away — a clean exploration solution, no blood spilled.",
        "“Smart. Not every problem is a fight — that's a lesson some players take years to learn,” Bram says.",
      ],
      next: "u6-handoff",
    },
    "u6-cap-talk": {
      kind: "narration",
      lines: [
        "You lower your weapon, speak low and steady, and toss it the dried meat from your pack. The drake huffs, settles, and lets you pass.",
        "“Now THAT'S roleplay. Diplomacy is a real tool, and you reached for it,” Bram grins.",
      ],
      next: "u6-handoff",
    },
    "u6-cap-clever": {
      kind: "narration",
      lines: [
        "Your eye catches a moss-choked winch bolted to the wall — the old builders' work. You crank it, and a counterweight shifts the rubble aside, opening a clear path the drake won't follow.",
        "Bram laughs, delighted. “That curiosity of yours just turned a fight into a non-event. The best adventurers always find the third option.”",
      ],
      next: "u6-handoff",
    },

    "u6-handoff": {
      kind: "handoff",
      xp: 20,
      prompt: "You're table-ready",
      intro: [
        "Bram presses a folded map into your hands. “My part's done. Here's everything you need to find a real table — and your character, ready to bring along.”",
        "Tick off what feels solid (it's just for you), grab your sheet, and note where to find your first game.",
      ],
      checklist: [
        "I can resolve a check: roll d20 + modifiers vs a DC, and read the degree of success.",
        "I can run a turn: three actions, one reaction, and the multiple attack penalty.",
        "I can fight as a party: initiative order, targeting, and helping allies.",
        "I understand conditions and the dying / wounded / recovery loop.",
        "I have a character built, and I know my AC, HP, saves, and key actions.",
        "I know table etiquette: share the spotlight, don't metagame, it's OK to ask and to make mistakes.",
        "I know what a session zero is, and that safety tools (like an X-card, lines & veils) exist.",
      ],
      resources: [
        { label: "Pathfinder Society (organized play)", detail: "Beginner-friendly worldwide campaign. Make a free Organized Play ID, start at level 1, and try a short Quest (2–3 hrs). Tables expect newcomers." },
        { label: "Official Pathfinder Discord", detail: "Very active #lfg (looking-for-group) and rules-help channels — a great first stop for online games." },
        { label: "r/Pathfinder2e LFG", detail: "The subreddit's LFG threads are good for finding online games at your pace." },
        { label: "Local game stores & conventions", detail: "Ask about PF2e nights or Pathfinder Society events — in-person tables love teaching new players." },
        { label: "Your first-session script", detail: "Try: \"Hi, I'm new, I built a level-1 [class], and I'm excited to learn.\" GMs and PFS tables genuinely welcome beginners." },
      ],
      next: "graduation",
    },

    graduation: {
      kind: "end",
      xp: 50,
      title: "You're Ready to Play",
      crown: "Pathfinder 2e — Ready for a Table",
      body: (ctx) => {
        const t = ctx.flags.temperament;
        const temperamentLine =
          t === "bold"
            ? "“You charged in bold from the very first step,” Bram says, “and you never lost that nerve.”"
            : t === "careful"
              ? "“Careful and clever, just like you said at the gate,” Bram says. “It kept you breathing the whole way.”"
              : t === "curious"
                ? "“That curiosity you walked in with? It found doors the rest would've missed,” Bram says."
                : "“You found your own way through every step,” Bram says.";
        const a = ctx.flags.capstoneApproach;
        const approachLine =
          a === "fight"
            ? "You faced the drake head-on and won — the combat is second nature now."
            : a === "sneak"
              ? "You slipped past the drake without a drop of blood — exploration mastered."
              : a === "talk"
                ? "You talked the drake down — proof you can roleplay your way through, not just fight."
                : a === "clever"
                  ? "You turned the drake into a non-problem with a clever third option — exactly how the best players think."
                  : "You found your way past the drake.";
        const m = Number(ctx.flags.mastery) || 0;
        return [
          `Bram shoulders her pack and offers a hand. “You came in never having rolled a d20, ${ctx.hero}. You're leaving with the rules, a character, and the nerve to use them.”`,
          temperamentLine,
          approachLine,
          `Five crowns of mastery${m >= 5 ? "" : ` (${m} earned)`}, and a hero of your own making. “Go find your table. They're lucky to have you — and hey, make some mistakes. That's where the best stories come from.”`,
          "That's the end of the course. You did it. Now go play.",
        ];
      },
      upNext:
        "There is no next — this is your graduation. Bring your sheet, find a group, and roll some dice for real.",
    },
  },
};
