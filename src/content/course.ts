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
      speaker: "Tahar",
      xp: 5,
      lines: [
        "You are no one in particular — a villager, a traveler, a normal person — drawn for reasons you can't name to a black cave-mouth in the hills. The locals call it the Sunken Threshold: the throat of an old dungeon the earth swallowed and the water claimed, ages ago.",
        "The moment you step inside, something buried in the dark answers. A shard of cold light rises from the deep stone and sinks into your chest, and the world sharpens: strength you never had, instinct you never earned. You came here as no one. You stand up as… something.",
        "A lean figure in a tool-strung coat steps out of the dark, lantern raised, eyes bright with recognition. “THERE you are. Felt that spark catch from three worlds away.” He grins. “Tahar — artificer, tinkerer, and the closest thing to a guide you're getting.”",
        "“Here's the deal: I'll teach you to use what just woke up in you. I describe the world, you decide what you do, the dice settle the rest. You can't break it, and you can't lose me. Ready to find out what you've become?”",
      ],
      next: "intro-choice",
    },

    "intro-choice": {
      kind: "choice",
      speaker: "Tahar",
      prompt: "Before we head down into the dark — what kind of adventurer are you, deep down?",
      options: [
        { label: "Bold and brash", hint: "Charge in first, think later", next: "intro-bold", set: ({ set }) => set({ temperament: "bold" }) },
        { label: "Careful and clever", hint: "Look before you leap", next: "intro-careful", set: ({ set }) => set({ temperament: "careful" }) },
        { label: "Curious about everything", hint: "Ask all the questions", next: "intro-curious", set: ({ set }) => set({ temperament: "curious" }) },
      ],
    },
    "intro-bold": {
      kind: "narration",
      speaker: "Tahar",
      lines: ["“A charger. Ha! I knew a bold one on a brass-and-steam world who toppled a tyrant with exactly that energy — and nearly died nine times doing it. We'll keep the spirit, lose the dying. Come on.”"],
      next: "what-is-ttrpg",
    },
    "intro-careful": {
      kind: "narration",
      speaker: "Tahar",
      lines: ["“Careful and clever. Good — that's how you live long enough to get interesting. In most worlds I've seen, it's the patient ones who end up legends. Let's go.”"],
      next: "what-is-ttrpg",
    },
    "intro-curious": {
      kind: "narration",
      speaker: "Tahar",
      lines: ["“Curiosity — my favourite answer. It's the one trait that travels well between worlds. Ask me anything; I've probably seen a stranger version of it. After me.”"],
      next: "what-is-ttrpg",
    },

    "what-is-ttrpg": {
      kind: "teach",
      title: "What you're actually doing",
      body: [
        "Pathfinder is a story you build together by talking and rolling dice. There's no script you have to memorize.",
        "Your spark is fresh and you haven't decided who you are yet — so Tahar just calls you “Wren” for now. Later, you'll forge your real self. He's your guide; he'll never let the story strand you.",
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
      speaker: "Tahar",
      title: "Not everything needs a roll",
      xp: 5,
      body: [
        "A slab of fallen rock half-blocks the way down. You set your shoulder to it and shove — and it grinds aside with a groan, opening the dark passage deeper. No dice needed.",
        "“When a task is trivial, the GM just tells you it works,” Tahar says. “We only roll when failure is interesting. Keep that in your pocket.”",
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
      speaker: "Tahar",
      lines: [
        "Inside, the floor has collapsed into a black chasm. The far ledge is a long jump away.",
        "Tahar wedges a broken beam across part of the gap. “There — a running start. That's a circumstance bonus to your jump. Watch how it stacks onto your roll.”",
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
          { type: "circumstance", value: 1, source: "Tahar's beam (running start)" },
        ],
      },
      outcomes: {
        "critical-success": {
          bonusXp: 10,
          next: "after-chasm",
          lines: [
            "You hit the beam at a dead sprint and FLY — clearing the gap with room to spare and landing in a clean roll.",
            "Your hand closes on something in the rubble: a small pouch of old coins.",
            "“That's a critical success — you beat the DC by ten or more,” Tahar calls, hopping across after you. “The world gives you a little extra when you blow the doors off.”",
          ],
        },
        success: {
          next: "after-chasm",
          lines: [
            "You jump, catch the far ledge with both hands, and haul yourself up, breathing hard.",
            "“Clean success — you met the DC,” Tahar says. “No drama, just done. Most of the game lives right here.”",
          ],
        },
        failure: {
          next: "after-chasm",
          lines: [
            "You leap a beat too early. Your boots scrabble at the edge — and Tahar's hand clamps your wrist and yanks you up onto the ledge.",
            "“Missed the DC, so: failure. Happens constantly,” Tahar says, unbothered. “Failing isn't the end of the story — it's just the next thing that happens. Up you get.”",
          ],
        },
        "critical-failure": {
          next: "after-chasm",
          lines: [
            "You misjudge it badly and drop short, sliding down to a lower shelf in a clatter of loose stone and bruised pride.",
            "Tahar tosses you a rope, grinning. “Missed by ten or more — critical failure. The worst band, and you know what? Still fine. Climb up, we keep going.”",
          ],
        },
      },
    },

    "after-chasm": {
      kind: "narration",
      speaker: "Tahar",
      lines: (ctx) => [
        ctx.flags.crossedBoldly
          ? "On the far ledge, Tahar grins. “All-or-nothing on the jump — I like the nerve.”"
          : "On the far ledge, Tahar nods. “Measured, ready to catch yourself. Smart crossing.”",
        "“See what just happened? Same jump, same dice — but the result had texture. That's the four degrees doing their work.”",
        "“Let's make sure it stuck.”",
      ],
      next: "quiz",
    },

    quiz: {
      kind: "quiz",
      speaker: "Tahar",
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
        "Tahar claps you on the shoulder. “That's the engine the whole game runs on. Roll, add, compare to the DC, read the degree. Everything else is detail.”",
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
      speaker: "Tahar",
      xp: 5,
      lines: [
        "Deeper in, the passage opens into a flooded hall, ankle-deep and echoing. A figure rises from behind a fallen pillar — a marauder who's been stripping the drowned dungeon for scrap, axe already swinging up, eyes flat and certain.",
        "Tahar's hand drifts to a humming device on his belt, then stops. “No talking our way out of this one. Pity.” He passes you a blade hilt-first. “Right — your spark's about to earn its keep. On a thousand worlds, this next part is the same: it's all about how you spend a single turn. Watch.”",
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
      speaker: "Tahar",
      title: "Why you don't just swing three times",
      body: [
        "Here's the trap every newcomer falls into: spending all three actions on Strikes. Each attack after your first takes a stacking Multiple Attack Penalty (MAP).",
        "“Your second swing is at −5, your third at −10,” Tahar says. “That third one almost never lands. The masters spend that action setting up instead — moving, raising a shield, or scaring the enemy so the NEXT hit counts.”",
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
        "“See that?” Tahar says, breathing hard. “The fights you win aren't the ones where you swing the most — they're the ones where every action earns its keep.”",
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
      speaker: "Tahar",
      xp: 5,
      lines: [
        "You press deeper, and the dark comes alive. Two skulkers — wiry, grinning things — drop from ledges in the gloom overhead in a rain of grit, one for your throat, one for Tahar's.",
        "He sidesteps the first like he's done it a hundred times in a hundred halls. “NOW it's a real fight — two of them, two of us. This is where most heroes get themselves killed: they forget there's an order to it, and they forget their friends. Watch the turn order, keep that shield ready, and trust me to crack them open for you.”",
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
      speaker: "Tahar",
      title: "Your reaction: Shield Block",
      body: [
        "You get one reaction per round, and it can fire on someone else's turn — when a specific trigger happens.",
        "“You learned to Raise a Shield last fight,” Tahar says. “Here's the payoff: while it's up and a blow lands, you can spend your reaction to Shield Block and soak some of the damage. One per round — so time it.”",
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
      prompt: "Two-on-two: hold the line with Tahar",
      intro: [
        "Roll initiative and watch the order at the top. On your turn, click a foe to target it. Raise your shield so you can Shield Block when struck — and let Tahar trip a skulker to leave it off-guard for your strike.",
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
        "“That,” Tahar says, sheathing his blade, “is a team fight. You read the order, you blocked when it counted, and you finished what I set up. You're ready for the real thing.”",
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
      speaker: "Tahar",
      xp: 5,
      lines: [
        "The passage ends in a vaulted chamber, its air dead and dusty. With a grind of stone on stone, a construct of fused rubble and ancient armor hauls itself upright and levels a greatsword the size of a door at you.",
        "Tahar whistles low, almost admiring. “Ohh, I've met its cousins. That plating's too thick to just hack through — swing head-on and you'll bounce off all day. So we cheat: knock it Off-Guard, rattle its nerve, stack every advantage until it's easy to hit. That's the secret the great ones know — most hard fights are really a conditions puzzle wearing a sword.”",
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
        "Its AC is brutal — head-on swings will mostly miss. Let Tahar Trip it (Off-Guard, −2 AC) and spend an action to Demoralize (Frightened, −more). Watch its effective AC drop, then strike while it's vulnerable.",
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
        "“See that?” Tahar says. “We never out-muscled it. We made it easy to hit and THEN hit it. That's most hard fights in this game — find the lever, pull it.”",
      ],
      next: "u4-downed",
    },

    "u4-downed": {
      kind: "narration",
      speaker: "Tahar",
      lines: [
        "As the Sentinel falls, a last reflex swings its blade — and catches you across the ribs. The room tilts. You hit the floor, the world going grey at the edges.",
        "“Stay with me!” Tahar is already moving. “You're Dying — but that's not the end. There's a way back. You have to fight for it. Roll.”",
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
        "Tahar is holding the room. It's on you to claw back to consciousness. Each roll is a flat d20 vs DC 10 + your Dying value — watch the meter.",
      ],
      stabilizedLines: [
        "Your vision snaps back. You're up — battered, Wounded, but breathing.",
        "“There you are,” Tahar exhales. “Now you understand the scariest part of the game from the inside. You'll never misread the dying rules at a table again.”",
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
      speaker: "Tahar",
      xp: 5,
      lines: [
        "Out in the daylight, Tahar sits you down on a fallen column. “The spark's settled into you now. You're not 'Wren' the placeholder anymore — it's time to decide who you actually became when that light went in.”",
        "“This is the hero you'll be from here on: your name, your shape, your strengths. One choice at a time. I'll tell you what each pick does, and you'll watch the sheet fill itself in.”",
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
      speaker: "Tahar",
      xp: 5,
      lines: [
        "You climb back toward daylight and make camp at the cave-mouth, the drowned dungeon you've cleared together at your backs. Tahar studies you over the fire, brass tools glinting, like he's reading a map only he can see.",
        "“Think about what you did. You read checks, ran your turns, fought as a team, clawed back from dying, built a hero of your own. That WAS an adventure — a whole dungeon, start to finish.”",
        "“One last test before I send you to a real table. The way home is blocked by a rockfall and a nervous young drake guarding its nest. How you handle it tells me a lot — I've watched this exact moment play out across a dozen worlds. So: what's your approach?”",
      ],
      next: "u6-capstone",
    },

    "u6-capstone": {
      kind: "choice",
      speaker: "Tahar",
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
        "This is the real thing — these are YOUR character's numbers now, not Wren's. Tahar fights at your side. Everything you've learned, all at once: initiative, your three actions, conditions, your reaction.",
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
        "“That was all you,” Tahar says, grinning. “Your hero, your tactics, a real win. You're ready.”",
      ],
      next: "u6-nest",
    },
    "u6-cap-sneak": {
      kind: "narration",
      lines: [
        "You wait, watch its patrol, and slip past in Avoid Notice while it's turned away — a clean exploration solution, no blood spilled.",
        "“Smart. Not every problem is a fight — that's a lesson some players take years to learn,” Tahar says.",
      ],
      next: "u6-nest",
    },
    "u6-cap-talk": {
      kind: "narration",
      lines: [
        "You lower your weapon, speak low and steady, and toss it the dried meat from your pack. The drake huffs, settles, and lets you pass.",
        "“Now THAT'S roleplay. Diplomacy is a real tool, and you reached for it,” Tahar grins.",
      ],
      next: "u6-nest",
    },
    "u6-cap-clever": {
      kind: "narration",
      lines: [
        "Your eye catches a moss-choked winch bolted to the wall — the old builders' work. You crank it, and a counterweight shifts the rubble aside, opening a clear path the drake won't follow.",
        "Tahar laughs, delighted. “That curiosity of yours just turned a fight into a non-event. The best adventurers always find the third option.”",
      ],
      next: "u6-nest",
    },

    "u6-nest": {
      kind: "narration",
      speaker: "Tahar",
      lines: (ctx) => [
        "With the drake handled, you find what it was really guarding: a clutch of faintly glowing eggs — and nestled among them, a shard of cold, planar light, pulsing slow. Power, humming, just sitting there.",
        `Tahar crouches beside it, and for once the easy smile is gone. “Look familiar? It should. That's the same cold light that sank into your chest at the threshold — the thing that made you… you.”`,
        `He glances up. “The universe has a sense of humor, ${ctx.address}. It waited until the end to ask what you'll do with the very thing that started you. What you answer here tells me everything. Take your time.”`,
      ],
      next: "u6-moral",
    },

    "u6-moral": {
      kind: "choice",
      speaker: "Tahar",
      prompt: "The nest, the eggs, and a shard of planar power. What do you do?",
      options: [
        {
          label: "Leave it all untouched",
          hint: "It isn't yours to take",
          next: "u6-out-merciful",
          set: ({ set }) => set({ morality: "merciful" }),
        },
        {
          label: "Take the shard, spare the eggs",
          hint: "Power is a tool — use it well",
          next: "u6-out-pragmatic",
          set: ({ set }) => set({ morality: "pragmatic", tookShard: true }),
        },
        {
          label: "Burn the nest. Leave nothing behind to hunt you",
          hint: "Ruthless. Final.",
          next: "u6-out-dark",
          set: ({ set }) => set({ morality: "ruthless", darkPath: true }),
        },
        {
          label: "Bind the shard into your own flesh — seize the power",
          hint: "Nobody would dare… would they?",
          next: "u6-out-corrupted",
          requires: (ctx) => ctx.flags.temperament === "bold",
          lockedHint: "Only the truly bold would even consider it.",
          set: ({ set }) => set({ morality: "corrupted", darkPath: true, corrupted: true }),
        },
      ],
    },

    "u6-out-merciful": {
      kind: "narration",
      speaker: "Tahar",
      lines: [
        "You step back and leave the nest as you found it. The drake's wingbeats fade as it returns to its eggs, and the shard's glow dims, content to be forgotten.",
        "Tahar lets out a slow breath. “Mercy. The rarest magic I know — and I've seen a LOT of magic. You'll do just fine out there.”",
      ],
      next: "u6-handoff",
    },
    "u6-out-pragmatic": {
      kind: "narration",
      speaker: "Tahar",
      lines: [
        "You pocket the shard and leave the eggs to hatch. It thrums against your ribs, warm and patient.",
        "“A tool, then,” Tahar says, watching you carefully. “Good. Just remember which of you is holding the other — I've seen that go both ways.”",
      ],
      next: "u6-handoff",
    },
    "u6-out-dark": {
      kind: "narration",
      speaker: "Tahar",
      lines: [
        "You set the nest alight. The eggs' glow gutters and goes dark, and the shard cracks in the heat with a sound like a held breath finally let go.",
        "Tahar says nothing for a long moment. When he speaks, the warmth has stepped back. “…I've watched whole worlds begin right here, at a small fire like this one. I'll still take you to a table. But I'll be watching how this sits on you.”",
      ],
      next: "u6-handoff",
    },
    "u6-out-corrupted": {
      kind: "narration",
      speaker: "Tahar",
      lines: [
        "You press the shard to your skin. It SINKS in — light flooding your veins, the world sharpening to a razor's edge, power answering before you even ask. It feels extraordinary. It feels like yours.",
        "Tahar is on his feet, one hand drifting to his tools, his easy smile gone. “Oh, friend. I've buried people who made that exact choice — and crowned a couple who survived it. I genuinely don't know which you'll be. Neither do you. That's the terrifying part.”",
      ],
      next: "u6-handoff",
    },

    "u6-handoff": {
      kind: "handoff",
      xp: 20,
      prompt: "You're table-ready",
      intro: [
        "Tahar presses a folded map into your hands. “My part's done. Here's everything you need to find a real table — and your character, ready to bring along.”",
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
      enter: ({ set, flags }) => {
        // The dark path leaves a mark the world remembers.
        if (flags.darkPath) set({ endingTone: "dark" });
        else set({ endingTone: "bright" });
      },
      body: (ctx) => {
        const t = ctx.flags.temperament;
        const temperamentLine =
          t === "bold"
            ? "“You charged in bold from the very first step,” Tahar says, “and you never lost that nerve.”"
            : t === "careful"
              ? "“Careful and clever, just like you said at the threshold,” Tahar says. “It kept you breathing the whole way.”"
              : t === "curious"
                ? "“That curiosity you walked in with? It found doors the rest would've missed,” Tahar says."
                : "“You found your own way through every step,” Tahar says.";
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
        const masteryLine = `Five crowns of mastery${m >= 5 ? "" : ` (${m} earned)`}, and a hero of your own making.`;

        // ---- The dark ending ----
        if (ctx.flags.corrupted) {
          return [
            `Tahar offers a hand, but his eyes keep flicking to the planar light still moving under your skin. “You came in never having rolled a d20, ${ctx.hero}. You're leaving with the rules, a character, the nerve to use them — and something I can't quite measure.”`,
            temperamentLine,
            approachLine,
            `${masteryLine} “You're ready — make no mistake. But that power you took? It wants to spend you. Watch yourself out there.”`,
            "He studies you a moment longer than is comfortable. “One last thing before you go… and you won't like the catch.”",
          ];
        }
        if (ctx.flags.darkPath) {
          return [
            `Tahar offers a hand — a beat slower than before. “You came in as no one, ${ctx.hero}. You're leaving with the rules, a hero, and the nerve to use them. All of it real.”`,
            temperamentLine,
            approachLine,
            `${masteryLine} “They'll see who you choose to be when it's easier not to — they always do. So choose well.”`,
            "He almost smiles. “One last thing before you go.”",
          ];
        }

        // ---- The bright ending ----
        return [
          `Tahar claps you on the shoulder. “You came in as no one, ${ctx.hero}. You're leaving with the rules, a hero of your own making, and the nerve to use them.”`,
          temperamentLine,
          approachLine,
          `${masteryLine} “You're ready — truly. Go make some mistakes; that's where the best stories live.”`,
          "Then his grin turns sly. “Ah — but there's one last thing, and you won't see it coming.”",
        ];
      },
      next: "departure",
      upNext:
        "You've learned to play, and forged the hero you'll carry. One step remains.",
    },

    departure: {
      kind: "end",
      portal: true,
      title: "The Spark, Locked Away",
      crown: "",
      body: (ctx) => {
        const lockLine = ctx.flags.corrupted
          ? `He works for a long while, sweat on his brow. “This one fights me — of course it does, you fed it your own flesh. I can't cage it, ${ctx.address}. Only… quiet it. It'll stir the moment your story truly needs it. Sooner, if you're not careful.”`
          : ctx.flags.darkPath
            ? `His tools click and turn against your chest. “There. The spark sleeps. What you DID with it won't sleep so easy — but that's a weight for the road, not for tonight.”`
            : `He presses a humming brass device to your chest and turns a dial, gentle as a key in a lock. “There. The spark sleeps. Still yours — just quiet, until the day your story needs it again.”`;
        return [
          `“Here's the thing I didn't tell you at the threshold, ${ctx.address},” Tahar says. “You can't keep this lit. A spark like yours, blazing, draws things you're not ready for. So I'm going to lock it down. Not take it — lock it.”`,
          lockLine,
          "“And one more mercy: you won't remember me. Not this cave, not my name, not a word of tonight. You're walking back into an ordinary life, and I won't have it cluttered with an artificer and a dragon. By morning this is all a half-dream.”",
          "The light under your skin dims and folds inward to a warmth behind the ribs. The memory of his face is already going soft at the edges, like a name you almost have.",
          `“Don't fret — I told you at the threshold you couldn't lose me. You can't, quite.” His voice is fading now. “Some nights you'll wake with your heart pounding and a word on your lips you don't know. Sometimes you'll feel watched over. That's all that's left of me — and it's enough. Now go home, ${ctx.hero}. The years between tonight and the day the spark wakes — your town, your people, who you've been — that's YOURS to write. Make it a good one.”`,
          "And then he's gone, the way he came — between one breath and the next. You walk home under a clearing sky, an ordinary person again, carrying a sleeping light, a dream you can't place, and a story only you can fill in.",
        ];
      },
      upNext: "",
    },

    // Concise ending used by Quick-Lessons mode (skips the capstone/finale).
    "short-graduation": {
      kind: "end",
      xp: 30,
      title: "You're Ready to Play",
      crown: "Pathfinder 2e — The Core",
      body: (ctx) => [
        `That's the core of it, ${ctx.hero}. You can resolve a check and read its degree, run a three-action turn, fight as a party, handle conditions and the dying rules, and build a character of your own.`,
        "“That's everything you actually need to sit down at a table,” Tahar says, packing up his tools. “The rest is just stories — and those, you'll make yourself.”",
        "Grab your sheet from the previous step, find a group, and go play. (Want the full story — the capstone, the choices, the consequences? Start over and pick Full Story.)",
      ],
      upNext: "",
    },
  },
};
