import { useContext, useEffect } from "react";
import useConstant from "use-constant";
import { v4 as uuid } from "uuid";

import { PromptContext } from "./Prompt";
import { AbsoluteRoute, type AbsoluteRouteProps } from "./RouteMatch";

export function ForcePromptRoute({ path, exact, children }: AbsoluteRouteProps) {
    const id = useConstant<string>(() => uuid());
    const context = useContext(PromptContext);
    useEffect(() => {
        if (context) {
            context.register(id, path);
        }
        return function cleanup() {
            if (context) {
                context.unregister(id);
            }
        };
    });
    return (
        <AbsoluteRoute path={path} exact={exact}>
            {children}
        </AbsoluteRoute>
    );
}
