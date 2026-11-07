import { deDE as coreDe, enUS as coreEn } from "@mui/material/locale";
import type { ResolvedIntlConfig } from "react-intl";

import dextinity_demo_messages_de from "../lang-compiled/dextinity-demo-lang-admin/de.json";
import dextinity_demo_messages_en from "../lang-compiled/dextinity-demo-lang-admin/en.json";
import dextinity_messages_de from "../lang-compiled/dextinity-lang/de.json";
import dextinity_messages_en from "../lang-compiled/dextinity-lang/en.json";

const supportedLanguages = ["en", "de"] as const;
type SupportedLanguage = (typeof supportedLanguages)[number];

const fallbackLanguage: SupportedLanguage = "en";

function getClosestSupportedLanguageFromBrowserLanguages(): SupportedLanguage {
    const browserLanguages = typeof navigator !== "undefined" ? (navigator.languages ?? [navigator.language]) : [];

    const language = browserLanguages
        .map((browserLanguage) => browserLanguage.split("-")[0].toLowerCase())
        .find((language): language is SupportedLanguage => supportedLanguages.includes(language as SupportedLanguage));

    return language ?? fallbackLanguage;
}

const dextinityMessages = {
    en: dextinity_messages_en,
    de: dextinity_messages_de,
} satisfies Record<SupportedLanguage, ResolvedIntlConfig["messages"]>;

const dextinityDemoMessages = {
    en: dextinity_demo_messages_en,
    de: dextinity_demo_messages_de,
} satisfies Record<SupportedLanguage, ResolvedIntlConfig["messages"]>;

function getMessages(language: SupportedLanguage): ResolvedIntlConfig["messages"] {
    return {
        ...dextinityMessages[language],
        ...dextinityDemoMessages[language],
    };
}

const muiLocales: Record<SupportedLanguage, object[]> = {
    en: [coreEn],
    de: [coreDe],
};

export function getLanguageConfig(): {
    language: SupportedLanguage;
    messages: ResolvedIntlConfig["messages"];
    muiLocale: object[];
} {
    const language = getClosestSupportedLanguageFromBrowserLanguages();

    return {
        language,
        messages: getMessages(language),
        muiLocale: muiLocales[language],
    };
}
