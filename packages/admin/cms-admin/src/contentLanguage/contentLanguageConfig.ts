import { useDextinityConfig } from "../config/DextinityConfigContext";
import type { ContentScope } from "../contentScope/Provider";

export type ContentLanguageConfig = {
    resolveContentLanguageForScope: (scope: ContentScope) => string;
};

export function useContentLanguageConfig(): ContentLanguageConfig {
    const dextinityConfig = useDextinityConfig();

    if (!dextinityConfig.contentLanguage) {
        return { resolveContentLanguageForScope: () => "en" };
    }

    return dextinityConfig.contentLanguage;
}
