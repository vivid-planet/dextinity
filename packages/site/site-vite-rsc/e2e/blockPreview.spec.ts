import { expect, openPage, test } from "./browserTest.js";

test("renders the not found page for unknown block preview types", async ({ request }) => {
    const response = await request.get("/block-preview/unknown");

    expect(response.status()).toBe(404);
    expect(await response.text()).toContain("Not found page");
});

test("renders the block the admin sends with the loaded data", async ({ page }) => {
    await openPage(page, "/block-preview/text");

    await page.evaluate(() => window.postMessage(JSON.stringify({ dextinityType: "Block", data: { block: { text: "Hello" } } }), "*"));

    await expect(page.getByText("Preview: Hello (Text)")).toBeVisible();
});

test("renders the block in the state the admin sends", async ({ page }) => {
    await openPage(page, "/block-preview/wrapped-text");

    await page.evaluate(() => window.postMessage(JSON.stringify({ dextinityType: "Block", data: { block: { content: { text: "Hello" } } } }), "*"));

    await expect(page.getByText("Wrapped preview: Hello (WrappedText)")).toBeVisible();
});

test("updates the preview when the admin sends a changed block", async ({ page }) => {
    await openPage(page, "/block-preview/text");

    await page.evaluate(() => window.postMessage(JSON.stringify({ dextinityType: "Block", data: { block: { text: "Hello" } } }), "*"));
    await expect(page.getByText("Preview: Hello (Text)")).toBeVisible();
    await page.evaluate(() => window.postMessage(JSON.stringify({ dextinityType: "Block", data: { block: { text: "Changed" } } }), "*"));

    await expect(page.getByText("Preview: Changed (Text)")).toBeVisible();
});

test("reports a failure to load the block data and renders the next block", async ({ page, allowConsoleErrors }) => {
    allowConsoleErrors(/Loading the block data failed/);
    await openPage(page, "/block-preview/text");
    const sendBlock = (text: string) =>
        page.evaluate((text) => window.postMessage(JSON.stringify({ dextinityType: "Block", data: { block: { text } } }), "*"), text);

    await sendBlock("Hello");
    await expect(page.getByText("Preview: Hello (Text)")).toBeVisible();
    const consoleError = page.waitForEvent("console", (message) => message.type() === "error");
    await sendBlock("Failing");
    expect((await consoleError).text()).toContain("Loading the block data failed");
    await expect(page.getByText("Preview: Hello (Text)")).toBeHidden();
    await sendBlock("Changed");

    await expect(page.getByText("Preview: Changed (Text)")).toBeVisible();
});
