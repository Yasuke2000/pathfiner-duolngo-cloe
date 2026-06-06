import { test, expect, type Page } from "@playwright/test";

/**
 * Auto-playthrough smoke test.
 *
 * A generic "driver" walks the whole Full-Story course in a real browser:
 * it advances narration, answers choices/quizzes/puzzles (the first option is
 * authored to be the correct/valid one), uses "Surprise me" to build a
 * character, and PLAYS EVERY FIGHT TO COMPLETION (Strike → pick a target →
 * End turn, blocking with the reaction when offered). It then asserts the
 * black-hole finale is reached.
 *
 * The key regression this guards: a combat that never ends. If any fight loops
 * forever (e.g. defeated foes that never drop out), the finale is never reached
 * and this test fails.
 */

// Buttons that simply advance the story, in priority order. "Finish" comes
// before "Surprise me" so the builder's review step proceeds instead of
// re-rolling forever.
const ADVANCE: RegExp[] = [
  /^Full Story/,
  /^Continue your journey/,
  /^Begin your journey/,
  /Roll initiative/,
  /begin the fight/i,
  /^Roll the d20/,
  /^Roll recovery check/,
  /See what happens/,
  /Finish — this hero is yours/,
  /Surprise me/,
  /I'm ready — graduate/,
  /Shield Block/,
  /^Got it/,
  /^Continue/,
];

async function visibleEnabled(page: Page, name: RegExp) {
  const btn = page.getByRole("button", { name }).first();
  try {
    if ((await btn.isVisible({ timeout: 150 })) && (await btn.isEnabled())) return btn;
  } catch {
    /* not present */
  }
  return null;
}

test("Full Story plays end-to-end and every fight terminates", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Full Story/ }).click();

  const seal = page.getByRole("button", { name: /Seal your origin/ });

  for (let step = 0; step < 1000; step++) {
    // Reached the finale?
    if (await seal.isVisible({ timeout: 120 }).catch(() => false)) break;

    // 1) Advance the story / confirm dialogs.
    let acted = false;
    for (const name of ADVANCE) {
      const btn = await visibleEnabled(page, name);
      if (btn) {
        await btn.click();
        acted = true;
        break;
      }
    }
    if (acted) {
      await page.waitForTimeout(80);
      continue;
    }

    // 2) Combat: Strike, then pick a foe target if the encounter asks.
    const strike = await visibleEnabled(page, /^Strike/);
    if (strike) {
      await strike.click();
      const foe = page.locator(".foe-card.clickable").first();
      if (await foe.isVisible({ timeout: 150 }).catch(() => false)) await foe.click();
      await page.waitForTimeout(80);
      continue;
    }
    const endTurn = await visibleEnabled(page, /End turn/);
    if (endTurn) {
      await endTurn.click();
      await page.waitForTimeout(900); // let ally/foe auto-turns resolve
      continue;
    }

    // 3) Any remaining choice/quiz/feat — take the first option.
    const anyBtn = page.locator("button.btn:not([disabled])").first();
    if (await anyBtn.isVisible({ timeout: 150 }).catch(() => false)) {
      await anyBtn.click();
      await page.waitForTimeout(80);
      continue;
    }

    // 4) Probably mid auto-turn; wait and re-check.
    await page.waitForTimeout(250);
  }

  await expect(seal, "the black-hole finale should be reached — no fight should loop forever").toBeVisible();
});

test("the title screen and its modes render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("The Sunken Threshold")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Full Story/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Quick Lessons/ })).toBeVisible();
});
