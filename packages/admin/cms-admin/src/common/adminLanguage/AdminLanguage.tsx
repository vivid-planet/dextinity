import { useStoredState } from "@dextinity/admin";
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from "react";

/**
 * Applications augment this interface to type the admin languages, e.g. `interface AdminLanguageOverrides { language: "en" | "de" }`.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AdminLanguageOverrides {}

export type AdminLanguage = AdminLanguageOverrides extends { language: infer Language extends string } ? Language : string;

export interface AdminLanguageConfig {
    /**
     * The languages the admin is translated to. The first one is used when none of the browser languages is supported.
     */
    supportedLanguages: readonly AdminLanguage[];
}

interface AdminLanguageContextValue {
    language: AdminLanguage;
    supportedLanguages: readonly AdminLanguage[];
    setLanguage: (language: AdminLanguage) => void;
}

const AdminLanguageContext = createContext<AdminLanguageContextValue | undefined>(undefined);

export function AdminLanguageProvider({ config, children }: PropsWithChildren<{ config: AdminLanguageConfig | undefined }>) {
    const supportedLanguages = config?.supportedLanguages;
    // Only an explicit choice is stored, so the browser language keeps applying until the user picks one
    const [selectedLanguage, setSelectedLanguage] = useStoredState<string | null>("adminLanguage", null);

    const adminLanguage = useMemo(() => {
        if (!supportedLanguages || supportedLanguages.length === 0) {
            return undefined;
        }

        const language =
            selectedLanguage !== null && supportedLanguages.includes(selectedLanguage)
                ? selectedLanguage
                : getClosestSupportedLanguageFromBrowserLanguages(supportedLanguages, supportedLanguages[0]);

        return { language, supportedLanguages, setLanguage: setSelectedLanguage };
    }, [supportedLanguages, selectedLanguage, setSelectedLanguage]);

    const language = adminLanguage?.language;
    useEffect(() => {
        if (language) {
            document.documentElement.lang = language;
        }
    }, [language]);

    return <AdminLanguageContext.Provider value={adminLanguage}>{children}</AdminLanguageContext.Provider>;
}

export function getClosestSupportedLanguageFromBrowserLanguages(supportedLanguages: readonly string[], fallbackLanguage: string): string {
    const browserLanguages = typeof navigator !== "undefined" ? (navigator.languages ?? [navigator.language]) : [];

    const language = browserLanguages
        .map((browserLanguage) => browserLanguage.split("-")[0].toLowerCase())
        .find((language) => supportedLanguages.includes(language));

    return language ?? fallbackLanguage;
}

export function useOptionalAdminLanguage(): AdminLanguageContextValue | undefined {
    return useContext(AdminLanguageContext);
}

export function useAdminLanguage(): AdminLanguageContextValue {
    const adminLanguage = useOptionalAdminLanguage();

    if (!adminLanguage) {
        throw new Error("No admin languages are configured. Please pass `adminLanguage.supportedLanguages` to `DextinityConfigProvider`.");
    }

    return adminLanguage;
}
