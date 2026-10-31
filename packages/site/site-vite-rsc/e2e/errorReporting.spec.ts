import type { APIRequestContext } from "@playwright/test";

import { expect, openPage, test } from "./browserTest.js";

// The fixture's reportError module records the messages, the id tells them apart from the errors of other tests
async function getReportedServerErrors(request: APIRequestContext): Promise<string[]> {
    return (await request.get("/reported-errors")).json();
}

function getTestId() {
    return ` (${test.info().project.name} ${test.info().testId})`;
}

test("reports a failing server component", async ({ request }) => {
    const id = getTestId();

    await request.get(`/server-error?id=${encodeURIComponent(id)}`);

    expect(await getReportedServerErrors(request)).toContain(`Server component failed${id}`);
});

test("reports a failing client component during SSR", async ({ request }) => {
    const id = getTestId();

    await request.get(`/client-error?id=${encodeURIComponent(id)}`);

    expect(await getReportedServerErrors(request)).toContain(`Client component failed${id}`);
});

test("reports a failing route handler", async ({ request }) => {
    const id = getTestId();

    await request.get(`/error-in-handler?id=${encodeURIComponent(id)}`);

    expect(await getReportedServerErrors(request)).toContain(`Handler failed${id}`);
});

test("reports a failing client component in the browser", async ({ page, allowConsoleErrors }) => {
    allowConsoleErrors(/Client component failed/, /The above error occurred/);
    await openPage(page, "/pages/first");

    await page.getByRole("link", { name: "Client error", exact: true }).click();

    await expect(page.getByText("Something went wrong.")).toBeVisible();
    expect(await page.evaluate(() => window.reportedErrors)).toContain("Client component failed");
});
