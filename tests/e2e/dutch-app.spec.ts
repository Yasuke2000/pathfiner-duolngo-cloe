import { expect, test, type Page } from "@playwright/test";

/** Give up on every question of the lesson that is open, then return to the overview. */
async function giveUpOnAll(page: Page) {
  for (let i = 0; i < 150; i++) {
    if (await page.getByRole("button", { name: "Another lesson" }).isVisible({ timeout: 80 }).catch(() => false)) break;
    const next = page.getByRole("button", { name: /^(Next|Finish)$/ });
    if (await next.isVisible({ timeout: 80 }).catch(() => false)) {
      await next.click();
      continue;
    }
    const idk = page.getByRole("button", { name: "I don't know" });
    if (await idk.isVisible({ timeout: 80 }).catch(() => false)) await idk.click();
  }
  await page.getByRole("button", { name: "Back to overview" }).click();
}

/** Give up on every question of the recommended lesson. */
async function failOneLesson(page: Page) {
  await page.getByRole("button", { name: /Start lesson|Keep practising/ }).click();
  await giveUpOnAll(page);
}

/** Miss every question of the low-level code unit (twice each, because of the retry). */
async function failLowLevelCode(page: Page) {
  const unit = page.locator(".d-unit", { hasText: "Low-level concepts in code" });
  await unit.getByRole("button", { name: "Practise" }).click();
  await giveUpOnAll(page);
}

test("the interface is English by default and switches to Dutch, persistently", async ({ page }) => {
  await page.goto("/dutch");
  await expect(page.getByRole("tab", { name: "Learn" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Dictionary" })).toBeVisible();
  await expect(page.getByText("Start here").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Practise" }).first()).toBeVisible();

  await page.getByRole("button", { name: "NL", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Leren" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Woordenboek" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Oefenen" }).first()).toBeVisible();

  await page.reload();
  await expect(page.getByRole("tab", { name: "Leren" })).toBeVisible();

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Learn" })).toBeVisible();
});

test("a lesson runs in English too", async ({ page }) => {
  await page.goto("/dutch");
  await page.getByRole("button", { name: "Start lesson" }).click();
  await expect(page.getByText("What does this mean?")).toBeVisible();
  await page.locator(".d-option").first().click();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.locator(".d-feedback")).toBeVisible();
  await expect(page.getByRole("button", { name: /^(Next|Finish)$/ })).toBeVisible();
});

test("the light theme can be switched on and is remembered", async ({ page }) => {
  await page.goto("/dutch");
  const root = page.locator(".dk");
  await expect(root).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(root).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator(".dk")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();
});

test("her progress page stays basic: a few numbers and what to work on", async ({ page }) => {
  await page.goto("/dutch");
  await page.getByRole("tab", { name: "Progress" }).click();
  await expect(page.getByRole("heading", { name: "What to work on" })).toBeVisible();
  await expect(page.getByText("Nothing here yet.")).toBeVisible();
  // No charts or tables for the learner — the detail is in the coach view.
  await expect(page.locator(".dk-chart")).toHaveCount(0);
  await expect(page.locator(".dk-table")).toHaveCount(0);
  await expect(page.locator(".dk-kpi")).toHaveCount(3);

  await page.getByRole("tab", { name: "Learn" }).click();
  await failOneLesson(page);
  await failLowLevelCode(page);

  await page.getByRole("tab", { name: "Progress" }).click();
  await expect(page.locator(".dk-kpi").first()).toContainText("12");
  await expect(page.locator(".dk-weak li")).toHaveCount(8);
  // The code questions she missed are grouped into concepts she can practise.
  const concepts = page.locator(".dk-worklist li");
  await expect(concepts.first()).toBeVisible();
  await expect(concepts.first()).toContainText("0 of");
  await concepts.first().getByRole("button", { name: "Practise" }).click();
  await expect(page.locator(".d-code")).toBeVisible();
});

test("a backup file restores progress after everything was erased", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await page.goto("/dutch");
  await failOneLesson(page);
  await page.getByRole("tab", { name: "Progress" }).click();
  await expect(page.locator(".dk-kpi").first()).toContainText("12");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download backup" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^code-en-koffie-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const path = await download.path();

  await page.getByRole("button", { name: "Erase all progress" }).click();
  await expect(page.locator(".dk-kpi").first()).toContainText("0");

  await page.getByTestId("backup-file").setInputFiles(path);
  await expect(page.getByText(/Imported\. 12 words/)).toBeVisible();
  await expect(page.locator(".dk-kpi").first()).toContainText("12");
});

test("a transfer code moves progress to a clean browser", async ({ browser }) => {
  const a = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
  const laptop = await a.newPage();
  await laptop.goto("/dutch");
  await failOneLesson(laptop);
  await laptop.getByRole("tab", { name: "Progress" }).click();
  await laptop.getByRole("button", { name: "Copy transfer code" }).click();
  const code = await laptop.locator("textarea[readonly]").inputValue();
  expect(code).toMatch(/^CK1\.[A-Za-z0-9_-]+$/);
  await a.close();

  // A second, completely separate browser profile: the "phone".
  const b = await browser.newContext();
  const phone = await b.newPage();
  await phone.goto("/dutch");
  await phone.getByRole("tab", { name: "Progress" }).click();
  await expect(phone.locator(".dk-kpi").first()).toContainText("0");
  await phone.getByLabel("Transfer code from another device").fill(code);
  await phone.getByRole("button", { name: "Import code" }).click();
  await expect(phone.getByText(/Imported\. 12 words/)).toBeVisible();
  await expect(phone.locator(".dk-kpi").first()).toContainText("12");

  // Garbage is refused politely.
  await phone.getByLabel("Transfer code from another device").fill("not a code");
  await phone.getByRole("button", { name: "Import code" }).click();
  await expect(phone.getByText("That is not a Code & Koffie backup.")).toBeVisible();
  await b.close();
});

test("the coach view shows what she got wrong, from a report she sent", async ({ browser }) => {
  // Her browser: miss a vocabulary lesson and a low-level code lesson, then export.
  const hers = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
  const her = await hers.newPage();
  await her.goto("/dutch");
  await failOneLesson(her);
  await failLowLevelCode(her);
  await her.getByRole("tab", { name: "Progress" }).click();
  await her.getByRole("button", { name: "Copy transfer code" }).click();
  const code = await her.locator("textarea[readonly]").inputValue();
  await hers.close();

  // The owner's browser: nothing of hers is stored here.
  const mine = await browser.newContext();
  const coach = await mine.newPage();
  await coach.goto("/dutch/coach");
  await expect(coach.getByRole("heading", { name: "Coach view" }).first()).toBeVisible();

  await coach.getByLabel("Report code").fill("rubbish");
  await coach.getByRole("button", { name: "Open code" }).click();
  await expect(coach.locator(".dk-msg.err")).toContainText("not a Code & Koffie backup");

  await coach.getByLabel("Report code").fill(code);
  await coach.getByRole("button", { name: "Open code" }).click();

  // Headline numbers.
  await expect(coach.locator(".dk-kpi").first()).toContainText("Today");
  await expect(coach.getByText("0%").first()).toBeVisible();

  // Concepts that need attention: every low-level concept she touched scored zero.
  const attention = coach.locator(".dk-panel", { hasText: "Needs attention" }).first();
  await expect(attention.locator(".dk-meterlist li").first()).toBeVisible();
  await expect(attention).toContainText("Low-level");

  // A missed question opens to the code, her answer and the right answer.
  const missed = coach.locator(".dk-missed details");
  await expect(missed).toHaveCount(8);
  await missed.first().locator("summary").click();
  await expect(missed.first().locator(".d-code")).toBeVisible();
  await expect(missed.first()).toContainText("didn't know");
  await expect(missed.first().locator("dd.good")).toBeVisible();

  // The full concept table, per-type accuracy and the mistake log are there.
  await expect(coach.locator(".dk-table.concept tbody tr")).toHaveCount(44);
  await expect(coach.locator(".dk-panel", { hasText: "By exercise type" })).toContainText("Read the code");
  await expect(coach.locator(".dk-table.mistakes tbody tr").first()).toBeVisible();
  await expect(coach.locator(".dk-chart")).toBeVisible();

  // Nothing was written into the owner's own progress.
  const stored = await coach.evaluate(() => window.localStorage.getItem("dutch-progress-v1"));
  expect(stored).toBeNull();
  await mine.close();
});

test("the coach view can also read the progress of this browser", async ({ page }) => {
  await page.goto("/dutch");
  await failOneLesson(page);
  await page.getByRole("tab", { name: "Progress" }).click();
  await page.getByRole("link", { name: "Open the coach view" }).click();
  await page.getByRole("button", { name: "Use this browser's own progress" }).click();
  await expect(page.locator(".dk-table.mistakes tbody tr")).toHaveCount(24);
  await expect(page.getByText("No code question missed so far.")).toBeVisible();
  await page.getByRole("button", { name: "Open another report" }).click();
  await expect(page.getByRole("button", { name: "Open report file" })).toBeVisible();
});

test("a learning path narrows the course to one role and is remembered", async ({ page }) => {
  await page.goto("/dutch");
  // Everything: student material and professional material are both there.
  await expect(page.getByRole("heading", { name: "Life in Flanders", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "IT operations & support", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "IT professional" }).click();
  await expect(page.getByRole("heading", { name: "IT operations & support", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Artificial intelligence", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Life in Flanders", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Maths & theory", exact: true })).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("button", { name: "IT professional" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Life in Flanders", exact: true })).toHaveCount(0);

  // The professional material is really there and runs.
  await page.locator(".d-unit", { hasText: "Working with AI" }).getByRole("button", { name: "Practise" }).click();
  await expect(page.locator(".d-code")).toBeVisible();
});

test("a real assignment can be read with every hard word explained", async ({ page }) => {
  await page.goto("/dutch");
  await expect(page.getByRole("heading", { name: "Real assignments" })).toBeVisible();
  await page.getByRole("button", { name: "Read the assignment" }).click();

  await expect(page.getByRole("heading", { name: "De bibliotheek" })).toBeVisible();
  for (const h of ["Inleiding", "De klasse Lid", "De klasse Boek", "De klasse Ontlening", "De klasse Balie", "De klasse Applicatie"]) {
    await expect(page.getByRole("heading", { name: h, exact: true })).toBeVisible();
  }

  // Tapping a word explains it in place; tapping again closes it.
  const word = page.getByRole("button", { name: "bijgehouden" }).first();
  await word.click();
  const card = page.locator(".dk-gloss-card");
  await expect(card).toContainText("bijhouden");
  await expect(card).toContainText("to keep track of");
  await expect(card).toContainText("make a field for it");
  await word.click();
  await expect(card).toHaveCount(0);

  // The formal words that trip people up are all tappable.
  for (const w of ["indien", "reeds", "betreffende", "overeenkomstige", "aangezien", "uiteraard"]) {
    // Case-insensitive: "Aangezien" opens its sentence with a capital.
    await expect(page.getByRole("button", { name: new RegExp(`^${w}$`, "i") }).first()).toBeVisible();
  }

  // English is hidden until asked for.
  await expect(page.getByText("The data is stored as Strings.")).toHaveCount(0);
  await page.getByRole("button", { name: "Show English" }).click();
  await expect(page.getByText("The data is stored as Strings.").first()).toBeVisible();

  // The summary spells out what is asked, class by class.
  await page.getByText("Check your reading: what you are asked to build").click();
  await expect(page.locator(".dk-assign-classes section")).toHaveCount(5);
  await expect(page.locator(".dk-assign-classes")).toContainText("brengTerug(int id)");
});

test("the assignment leads to questions, and back again", async ({ page }) => {
  await page.goto("/dutch");
  await page.getByRole("button", { name: "Read the assignment" }).click();
  await page.getByRole("button", { name: /What is being asked/ }).first().click();

  await expect(page.locator(".d-code.prose")).toBeVisible();
  await expect(page.getByText(/Read the task/)).toBeVisible();
  await page.locator(".d-option").first().click();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.locator(".d-feedback .d-def")).toBeVisible();

  // Leaving the lesson returns to the assignment, not to the overview.
  await page.getByRole("button", { name: "Stop the lesson" }).click();
  await expect(page.getByRole("heading", { name: "De bibliotheek" })).toBeVisible();

  // The word list and the sentences are one tap away too.
  await page.getByRole("button", { name: /^The words/ }).first().click();
  await expect(page.locator(".d-lesson")).toBeVisible();
  await page.getByRole("button", { name: "Stop the lesson" }).click();
  await page.getByRole("button", { name: "← Back to overview" }).click();
  await expect(page.getByRole("button", { name: "Read the assignment" })).toBeVisible();
});
