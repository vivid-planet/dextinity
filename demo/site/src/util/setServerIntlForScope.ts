import { setServerIntl } from "@dextinity/site-nextjs/server";

import { loadMessages } from "./loadMessages";
import { getSiteConfigForDomain } from "./siteConfig";

export async function setServerIntlForScope({ domain, language }: { domain: string; language: string }) {
    const { languages } = getSiteConfigForDomain(domain).scope;
    const supportedLanguage = languages.includes(language) ? language : "en";

    setServerIntl(supportedLanguage, await loadMessages(supportedLanguage));
}
