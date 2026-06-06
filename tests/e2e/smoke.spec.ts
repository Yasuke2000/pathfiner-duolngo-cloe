import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * Auto-playthrough smoke tests.
 *
 * A generic "driver" walks a whole course in a real browser: it advances
 * narration, answers choices/quizzes/puzzles (the first option is authored to
 * be the correct/valid one), uses "Surprise me" to build a character, and
 * resolves every fight — either by playing it out (Strike → target → End turn,
 * blocking on the reaction) or, in "flee" mode, by falling back and letting
 * Tahar finish it. Each run asserts it reaches a terminal beat.
 *
 * The key regression these guard: a combat that never ends. If any fight loops
 * forever, the terminal beat is never reached and the test fails.
 */

const ADVANCE: RegExp[] = [
  /^Continue your journey/,
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

async function ve(page: Page, name: RegExp): Promise<Locator | null> {
  const btn = page.getByRole("button", { name }).first();
  try {
    if ((await btn.isVisible({ timeout: 150 })) && (await btn.isEnabled())) return btn;
  } catch {
    /* not present */
  }
  return null;
}

async function play(page: Page, opts: { start: RegExp; flee?: boolean; done: () => Locator }) {
  await page.goto("/");
  await page.getByRole("button", { name: opts.start }).first().click();

  for (let i = 0; i < 1200; i++) {
    if (await opts.done().isVisible({ timeout: 120 }).catch(() => false)) return true;

    let acted = false;
    for (const name of ADVANCE) {
      const btn = await ve(page, name);
      if (btn) {
        await btn.click();
        acted = true;
        break;
      }
    }
    if (acted) {
      await page.waitForTimeout(70);
      continue;
    }

    // Flee mode: prefer falling back over fighting.
    if (opts.flee) {
      const fb = await ve(page, /Fall back/);
      if (fb) {
        await fb.click();
        await page.waitForTimeout(80);
        continue;
      }
    }

    // Combat: Strike, then pick a foe target if the encounter asks.
    const strike = await ve(page, /^Strike/);
    if (strike) {
      await strike.click();
      const foe = page.locator(".foe-card.clickable").first();
      if (await foe.isVisible({ timeout: 150 }).catch(() => false)) await foe.click();
      await page.waitForTimeout(70);
      continue;
    }
    const endTurn = await ve(page, /End turn/);
    if (endTurn) {
      await endTurn.click();
      await page.waitForTimeout(900);
      continue;
    }

    // Any remaining choice/quiz/feat — take the first option.
    const any = page.locator("button.btn:not([disabled])").first();
    if (await any.isVisible({ timeout: 150 }).catch(() => false)) {
      await any.click();
      await page.waitForTimeout(70);
      continue;
    }

    await page.waitForTimeout(250);
  }
  return false;
}

test("Full Story: play every fight to completion → reach the finale", async ({ page }) => {
  const seal = () => page.getByRole("button", { name: /Seal your origin/ });
  const reached = await play(page, { start: /^Full Story/, done: seal });
  expect(reached, "no fight should loop forever — the finale should be reached").toBe(true);
  await expect(seal()).toBeVisible();
});

test("Full Story: 'Fall back' through every fight → still reach the finale", async ({ page }) => {
  const seal = () => page.getByRole("button", { name: /Seal your origin/ });
  const reached = await play(page, { start: /^Full Story/, flee: true, done: seal });
  expect(reached, "fleeing each fight should still reach the finale").toBe(true);
  await expect(seal()).toBeVisible();
});

test("Quick Lessons: reaches the concise graduation", async ({ page }) => {
  const done = () => page.getByText(/The Core/);
  const reached = await play(page, { start: /^Quick Lessons/, done });
  expect(reached, "Quick Lessons should reach its graduation").toBe(true);
  await expect(done()).toBeVisible();
});

test("the title screen and its modes render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("The Sunken Threshold")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Full Story/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Quick Lessons/ })).toBeVisible();
});
