import { expect, getHistoryLength, openPage, test } from "./browserTest.js";

test("follows redirects on the client and replaces the history entry of the redirecting page", async ({ page, documentRequests, rscRequests }) => {
    await openPage(page, "/pages/first");
    const historyLength = await getHistoryLength(page);

    await page.getByRole("link", { name: "Redirect", exact: true }).click();

    await expect(page.getByText("Server pathname: /request")).toBeVisible();
    await expect(page).toHaveURL(/\/request$/);
    expect(await getHistoryLength(page)).toBe(historyLength + 1);
    expect(rscRequests).toEqual(["/redirect", "/request"]);
    expect(documentRequests).toEqual(["/pages/first"]);

    await page.goBack();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("first");
});

test("keeps the fragment and sets the cookies of redirects", async ({ page, context }) => {
    await openPage(page, "/pages/first");

    await page.getByRole("link", { name: "Redirect with cookie", exact: true }).click();

    await expect(page).toHaveURL(/\/request#details$/);
    expect((await context.cookies()).map(({ name, value }) => ({ name, value }))).toEqual([{ name: "redirected", value: "1" }]);
});

test("loads redirect targets on other origins as documents", async ({ page, documentRequests, rscRequests }) => {
    const otherOriginRequests: string[] = [];
    await page.route("https://example.com/**", (route) => {
        otherOriginRequests.push(route.request().resourceType());
        return route.fulfill({ contentType: "text/html", body: "<title>Other origin</title>" });
    });
    await openPage(page, "/pages/first");

    await page.getByRole("link", { name: "Redirect to other origin", exact: true }).click();

    await expect(page).toHaveURL("https://example.com/target");
    expect(otherOriginRequests).toEqual(["document"]);
    expect(documentRequests).toEqual(["/pages/first", "https://example.com/target"]);
    expect(rscRequests).toEqual([`/redirect?location=${encodeURIComponent("https://example.com/target")}`]);
});

test("stops following redirect loops on the client after 20 redirects", async ({ page, documentRequests, rscRequests, allowConsoleErrors }) => {
    allowConsoleErrors(/ERR_TOO_MANY_REDIRECTS/);
    await openPage(page, "/pages/first");

    await page.getByRole("link", { name: "Redirect loop", exact: true }).click();

    await expect.poll(() => documentRequests).toContain("/redirect-loop");
    expect(rscRequests).toEqual(Array<string>(21).fill("/redirect-loop"));
});
