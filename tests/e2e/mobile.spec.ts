import { expect, test, type Page } from "@playwright/test";

/**
 * Phone checks. Everything here runs at 360 px wide — a small Android phone —
 * with touch enabled. Three things matter on a phone and are easy to break:
 * nothing may scroll sideways, every control must be big enough for a thumb,
 * and no text field may be small enough to make iOS zoom the page.
 */
test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });

/** Elements the page itself scrolls sideways on purpose. */
const SCROLLERS = ".d-code, .dk-table-scroll, .dk-tabs, .dk-path-chips";

async function expectPhoneFriendly(page: Page, label: string) {
  const report = await page.evaluate((scrollers) => {
    const vw = window.innerWidth;
    const overflow = document.documentElement.scrollWidth - vw;
    const small: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(".dk button, .dk a, .dk summary"))) {
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      if (el.closest(scrollers) && b.right > vw) continue; // scrolled out of view
      if (b.height < 40 || b.width < 40) {
        small.push(`${el.className} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 20)}" ${Math.round(b.width)}x${Math.round(b.height)}`);
      }
    }
    const tiny: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("input, textarea"))) {
      if (el.offsetParent === null) continue;
      if (parseFloat(getComputedStyle(el).fontSize) < 16) tiny.push(el.className);
    }
    return { overflow, small, tiny };
  }, SCROLLERS);
  expect(report.overflow, `${label}: page scrolls sideways`).toBeLessThanOrEqual(0);
  expect(report.small, `${label}: controls too small for a thumb`).toEqual([]);
  expect(report.tiny, `${label}: fields that make iOS zoom`).toEqual([]);
}

test("every screen of the course fits a phone", async ({ page }) => {
  await page.goto("/dutch");
  await expect(page.getByRole("button", { name: "Start lesson" })).toBeVisible();
  await expectPhoneFriendly(page, "learn");

  await page.getByRole("tab", { name: "Dictionary" }).tap();
  await page.getByRole("searchbox").fill("de");
  await expect(page.locator(".dk-term").first()).toBeVisible();
  await expectPhoneFriendly(page, "dictionary");

  await page.getByRole("tab", { name: "Grammar" }).tap();
  await expect(page.locator(".dk-acc-body")).toBeVisible();
  await expectPhoneFriendly(page, "grammar");

  await page.getByRole("tab", { name: "Progress" }).tap();
  await expect(page.getByRole("heading", { name: "What to work on" })).toBeVisible();
  await expectPhoneFriendly(page, "progress");
});

test("a lesson can be done by thumb, and the answer button stays on screen", async ({ page }) => {
  await page.goto("/dutch");
  // A code lesson has the longest questions: a snippet, a question and four long options.
  await page.locator(".d-unit", { hasText: "Reading logs, config & APIs" }).getByRole("button", { name: "Practise" }).tap();
  await expect(page.locator(".d-code")).toBeVisible();
  await expectPhoneFriendly(page, "code lesson");

  for (let i = 0; i < 60; i++) {
    if (await page.getByRole("button", { name: "Another lesson" }).isVisible({ timeout: 80 }).catch(() => false)) break;
    const next = page.getByRole("button", { name: /^(Next|Finish)$/ });
    if (await next.isVisible({ timeout: 80 }).catch(() => false)) {
      await expect(next).toBeInViewport(); // sticky action bar
      await next.tap();
      continue;
    }
    // Without scrolling at all, "Check" must already be reachable.
    await expect(page.getByRole("button", { name: "Check" })).toBeInViewport();
    await page.locator(".d-option").first().tap();
    await page.getByRole("button", { name: "Check" }).tap();
  }
  await expect(page.getByRole("button", { name: "Another lesson" })).toBeVisible();
  await expectPhoneFriendly(page, "lesson summary");
});

test("the coach view is readable on a phone", async ({ page }) => {
  await page.goto("/dutch");
  await page.locator(".d-unit", { hasText: "Terminal & commands" }).getByRole("button", { name: "Practise" }).tap();
  for (let i = 0; i < 80; i++) {
    if (await page.getByRole("button", { name: "Another lesson" }).isVisible({ timeout: 80 }).catch(() => false)) break;
    const next = page.getByRole("button", { name: /^(Next|Finish)$/ });
    if (await next.isVisible({ timeout: 80 }).catch(() => false)) {
      await next.tap();
      continue;
    }
    const idk = page.getByRole("button", { name: "I don't know" });
    if (await idk.isVisible({ timeout: 80 }).catch(() => false)) await idk.tap();
  }
  await page.goto("/dutch/coach");
  await expectPhoneFriendly(page, "coach loader");
  await page.getByRole("button", { name: "Use this browser's own progress" }).tap();
  await expect(page.locator(".dk-missed details").first()).toBeVisible();
  await page.locator(".dk-missed details").first().locator("summary").tap();
  await expectPhoneFriendly(page, "coach dashboard");
  // The tables have turned into stacked cards: no header row is shown.
  await expect(page.locator(".dk-table.concept thead")).toBeHidden();
});

test("the menu and the Pathfinder pages do not scroll sideways either", async ({ page }) => {
  for (const url of ["/", "/play", "/about", "/create", "/gm"]) {
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, url).toBeLessThanOrEqual(0);
  }
});
