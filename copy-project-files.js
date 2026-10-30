const fs = require("node:fs");
const path = require("node:path");

const files = [
    ...(process.env.CI === "true"
        ? []
        : [
              {
                  file: ".env",
                  targetDir: ["demo/admin", "demo/api", "demo/site", "demo/site-vite-rsc"],
              },
              {
                  file: ".env.local",
                  targetDir: ["demo/admin", "demo/api", "demo/site", "demo/site-vite-rsc", "storybook"],
              },
              {
                  file: "demo/.env.site-configs",
                  targetDir: ["demo/admin", "demo/api", "demo/site"],
              },
          ]),
    {
        file: "packages/api/cms-api/block-meta.json",
        targetDir: ["packages/admin/cms-admin", "packages/site/site-nextjs", "packages/site/site-react", "packages/site/site-vite-rsc"],
    },
    {
        file: "packages/api/cms-api/schema.gql",
        targetDir: ["packages/admin/cms-admin"],
    },
    {
        file: "packages/api/brevo-api/block-meta.json",
        targetDir: ["packages/admin/brevo-admin", "packages/mail-react"],
    },
    {
        file: "packages/api/brevo-api/schema.gql",
        targetDir: ["packages/admin/brevo-admin"],
    },
    {
        file: "demo/api/block-meta.json",
        targetDir: ["demo/admin", "demo/site", "demo/site-vite-rsc"],
    },
    {
        file: "demo/api/schema.gql",
        targetDir: ["demo/admin", "demo/site", "demo/site-vite-rsc"],
    },
    {
        file: "demo/api/src/dextinity-config.json",
        targetDir: ["demo/admin/src", "demo/site/src", "demo/site-vite-rsc/src"],
    },
    {
        file: "demo/site-configs/site-configs.d.ts",
        targetDir: ["demo/admin/src", "demo/api/src", "demo/site/src", "demo/site-vite-rsc/src"],
    },
];

for (const { file, targetDir } of files) {
    for (const dir of targetDir) {
        const targetFile = `${dir}/${path.basename(file)}`;
        if (process.env.CI === "true") {
            fs.copyFileSync(file, targetFile);
        } else {
            try {
                fs.unlinkSync(targetFile);
            } catch (e) {}
            fs.symlinkSync(path.relative(dir, file), targetFile);
        }
    }
}
