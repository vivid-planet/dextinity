import { expect, getHistoryLength, openPage, test } from "./browserTest.js";

const heading = (page: import("@playwright/test").Page) => page.getByRole("heading", { level: 1 });

test("hydrates the page without errors", async ({ page, documentRequests }) => {
    await openPage(page, "/pages/first");

    await expect(heading(page)).toHaveText("first");
    expect(documentRequests).toEqual(["/pages/first"]);
});

test("navigates with a Link without a full page load", async ({ page, documentRequests, rscRequests }) => {
    await openPage(page, "/pages/first");
    const historyLength = await getHistoryLength(page);

    await page.getByRole("link", { name: "Second with search", exact: true }).click();

    await expect(heading(page)).toHaveText("second");
    await expect(page).toHaveURL(/\/pages\/second\?page=2$/);
    await expect(page).toHaveTitle("second");
    await expect(page.getByText("Client pathname: /pages/second, page: 2")).toBeVisible();
    expect(await getHistoryLength(page)).toBe(historyLength + 1);
    expect(documentRequests).toEqual(["/pages/first"]);
    expect(rscRequests).toEqual(["/pages/second?page=2"]);
});

test("announces the new page and moves the focus to the start of the document", async ({ page }) => {
    await openPage(page, "/pages/first");

    await page.getByRole("link", { name: "Second", exact: true }).click();

    await expect(page.getByRole("alert")).toHaveText("second");
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
});

test("leaves plain links to the browser", async ({ page, documentRequests, rscRequests }) => {
    await openPage(page, "/pages/first");

    await page.getByRole("link", { name: "Plain link to second", exact: true }).click();

    await expect(heading(page)).toHaveText("second");
    expect(documentRequests).toEqual(["/pages/first", "/pages/second"]);
    expect(rscRequests).toEqual([]);
});

test("leaves clicks with modifier keys and links to other targets to the browser", async ({ page, context, rscRequests }) => {
    await openPage(page, "/pages/first");

    const [modifierClickPage] = await Promise.all([
        context.waitForEvent("page"),
        page.getByRole("link", { name: "Second", exact: true }).click({ modifiers: ["ControlOrMeta"] }),
    ]);
    const [newTabPage] = await Promise.all([
        context.waitForEvent("page"),
        page.getByRole("link", { name: "Second in new tab", exact: true }).click(),
    ]);

    await expect(modifierClickPage).toHaveURL(/\/pages\/second$/);
    await expect(newTabPage).toHaveURL(/\/pages\/second$/);
    await expect(heading(page)).toHaveText("first");
    expect(rscRequests).toEqual([]);
});

test("replaces the history entry with a replacing Link", async ({ page }) => {
    await openPage(page, "/pages/first");
    const historyLength = await getHistoryLength(page);

    await page.getByRole("link", { name: "Replace with second", exact: true }).click();

    await expect(heading(page)).toHaveText("second");
    expect(await getHistoryLength(page)).toBe(historyLength);
});

test("navigates with useRouter()", async ({ page, documentRequests }) => {
    await openPage(page, "/pages/first");
    const historyLength = await getHistoryLength(page);

    await page.getByRole("button", { name: "Push" }).click();
    await expect(heading(page)).toHaveText("pushed");
    expect(await getHistoryLength(page)).toBe(historyLength + 1);

    await page.getByRole("button", { name: "Replace" }).click();
    await expect(heading(page)).toHaveText("replaced");
    await expect(page).toHaveURL(/\/pages\/replaced$/);
    expect(await getHistoryLength(page)).toBe(historyLength + 1);

    const renderCount = await page.getByText(/^Server render \d+$/).textContent();
    await page.getByRole("button", { name: "Refresh" }).click();
    await expect(page.getByText(/^Server render \d+$/)).not.toHaveText(renderCount ?? "");
    await expect(page).toHaveURL(/\/pages\/replaced$/);

    expect(documentRequests).toEqual(["/pages/first"]);
});

test("navigates back and forward without a full page load", async ({ page, documentRequests }) => {
    await openPage(page, "/pages/first");
    await page.getByRole("link", { name: "Second", exact: true }).click();
    await expect(heading(page)).toHaveText("second");

    await page.goBack();
    await expect(heading(page)).toHaveText("first");
    await expect(page).toHaveTitle("first");

    await page.goForward();
    await expect(heading(page)).toHaveText("second");

    expect(documentRequests).toEqual(["/pages/first"]);
});

test("shows the pending state and lets a later navigation win", async ({ page, rscRequests }) => {
    await openPage(page, "/pages/first");

    await page.getByRole("link", { name: "Slow", exact: true }).click();
    await expect(page.getByText("Navigation pending: true")).toBeVisible();
    await page.getByRole("link", { name: "Second", exact: true }).click();

    await expect(heading(page)).toHaveText("second");
    await expect(page.getByText("Navigation pending: false")).toBeVisible();
    await page.waitForTimeout(1500); // Longer than the slow page takes
    await expect(heading(page)).toHaveText("second");
    await expect(page).toHaveURL(/\/pages\/second$/);
    expect(rscRequests).toEqual(["/pages/slow?delay=1000", "/pages/second"]);
});

test("shows the not found page", async ({ page, documentRequests, allowConsoleErrors }) => {
    allowConsoleErrors(/status of 404/);
    await openPage(page, "/pages/first");

    await page.getByRole("link", { name: "Not found", exact: true }).click();

    await expect(page.getByText("Not found page")).toBeVisible();
    await expect(page).toHaveURL(/\/not-found$/);
    expect(documentRequests).toEqual(["/pages/first"]);
});
