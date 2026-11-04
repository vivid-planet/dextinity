import { expect, test } from "./browserTest";

test("navigates on the client and keeps the state of client components", async ({ page, goto, documentRequests }) => {
    await goto("/");
    await page.getByRole("button", { name: "Clicked 0 times" }).click();

    await page.getByRole("link", { name: "Cached" }).click();

    await expect(page.getByRole("heading", { name: "Cached page" })).toBeVisible();
    await expect(page).toHaveTitle("Cached");
    await expect(page.getByRole("button", { name: "Clicked 1 times" })).toBeVisible();
    expect(documentRequests).toEqual(["/"]);
});

test("follows redirects of loaders on the client", async ({ page, goto }) => {
    await goto("/");

    await page.getByRole("link", { name: "Redirect" }).click();

    await expect(page).toHaveURL("/cached");
    await expect(page.getByRole("heading", { name: "Cached page" })).toBeVisible();
});

test("renders the error boundary of the page for a 404 on the client", async ({ page, goto, allowConsoleErrors }) => {
    allowConsoleErrors(/status of 404/);
    await goto("/");

    await page.getByRole("link", { name: "Not found" }).click();

    await expect(page.getByText("Page error 404")).toBeVisible();
    await expect(page.getByRole("button", { name: "Clicked 0 times" })).toBeVisible();
});

test("renders the error boundary of the page for errors of server components on the client", async ({ page, goto, allowConsoleErrors }) => {
    allowConsoleErrors(
        /Server component failed|Server Components render|Minified React error #441/,
        /Reported error/,
        /React Router caught the following error/,
    );
    await goto("/");

    await page.getByRole("link", { name: "Render error" }).click();

    await expect(page.getByText("Page error 500")).toBeVisible();
});

test("replaces persisted queries of client components with their hash", async ({ page, goto }) => {
    await goto("/");

    await expect(page.locator("#client-query")).toHaveText(/^\{"hash":"[0-9a-f]{64}"/);
});
