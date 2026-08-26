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
        },
    };
}) satisfies GetSiteConfig;
