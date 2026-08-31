import { Environment, GetSiteConfig } from "./site-configs";

const host = process.env.SERVER_HOST ?? "localhost";
const port = parseInt(process.env.SITE_PORT || "3000", 10);

const envToDomainMap: Record<Environment, string> = {
    local: `${host}:${port}`,
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
                // schema.org accepts either a URL or an ImageObject as the logo; this config uses the URL form.
                // It must point at an image file in a format Google Images supports, at least 112x112px, and crawlable for rich results.
                logo: "/assets/dextinity-logo.png",
                sameAs: ["https://github.com/vivid-planet"],
                description: "Vivid Planet Software GmbH develops Dextinity, the open-source content management system.",
            },
        },
    };
}) satisfies GetSiteConfig;
