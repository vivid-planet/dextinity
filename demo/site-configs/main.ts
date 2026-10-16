import { Environment, GetSiteConfig } from "./site-configs";

const host = process.env.SERVER_HOST ?? "localhost";
const port = parseInt(process.env.SITE_PORT || "3000", 10);

const envToDomainMap: Record<Environment, string> = {
    // SITE_DOMAIN is set by ./start-deploy-preview.sh for the deploy preview environment, see .deploy-preview/README.md
    local: process.env.SITE_DOMAIN ?? `${host}:${port}`,
};

export default ((env) => {
    return {
        name: "Dextinity Site Main",
        domains: {
            main: envToDomainMap[env],
            additional: ["test.localhost:3000"],
        },
        public: {
            scope: {
                domain: "main",
                languages: ["en", "de"],
            },
            recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY ?? "",
            organization: {
                name: "Vivid Planet Software GmbH",
                url: "https://www.vivid-planet.com",
                logo: "/assets/dextinity-logo.svg",
                sameAs: ["https://github.com/vivid-planet"],
                description: "Vivid Planet Software GmbH develops Dextinity CMS, the open-source content management system.",
            },
        },
    };
}) satisfies GetSiteConfig;
