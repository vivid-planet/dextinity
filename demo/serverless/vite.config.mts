import { cloudflare } from "@cloudflare/vite-plugin";
import { dextinityDevServer, type DevAccessUser } from "@dextinity/serverless/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const emotionImportMap = {
    "@mui/system": {
        styled: { canonicalImport: ["@emotion/styled", "default"], styledBaseImport: ["@mui/system", "styled"] },
    },
    "@mui/material/styles": {
        styled: { canonicalImport: ["@emotion/styled", "default"], styledBaseImport: ["@mui/material/styles", "styled"] },
    },
};

// The users of the dev-oidc-provider, with groups like an identity provider would send them to Access
const devUsers: DevAccessUser[] = [
    { id: "1", name: "Admin", email: "demo@dextinity.com", groups: ["admins"] },
    { id: "2", name: "Editor", email: "test@test.com", groups: ["editors"] },
    { id: "3", name: "Guest", email: "guest@example.com", groups: [] },
];

// Public file and image URLs, which need a bypass policy in Access
const publicDamPath = /^\/api\/dam\/(files|images)\/(download\/)?[0-9a-f]{40}\//;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        dextinityDevServer({ accessEmulator: { users: devUsers, isPublicPath: (path) => publicDamPath.test(path) } }),
        cloudflare(),
        react({ jsxImportSource: "@emotion/react", plugins: [["@swc/plugin-emotion", { importMap: emotionImportMap }]] }),
    ],
    server: {
        host: process.env.SERVER_HOST ?? "localhost",
        port: Number(process.env.DEMO_SERVERLESS_PORT),
        strictPort: true,
    },
    define: {
        "process.env.NODE_ENV": mode === "production" ? "'production'" : "'development'",
        // The demo site (demo/site), whose block preview renders the blocks; the preview is hidden without it
        "import.meta.env.SITE_URL": JSON.stringify(process.env.PREVIEW_URL),
    },
    environments: {
        // Draft.js, the editor of the rich text block, uses Node's global
        client: { define: { global: "globalThis" } },
    },
}));
