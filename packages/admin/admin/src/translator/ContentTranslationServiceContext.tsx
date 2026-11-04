import { createContext } from "react";

export interface ContentTranslationServiceContext {
    enabled: boolean;
    showApplyTranslationDialog?: boolean;
    translate: (text: string) => Promise<string>;
    batchTranslate?: (texts: string[]) => Promise<string[]>;
}

export const ContentTranslationServiceContext = createContext<ContentTranslationServiceContext>({
    enabled: false,
    translate: function (text: string): Promise<string> {
        throw new Error("This is a dummy function for the translation feature that should never be called!");
    },
});
