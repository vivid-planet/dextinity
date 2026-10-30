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
