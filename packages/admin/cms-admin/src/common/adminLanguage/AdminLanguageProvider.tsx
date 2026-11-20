import { useStoredState } from "@dextinity/admin";
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from "react";

export interface AdminLanguageContextValue<Language extends string = string> {
    language: Language;
    supportedLanguages: readonly Language[];
    setLanguage: (language: Language) => void;
}

const AdminLanguageContext = createContext<AdminLanguageContextValue | undefined>(undefined);

interface UseAdminLanguageStateOptions<Language extends string> {
    supportedLanguages: readonly Language[];
    fallbackLanguage: Language;
}

export function useAdminLanguageState<Language extends string>({
    supportedLanguages,
    fallbackLanguage,
}: UseAdminLanguageStateOptions<Language>): AdminLanguageContextValue<Language> {
    // Only an explicit choice is stored, so the browser language keeps applying until the user picks one
    const [selectedLanguage, setSelectedLanguage] = useStoredState<string | null>("adminLanguage", null);
    const language = isSupportedLanguage(selectedLanguage, supportedLanguages)
        ? selectedLanguage
        : getClosestSupportedLanguageFromBrowserLanguages(supportedLanguages, fallbackLanguage);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return useMemo(() => ({ language, supportedLanguages, setLanguage: setSelectedLanguage }), [language, supportedLanguages, setSelectedLanguage]);
}

export function getClosestSupportedLanguageFromBrowserLanguages<Language extends string>(
    supportedLanguages: readonly Language[],
    fallbackLanguage: Language,
): Language {
    const browserLanguages = typeof navigator !== "undefined" ? (navigator.languages ?? [navigator.language]) : [];

    const language = browserLanguages
        .map((browserLanguage) => browserLanguage.split("-")[0].toLowerCase())
        .find((language) => isSupportedLanguage(language, supportedLanguages));

    return language ?? fallbackLanguage;
}

function isSupportedLanguage<Language extends string>(language: string | null, supportedLanguages: readonly Language[]): language is Language {
    return supportedLanguages.includes(language as Language);
}

interface AdminLanguageProviderProps<Language extends string> {
    value: AdminLanguageContextValue<Language>;
}

export function AdminLanguageProvider<Language extends string>({ value, children }: PropsWithChildren<AdminLanguageProviderProps<Language>>) {
    return <AdminLanguageContext.Provider value={value as unknown as AdminLanguageContextValue}>{children}</AdminLanguageContext.Provider>;
}

export function useAdminLanguage(): AdminLanguageContextValue | undefined {
    return useContext(AdminLanguageContext);
}
