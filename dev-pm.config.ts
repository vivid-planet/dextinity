import { defineConfig } from "dev-process-manager";

const packageFolderMapping = {
    "@dextinity/admin": "packages/admin/admin",
    "@dextinity/admin-color-picker": "packages/admin/admin-color-picker",
    "@dextinity/admin-date-time": "packages/admin/admin-date-time",
    "@dextinity/admin-icons": "packages/admin/admin-icons",
    "@dextinity/admin-rte": "packages/admin/admin-rte",
    "@dextinity/cms-admin": "packages/admin/cms-admin",
    "@dextinity/brevo-admin": "packages/admin/brevo-admin",
    "@dextinity/cms-api": "packages/api/cms-api",
    "@dextinity/brevo-api": "packages/api/brevo-api",
    "@dextinity/site-nextjs": "packages/site/site-nextjs",
    "@dextinity/site-react": "packages/site/site-react",
};

const waitOnPackages = (...packages: (keyof typeof packageFolderMapping)[]) => {
    return packages.map((packageName) => `${packageFolderMapping[packageName]}/lib/index.d.ts`);
};

export default defineConfig({
    scripts: [
        // group admin
        {
            name: "dextinity-admin",
            script: "pnpm --filter @dextinity/admin run start",
            group: ["dextinity-admin"],
            waitOn: waitOnPackages("@dextinity/admin-icons"),
        },
        {
            name: "dextinity-admin-color-picker",
            script: "pnpm --filter @dextinity/admin-color-picker run start",
            group: ["dextinity-admin"],
            waitOn: waitOnPackages("@dextinity/admin"),
        },
        {
            name: "dextinity-admin-date-time",
            script: "pnpm --filter @dextinity/admin-date-time run start",
            group: ["dextinity-admin"],
            waitOn: waitOnPackages("@dextinity/admin-icons", "@dextinity/admin"),
        },
        {
            name: "dextinity-admin-icons",
            script: "pnpm --filter @dextinity/admin-icons run start",
            group: ["dextinity-admin"],
        },
        {
            name: "dextinity-admin-rte",
            script: "pnpm --filter @dextinity/admin-rte run start",
            group: ["dextinity-admin"],
        },

        // admin-generator
        {
            name: "admin-generator",
            script: "pnpm --filter @dextinity/admin-generator run dev",
            group: ["cms-admin", "cms"],
            waitOn: waitOnPackages("@dextinity/cms-admin"),
        },

        // group cms-admin
        {
            name: "cms-admin",
            script: "pnpm --filter @dextinity/cms-admin run start",
            group: ["cms-admin", "cms"],
            waitOn: waitOnPackages("@dextinity/admin", "@dextinity/admin-icons", "@dextinity/admin-rte"),
        },
        {
            name: "cms-admin-codegen-graphql-types",
            script: "pnpm --filter @dextinity/cms-admin run gql:watch",
            group: ["cms-admin", "cms"],
            waitOn: waitOnPackages("@dextinity/admin", "@dextinity/admin-icons", "@dextinity/admin-rte"),
        },
        {
            name: "cms-admin-codegen-block-types",
            script: "pnpm --filter @dextinity/cms-admin run generate-block-types:watch",
            group: ["cms-admin", "cms"],
            waitOn: waitOnPackages("@dextinity/admin", "@dextinity/admin-icons", "@dextinity/admin-rte"),
        },

        //group cms-api
        {
            name: "cms-api",
            script: "pnpm --filter @dextinity/cms-api run dev",
            group: ["cms-api", "cms"],
        },
        {
            name: "cms-api-codegen-schema",
            script: "pnpm --filter @dextinity/cms-api run generate-schema:watch",
            group: ["cms-api", "cms"],
        },
        {
            name: "cms-api-codegen-block-meta",
            script: "pnpm --filter @dextinity/cms-api run generate-block-meta:watch",
            group: ["cms-api", "cms"],
        },
        // api-generator
        {
            name: "api-generator",
            script: "pnpm --filter @dextinity/api-generator run dev",
            group: ["cms-api", "cms"],
            waitOn: waitOnPackages("@dextinity/cms-api"),
        },

        //group site-nextjs
        {
            name: "site-nextjs",
            script: "pnpm --filter @dextinity/site-nextjs run dev",
            group: ["site-nextjs", "cms"],
            waitOn: [...waitOnPackages("@dextinity/site-react")],
        },
        {
            name: "site-nextjs-codegen-block-types",
            script: "pnpm --filter @dextinity/site-nextjs run generate-block-types:watch",
            group: ["site-nextjs", "cms"],
            waitOn: [...waitOnPackages("@dextinity/site-react")],
        },

        //group site-react
        {
            name: "site-react",
            script: "pnpm --filter @dextinity/site-react run dev",
            group: ["site-react", "site-nextjs", "cms"],
        },
        {
            name: "site-react-codegen-block-types",
            script: "pnpm --filter @dextinity/site-react run generate-block-types:watch",
            group: ["site-react", "site-nextjs", "cms"],
        },

        //group mail-react
        {
            name: "mail-react",
            script: "pnpm --filter @dextinity/mail-react run dev",
            group: ["mail-react"],
        },
        {
            name: "mail-react-storybook",
            script: "pnpm --filter @dextinity/mail-react run storybook",
            group: ["mail-react"],
        },

        //group brevo
        {
            name: "brevo-api",
            script: "pnpm --filter @dextinity/brevo-api run dev",
            group: ["brevo", "brevo-api"],
            waitOn: waitOnPackages("@dextinity/cms-api"),
        },
        {
            name: "brevo-api-codegen-schema",
            script: "pnpm --filter @dextinity/brevo-api run generate-schema:watch",
            group: ["brevo", "brevo-api"],
            waitOn: waitOnPackages("@dextinity/cms-api"),
        },
        {
            name: "brevo-api-codegen-block-meta",
            script: "pnpm --filter @dextinity/brevo-api run generate-block-meta:watch",
            group: ["brevo", "brevo-api"],
            waitOn: waitOnPackages("@dextinity/cms-api"),
        },
        {
            name: "brevo-admin",
            script: "pnpm --filter @dextinity/brevo-admin run start",
            group: ["brevo", "brevo-admin"],
            waitOn: waitOnPackages("@dextinity/admin", "@dextinity/admin-date-time", "@dextinity/cms-admin"),
        },
        {
            name: "brevo-admin-codegen-graphql-types",
            script: "pnpm --filter @dextinity/brevo-admin run gql:watch",
            group: ["brevo", "brevo-admin"],
            waitOn: waitOnPackages("@dextinity/admin", "@dextinity/admin-date-time", "@dextinity/cms-admin"),
        },
        {
            name: "brevo-admin-codegen-block-types",
            script: "pnpm --filter @dextinity/brevo-admin run generate-block-types:watch",
            group: ["brevo", "brevo-admin"],
            waitOn: waitOnPackages("@dextinity/admin", "@dextinity/admin-date-time", "@dextinity/cms-admin"),
        },

        //group demo admin
        {
            name: "demo-admin",
            script: "pnpm --filter dextinity-demo-admin run start",
            group: ["demo-admin", "demo"],
            waitOn: [
                ...waitOnPackages("@dextinity/admin", "@dextinity/admin-icons", "@dextinity/admin-rte", "@dextinity/cms-admin", "@dextinity/brevo-admin"),
                "tcp:$API_PORT",
            ],
        },
        {
            name: "demo-admin-codegen",
            script: "pnpm --filter dextinity-demo-admin run gql:watch",
            group: ["demo-admin", "demo"],
            waitOn: ["tcp:$API_PORT"],
        },
        {
            name: "demo-admin-block-codegen",
            script: "pnpm --filter dextinity-demo-admin run generate-block-types:watch",
            group: ["demo-admin", "demo"],
            waitOn: ["tcp:$API_PORT"],
        },
        {
            name: "demo-oidc-provider",
            script: "pnpm run dev:oidc-provider",
            group: ["demo-admin", "demo"],
        },
        {
            name: "demo-oauth2-proxy",
            script: "pnpm run dev:oauth2-proxy",
            group: ["demo-admin", "demo"],
            waitOn: ["tcp:$IDP_PORT", "tcp:$ADMIN_PORT"],
        },

        //group demo api
        {
            name: "demo-docker",
            script: "set -a; . .env; . .env.local; set +a; docker compose up",
            group: ["demo-api", "demo"],
        },
        {
            name: "demo-api-generator",
            script: "pnpm --filter dextinity-demo-api exec dextinity-api-generator generate --watch",
            group: ["demo-api", "demo"],
            waitOn: [...waitOnPackages("@dextinity/cms-api"), "packages/api/api-generator/lib/apiGenerator.js"],
        },
        {
            name: "demo-api",
            script: "pnpm --filter dextinity-demo-api run start:dev",
            group: ["demo-api", "demo"],
            waitOn: [...waitOnPackages("@dextinity/cms-api", "@dextinity/brevo-api"), "tcp:$POSTGRESQL_PORT", "tcp:$IMGPROXY_PORT"],
        },
        {
            name: "demo-api-block-codegen",
            script: "pnpm --filter dextinity-demo-api run generate-block-types:watch",
            group: ["demo-api", "demo"],
        },
        {
            name: "demo-api-storybook",
            script: "pnpm --filter dextinity-demo-api run storybook",
        },

        //group demo site
        {
            name: "demo-site",
            script: "pnpm --filter dextinity-demo-site run dev",
            group: ["demo-site", "demo"],
            waitOn: [...waitOnPackages("@dextinity/site-nextjs"), "tcp:$API_PORT"],
        },
        {
            name: "demo-site-codegen",
            script: "pnpm --filter dextinity-demo-site run gql:watch",
            group: ["demo-site", "demo"],
            waitOn: ["tcp:$API_PORT"],
        },
        {
            name: "demo-site-block-codegen",
            script: "pnpm --filter dextinity-demo-site run generate-block-types:watch",
            group: ["demo-site", "demo"],
            waitOn: ["tcp:$API_PORT"],
        },
        {
            name: "demo-site-css-types",
            script: "pnpm --filter dextinity-demo-site run css:types:watch",
            group: ["demo-site", "demo"],
        },

        // group docs
        {
            name: "storybook",
            script: "pnpm --filter dextinity-storybook run storybook",
            group: ["storybook", "docs"],
            waitOn: ["tcp:26646", "tcp:26647"], // storybook-dextinity-admin, storybook-dextinity-cms-admin
        },
        {
            name: "docs",
            script: "pnpm --filter dextinity-docs start",
            group: ["docs"],
            waitOn: ["tcp:26638"], // storybook
        },
        {
            name: "storybook-dextinity-admin",
            script: "pnpm --filter @dextinity/admin run storybook",
            group: ["storybook", "docs"],
            waitOn: waitOnPackages("@dextinity/admin"),
        },
        {
            name: "storybook-dextinity-cms-admin",
            script: "pnpm --filter @dextinity/cms-admin run storybook",
            group: ["storybook", "docs"],
            waitOn: waitOnPackages("@dextinity/cms-admin"),
        },
    ],
});
