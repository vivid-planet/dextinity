import { Loading } from "@dextinity/admin";
import { useQuery } from "@tanstack/react-query";
import { hc, type InferResponseType, parseResponse } from "hono/client";
import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

import { useApi } from "../../core/client/index.js";
import { allowedScopes, can, type ContentScope } from "../common/permissions.evaluation.js";
import type { PermissionsRoutes } from "../server/permissions.module.js";

type PermissionsClient = ReturnType<typeof hc<PermissionsRoutes>>;

export type CurrentUser = InferResponseType<PermissionsClient["me"]["$get"], 200>;

const CurrentUserContext = createContext<CurrentUser | undefined>(undefined);

/** Loads the current user with its grants (`GET /me`) and renders the children once it's loaded. */
export function CurrentUserProvider({ children }: PropsWithChildren) {
    const { apiUrl } = useApi();
    const client = useMemo(() => hc<PermissionsRoutes>(apiUrl), [apiUrl]);
    const { data: currentUser } = useQuery({ queryKey: ["currentUser"], queryFn: () => parseResponse(client.me.$get()), staleTime: Infinity });

    if (!currentUser) {
        return <Loading behavior="fillPageHeight" />;
    }
    return <CurrentUserContext.Provider value={currentUser}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser(): CurrentUser {
    const currentUser = useContext(CurrentUserContext);
    if (!currentUser) {
        throw new Error("useCurrentUser must be used within a CurrentUserProvider");
    }
    return currentUser;
}

/** Use it to hide UI, the API checks the permissions again. Without a scope, checks whether the permission is granted in any scope. */
export function useCan(permission: string, scope?: ContentScope): boolean {
    return can(useCurrentUser().grants, permission, scope);
}

/** The content scopes of the application the permission is granted in, e.g. for a scope switcher */
export function useAllowedContentScopes(permission: string): ContentScope[] {
    const { grants, contentScopes } = useCurrentUser();
    return useMemo(() => allowedScopes(grants, permission, contentScopes), [grants, permission, contentScopes]);
}
