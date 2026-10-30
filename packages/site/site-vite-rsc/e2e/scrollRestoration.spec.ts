import { clickInPlace, expect, getScrollY, openPage, scrollTo, test } from "./browserTest.js";

const heading = (page: import("@playwright/test").Page) => page.getByRole("heading", { level: 1 });

const getMaxScrollY = (page: import("@playwright/test").Page) => page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

// A different origin than localhost, like a link to another site
const getOtherSiteUrl = (baseURL: string | undefined, path: string) => new URL(path, baseURL?.replace("localhost", "127.0.0.1")).href;

test("scrolls to the top after navigating", async ({ page }) => {
    await openPage(page, "/pages/first");
    await scrollTo(page, 1500);

    await clickInPlace(page, "Second");

    await expect(heading(page)).toHaveText("second");
    expect(await getScrollY(page)).toBe(0);
});

test("keeps the scroll position for Links with scroll={false}", async ({ page }) => {
    await openPage(page, "/pages/first");
    await scrollTo(page, 1500);

    await clickInPlace(page, "Second without scrolling");

    await expect(heading(page)).toHaveText("second");
    expect(await getScrollY(page)).toBe(1500);
});

test("restores the scroll positions on back and forward", async ({ page }) => {
    await openPage(page, "/pages/first");
    await scrollTo(page, 1500);
    await clickInPlace(page, "Second");
    await expect(heading(page)).toHaveText("second");
    await scrollTo(page, 800);

    await page.goBack();
    await expect(heading(page)).toHaveText("first");
    await expect.poll(() => getScrollY(page)).toBe(1500);

    await page.goForward();
    await expect(heading(page)).toHaveText("second");
    await expect.poll(() => getScrollY(page)).toBe(800);
});

test("restores the scroll positions after a reload", async ({ page }) => {
    await openPage(page, "/pages/first");
    await scrollTo(page, 1500);
    await clickInPlace(page, "Second");
    await expect(heading(page)).toHaveText("second");
    await scrollTo(page, 800);

    await page.reload();
    await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
    await expect.poll(() => getScrollY(page)).toBe(800);

    await page.goBack();
    await expect(heading(page)).toHaveText("first");
    await expect.poll(() => getScrollY(page)).toBe(1500);
});

test("restores the scroll position after a reload when the page grows until it's loaded", async ({ page }) => {
    await openPage(page, "/pages/first?imageDelay=1000");
    await page.waitForLoadState("load");
    await scrollTo(page, await getMaxScrollY(page));
    const scrollY = await getScrollY(page);

    await page.reload();

    await page.waitForLoadState("load");
    await expect.poll(() => getScrollY(page)).toBe(scrollY);
});

test("restores the scroll position when returning from another site", async ({ page, baseURL }) => {
    await openPage(page, "/pages/first?imageDelay=1000");
    await page.waitForLoadState("load");
    await scrollTo(page, await getMaxScrollY(page));
    const scrollY = await getScrollY(page);
    await page.goto(getOtherSiteUrl(baseURL, "/pages/other"));

    await page.goBack();

    await expect(heading(page)).toHaveText("first");
    await expect.poll(() => getScrollY(page)).toBe(scrollY);
});

test("restores the scroll position of an entry left by a client navigation when returning from another site", async ({ page, baseURL }) => {
    await openPage(page, "/pages/first");
    await scrollTo(page, 1500);
    await clickInPlace(page, "Second");
    await expect(heading(page)).toHaveText("second");
    await page.goto(getOtherSiteUrl(baseURL, "/pages/other"));

    await page.evaluate(() => window.history.go(-2));

    await expect(heading(page)).toHaveText("first");
    await expect.poll(() => getScrollY(page)).toBe(1500);
});

test("scrolls to the fragment of the target page", async ({ page }) => {
    await openPage(page, "/pages/first");

    await clickInPlace(page, "Section of second");

    await expect(heading(page)).toHaveText("second");
    await expect(page).toHaveURL(/\/pages\/second#section$/);
    await expect
        .poll(() => page.getByRole("heading", { name: "Section" }).evaluate((element) => element.getBoundingClientRect().top))
        .toBeCloseTo(0, 0);
});

test("leaves fragments on the current page to the browser", async ({ page, rscRequests }) => {
    await openPage(page, "/pages/first");

    await clickInPlace(page, "Section");

    await expect(page).toHaveURL(/\/pages\/first#section$/);
    await expect.poll(() => getScrollY(page)).toBeGreaterThan(0);

    await page.goBack();
    await expect.poll(() => getScrollY(page)).toBe(0);
    expect(rscRequests).toEqual([]);
});
