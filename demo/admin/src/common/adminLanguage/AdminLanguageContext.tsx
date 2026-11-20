import type { SupportedLanguage } from "@src/lang";
import { createContext, useContext } from "react";

interface AdminLanguageContextValue {
    language: SupportedLanguage;
    languages: readonly SupportedLanguage[];
    setLanguage: (language: SupportedLanguage) => void;
}

export const AdminLanguageContext = createContext<AdminLanguageContextValue | undefined>(undefined);

export function useAdminLanguage(): AdminLanguageContextValue {
    const context = useContext(AdminLanguageContext);
    if (!context) {
        throw new Error("useAdminLanguage must be used within AdminLanguageContext.Provider");
    }
    return context;
}
