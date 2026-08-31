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
                // Supported formats are the ones Google Images supports: BMP, GIF, JPEG, PNG, WebP and SVG.
                // The image must be at least 112x112px and reachable by crawlers (not blocked in robots.txt).
                logo: "/assets/dextinity-logo.png",
                sameAs: ["https://github.com/vivid-planet"],
                description: "Vivid Planet Software GmbH develops Dextinity, the open-source content management system.",
            },
        },
    };
}) satisfies GetSiteConfig;
