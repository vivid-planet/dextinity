import { type Page, type Request, test as base } from "@playwright/test";

type BrowserFixtures = {
    /** Documents loaded in the page, a client navigation doesn't add one */
    documentRequests: string[];
    /** RSC requests of client navigations, without the `/_rsc` prefix */
    rscRequests: string[];
    /** Fails the test on errors in the browser, except for the given ones, e.g. of intentionally failing pages */
    allowConsoleErrors: (...patterns: RegExp[]) => void;
};

function getRequestPath(request: Request, baseURL: string | undefined) {
    const url = new URL(request.url());
    return url.origin === new URL(baseURL ?? url.origin).origin ? `${url.pathname}${url.search}` : url.href;
}

export const test = base.extend<BrowserFixtures>({
    documentRequests: async ({ page, baseURL }, provide) => {
        const paths: string[] = [];
        page.on("request", (request) => {
            if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
                paths.push(getRequestPath(request, baseURL));
            }
        });
        await provide(paths);
    },
    rscRequests: async ({ page, baseURL }, provide) => {
        const paths: string[] = [];
        page.on("request", (request) => {
            const path = getRequestPath(request, baseURL);
            if (path.startsWith("/_rsc/")) {
                paths.push(path.slice("/_rsc".length));
            }
        });
        await provide(paths);
    },
    allowConsoleErrors: [
        async ({ page }, provide) => {
            const errors: string[] = [];
            page.on("console", (message) => {
                if (message.type() === "error") {
                    errors.push(message.text());
                }
            });
            page.on("pageerror", (error) => errors.push(error.message));
            const allowedPatterns: RegExp[] = [];
            await provide((...patterns) => allowedPatterns.push(...patterns));
            const unexpectedErrors = errors.filter((error) => !allowedPatterns.some((pattern) => pattern.test(error)));
            if (unexpectedErrors.length > 0) {
                throw new Error(`Unexpected errors in the browser:\n${unexpectedErrors.join("\n")}`);
            }
        },
        { auto: true },
    ],
});

export { expect } from "@playwright/test";

/**
 * Opens the page and waits for the hydration, before it links are full page loads
 */
export async function openPage(page: Page, path: string) {
    await page.goto(path);
    await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
}

export function getScrollY(page: Page) {
    return page.evaluate(() => window.scrollY);
}

export async function scrollTo(page: Page, scrollY: number) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
}

export function getHistoryLength(page: Page) {
    return page.evaluate(() => window.history.length);
}

/**
 * Clicks without scrolling the link into view first, like Playwright's `click()` does, to test the scroll handling
 */
export async function clickInPlace(page: Page, linkName: string) {
    await page.getByRole("link", { name: linkName, exact: true }).dispatchEvent("click");
}
