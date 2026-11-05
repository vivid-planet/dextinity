import { expect, openPage, test } from "./browserTest.js";

for (const { link, error } of [
    { link: "Server error", error: /Server component failed|An error occurred in the Server Components render|Minified React error #441/ },
    { link: "Client error", error: /Client component failed/ },
]) {
    test(`shows the error fallback for the ${link.toLowerCase()} and resets it on the next navigation`, async ({ page, allowConsoleErrors }) => {
        allowConsoleErrors(error, /The above error occurred/);
        await openPage(page, "/pages/first");

        await page.getByRole("link", { name: link, exact: true }).click();

        await expect(page.getByText("Something went wrong.")).toBeVisible();
        await expect(page).toHaveTitle("Error");

        await page.goBack();
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("first");
    });
}
