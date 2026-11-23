import { expect, test, type Page } from "@playwright/test";

/** Give up on every question of the recommended lesson, then return to the overview. */
async function failOneLesson(page: Page) {
  await page.getByRole("button", { name: /Start lesson|Keep practising/ }).click();
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

test("the progress tab tracks what was practised and collects weak words", async ({ page }) => {
  await page.goto("/dutch");
  await page.getByRole("tab", { name: "Progress" }).click();
  await expect(page.getByText("No practice yet")).toBeVisible();
  await expect(page.getByText("Nothing here yet.")).toBeVisible();

  await page.getByRole("tab", { name: "Learn" }).click();
  await failOneLesson(page);

  await page.getByRole("tab", { name: "Progress" }).click();
  // Twelve words, each missed twice (the retry): 24 answers, none correct.
  await expect(page.locator(".dk-kpi").nth(0)).toContainText("12");
  await expect(page.locator(".dk-kpi").nth(2)).toContainText("0%");
  await expect(page.locator(".dk-kpi").nth(2)).toContainText("24 answers");
  await expect(page.locator(".dk-chart-cols .bar")).toHaveCount(1);
  await expect(page.locator(".dk-weak li")).toHaveCount(8);

  // The chart has an accessible table twin.
  await page.getByRole("button", { name: "Show as table" }).click();
  await expect(page.locator(".dk-table tbody tr")).toHaveCount(14);
  await expect(page.locator(".dk-table tbody tr").first()).toContainText("48");

  await page.getByRole("button", { name: "Practise these" }).click();
  await expect(page.locator(".d-lesson")).toBeVisible();
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
