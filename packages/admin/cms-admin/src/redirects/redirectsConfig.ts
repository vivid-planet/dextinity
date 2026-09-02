import { useDextinityConfig } from "../config/DextinityConfigContext";
import { type ContentScope, useContentScope } from "../contentScope/Provider";

export interface RedirectsConfig {
    scopeParts?: string[];
}

function useRedirectsConfig(): RedirectsConfig {
    const dextinityConfig = useDextinityConfig();

    if (!dextinityConfig.redirects) {
        throw new Error("No redirects configuration found. Make sure to set `redirects` in `DextinityConfigProvider`.");
    }

    return dextinityConfig.redirects;
}

export function useRedirectsScope(): ContentScope {
    const { scopeParts } = useRedirectsConfig();
    const { scope: completeScope } = useContentScope();

    const redirectScope = scopeParts?.length
        ? scopeParts.reduce((acc, scopePart) => {
              acc[scopePart] = completeScope[scopePart];
              return acc;
          }, {} as ContentScope)
        : completeScope;

    return redirectScope;
}
