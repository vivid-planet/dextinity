import { test as base } from "@playwright/test";

type BrowserFixtures = {
    /** Documents loaded in the page, a client navigation doesn't add one */
    documentRequests: string[];
    /** Fails the test on errors in the browser, except for the given ones, e.g. of intentionally failing pages */
    allowConsoleErrors: (...patterns: RegExp[]) => void;
};

export const test = base.extend<BrowserFixtures>({
    documentRequests: async ({ page }, provide) => {
        const paths: string[] = [];
        page.on("request", (request) => {
            if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
                paths.push(new URL(request.url()).pathname);
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
