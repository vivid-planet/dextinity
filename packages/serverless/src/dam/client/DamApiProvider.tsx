import { hc } from "hono/client";
import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

import { useApi } from "../../core/client/index.js";
import type { DamScopeSchema } from "../server/dam.context.js";
import type { DamRoutes } from "../server/dam.module.js";

export type DamScope = Record<string, string>;

export type DamApiClient = ReturnType<typeof hc<DamRoutes<DamScopeSchema>>>;

/** The typed client of the DAM routes, mounted at `${apiUrl}/dam` (see `ApiProvider`) */
export function createDamApiClient(apiUrl: string): DamApiClient {
    // Preview URLs are authenticated, so the admin can show files that aren't published on the site
    return hc<DamRoutes<DamScopeSchema>>(`${apiUrl}/dam`, { headers: { "x-preview-dam-urls": "1" } });
}

interface DamApi {
    client: DamApiClient;
    scope: DamScope;
    /** Prefixes the file and image URLs of the API responses, which are relative to the API */
    resolveUrl: (path: string) => string;
}

const DamApiContext = createContext<DamApi | undefined>(undefined);

/** Provides the typed client of the DAM routes and the scope to work in. */
export function DamApiProvider({ scope, children }: PropsWithChildren<{ scope: DamScope }>) {
    const { apiUrl, resolveUrl } = useApi();
    const value = useMemo<DamApi>(
        () => ({
            client: createDamApiClient(apiUrl),
            scope,
            resolveUrl,
        }),
        [apiUrl, resolveUrl, scope],
    );

    return <DamApiContext.Provider value={value}>{children}</DamApiContext.Provider>;
}

export function useDamApi(): DamApi {
    const damApi = useContext(DamApiContext);
    if (!damApi) {
        throw new Error("useDamApi must be used within a DamApiProvider");
    }
    return damApi;
}
