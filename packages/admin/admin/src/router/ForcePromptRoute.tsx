import { type PropsWithChildren, useContext, useEffect } from "react";
import useConstant from "use-constant";
import { v4 as uuid } from "uuid";

import { RouteMatchProvider, useAbsolutePathMatch } from "./internal/routeContext";
import { PromptContext } from "./Prompt";

export function useForcePromptRoute(path: string | undefined) {
    const id = useConstant<string>(() => uuid());
    const context = useContext(PromptContext);
    useEffect(() => {
        if (context && path !== undefined) {
            context.register(id, path);
        }
        return function cleanup() {
            if (context) {
                context.unregister(id);
            }
        };
    });
}

export interface ForcePromptRouteProps {
    /**
     * Absolute path pattern, e.g. `${useSubRoutePrefix()}/:id/edit`. Matches non-exactly.
     */
    path: string;
}

/**
 * Renders its children when `path` matches. Navigating to exactly `path` always asks the enclosing `RouterPrompt`, even inside its `subRoutePath`.
 */
export function ForcePromptRoute({ path, children }: PropsWithChildren<ForcePromptRouteProps>) {
    useForcePromptRoute(path);
    const match = useAbsolutePathMatch(path, { end: false });
    return match ? <RouteMatchProvider match={match}>{children}</RouteMatchProvider> : null;
}
