---
"@dextinity/site-vite-rsc": minor
---

Add `@dextinity/site-vite-rsc`

The counterpart to `@dextinity/site-nextjs` for sites built with Vite, React Server Components (`@vitejs/plugin-rsc`) and Hono. It re-exports `@dextinity/site-react`.

Add the `dextinitySite()` Vite plugins to the `vite.config.ts` of the site:

```ts
import { dextinitySite } from "@dextinity/site-vite-rsc/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        dextinitySite({
            entries: {
                rsc: "./src/framework/entry.rsc.tsx",
                ssr: "./src/framework/entry.ssr.tsx",
                client: "./src/framework/entry.browser.tsx",
            },
        }),
    ],
});
```

It sets up `@vitejs/plugin-rsc` and `@vitejs/plugin-react`, ignores the `.env` files of the project and builds the client assets into `_assets`.
Pin `react-server-dom-webpack` to exactly the version of `react` used by the site.
