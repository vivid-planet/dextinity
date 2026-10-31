import { expect, openPage, test } from "./browserTest.js";

test("loads the page fully when a client navigation renders a client component of another build", async ({
    page,
    documentRequests,
    rscRequests,
    allowConsoleErrors,
}) => {
    allowConsoleErrors(/client reference not found 'otherBuild'/, /The above error occurred/);
    await openPage(page, "/pages/first");

    await page.getByRole("link", { name: "Client component of other build", exact: true }).click();

    await expect(page.getByText("Rendered client component of other build")).toBeVisible();
    expect(rscRequests).toEqual(["/client-component-of-other-build"]);
    expect(documentRequests).toEqual(["/pages/first", "/client-component-of-other-build"]);
});
