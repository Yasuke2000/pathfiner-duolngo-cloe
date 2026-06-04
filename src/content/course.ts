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
        "“This one we roll for. Leap when you're ready.”",
      ],
      next: "chasm",
    },

    chasm: {
      kind: "check",
      prompt: "Leap the chasm — Athletics vs DC 15",
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
      lines: [
        "On the far ledge, Bram dusts off her hands. “See what just happened? Same jump, same dice — but the result had texture. That's the four degrees doing their work.”",
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
      next: "end",
    },

    end: {
      kind: "end",
      xp: 15,
      title: "Lesson Complete",
      crown: "Degrees of Success",
      body: [
        "Bram claps you on the shoulder. “That's the engine the whole game runs on. Roll, add, compare to the DC, read the degree. Everything else is detail.”",
        "You can now resolve any check in Pathfinder 2e — and you know that failing is just the story's next turn, not a wall.",
      ],
      upNext:
        "The Three-Action Economy — the heart of every Pathfinder turn, where most new players stumble.",
    },
  },
};
