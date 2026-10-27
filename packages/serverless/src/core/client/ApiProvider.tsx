import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

interface Api {
    /** e.g. `/api`. The feature packages create their typed clients below it, e.g. `${apiUrl}/dam`. */
    apiUrl: string;
    /** Prefixes paths of API responses (e.g. file URLs), which are relative to the API */
    resolveUrl: (path: string) => string;
}

const ApiContext = createContext<Api | undefined>(undefined);

export function ApiProvider({ apiUrl, children }: PropsWithChildren<{ apiUrl: string }>) {
    const value = useMemo<Api>(() => ({ apiUrl, resolveUrl: (path) => `${apiUrl}${path}` }), [apiUrl]);
    return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi(): Api {
    const api = useContext(ApiContext);
    if (!api) {
        throw new Error("useApi must be used within an ApiProvider");
    }
    return api;
}
