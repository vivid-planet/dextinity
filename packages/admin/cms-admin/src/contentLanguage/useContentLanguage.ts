import type { ContentScope } from "../contentScope/Provider";
import { useContentLanguageConfig } from "./contentLanguageConfig";

interface UseContentLanguageOptions {
    scope: ContentScope;
}

export function useContentLanguage({ scope }: UseContentLanguageOptions): string {
    const { resolveContentLanguageForScope } = useContentLanguageConfig();

    return resolveContentLanguageForScope(scope);
}
