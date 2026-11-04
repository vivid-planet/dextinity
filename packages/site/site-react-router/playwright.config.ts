import { defineConfig } from "@playwright/test";

const devPort = Number(process.env.E2E_DEV_PORT ?? 3920);
const buildPort = Number(process.env.E2E_BUILD_PORT ?? 3921);
const env = { SITE_PREVIEW_SECRET: "e2e-site-preview-secret" };

// Each test runs against the dev server and the production build, as they differ e.g. in error messages and module loading
export default defineConfig({
    testDir: "e2e",
    forbidOnly: !!process.env.CI,
    reporter: process.env.CI ? [["list"], ["junit", { outputFile: "junit-e2e.xml" }]] : "list",
    projects: [
        { name: "dev", use: { baseURL: `http://localhost:${devPort}` } },
        { name: "build", use: { baseURL: `http://localhost:${buildPort}` } },
    ],
    webServer: [
        {
            command: "node server.ts",
            cwd: "e2e/fixture",
            env: { ...env, PORT: String(devPort) },
            url: `http://localhost:${devPort}/`,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: "react-router build && node server.ts",
            cwd: "e2e/fixture",
            env: { ...env, PORT: String(buildPort), NODE_ENV: "production" },
            url: `http://localhost:${buildPort}/`,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
        },
    ],
});
