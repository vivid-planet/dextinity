import { useContext, useEffect } from "react";
import { Route, type RouteProps } from "react-router";
import useConstant from "use-constant";

import { PromptContext } from "./Prompt";

export function ForcePromptRoute(props: RouteProps) {
    const id = useConstant<string>(() => crypto.randomUUID());
    const context = useContext(PromptContext);
    useEffect(() => {
        if (context) {
            context.register(id, props.path as string);
        }
        return function cleanup() {
            if (context) {
                context.unregister(id);
            }
        };
    });
    return <Route {...props} />;
}
