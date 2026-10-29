import { defineConfig } from "@playwright/test";

const viteConfig = "e2e/fixture/vite.config.ts";
const devPort = Number(process.env.E2E_DEV_PORT ?? 3910);
const buildPort = Number(process.env.E2E_BUILD_PORT ?? 3911);

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
            command: `vite --config ${viteConfig} --port ${devPort} --strictPort`,
            url: `http://localhost:${devPort}/`,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: `vite build --config ${viteConfig} && vite preview --config ${viteConfig} --port ${buildPort} --strictPort`,
            url: `http://localhost:${buildPort}/`,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
        },
    ],
});
