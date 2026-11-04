import { Environment, GetSiteConfig } from "./site-configs";

const host = process.env.SERVER_HOST ?? "localhost";
const port = parseInt(process.env.SITE_PORT || "3000", 10);

const envToDomainMap: Record<Environment, string> = {
    // DEPLOY_PREVIEW_HOST is set by ./start-deploy-preview.sh, see .deploy-preview/README.md
    local: process.env.DEPLOY_PREVIEW_HOST ?? `${host}:${port}`,
    digitalocean: "secondary.demo.digitalocean.dextinity.com",
};

export default ((env) => {
    return {
        name: "Dextinity Site Secondary",
        domains: {
            main: envToDomainMap[env],
        },
        public: {
            scope: {
                domain: "secondary",
                languages: ["en", "de"],
            },
            recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY ?? "",
            organization: {
                name: "Dextinity Site Secondary",
            },
        },
    };
}) satisfies GetSiteConfig;
