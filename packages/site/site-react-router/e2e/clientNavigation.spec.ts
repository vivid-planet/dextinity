import { expect, test } from "./browserTest";

test("hydrates the page and navigates on the client", async ({ page, documentRequests }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Home page" })).toBeVisible();
    await page.waitForFunction(() => "__reactRouterRouteModules" in window);

    await page.getByRole("link", { name: "Cached" }).click();

    await expect(page.getByRole("heading", { name: "Cached page" })).toBeVisible();
    expect(documentRequests).toEqual(["/"]);
});

test("follows redirects on the client", async ({ page, documentRequests }) => {
    await page.goto("/");
    await page.waitForFunction(() => "__reactRouterRouteModules" in window);

    await page.getByRole("link", { name: "Redirect" }).click();

    await expect(page).toHaveURL(/\/cached$/);
    await expect(page.getByRole("heading", { name: "Cached page" })).toBeVisible();
    expect(documentRequests).toEqual(["/"]);
});

test("renders the error boundary for not found pages and errors after client navigation", async ({ page, allowConsoleErrors }) => {
    allowConsoleErrors(/404|500/);
    await page.goto("/");
    await page.waitForFunction(() => "__reactRouterRouteModules" in window);

    await page.getByRole("link", { name: "Not found" }).click();
    await expect(page.getByText("Page error 404")).toBeVisible();

    await page.getByRole("link", { name: "Server error" }).click();
    await expect(page.getByText("Page error 500")).toBeVisible();
});
