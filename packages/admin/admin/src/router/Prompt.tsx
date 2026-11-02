import { createContext, type PropsWithChildren, useContext, useEffect, useRef } from "react";
import type { Location, NavigationType } from "react-router";
import useConstant from "use-constant";
import { v4 as uuid } from "uuid";

import { RouterContext } from "./Context";
import type { ResetAction, SaveAction } from "./PromptHandler";
import { useCurrentRouteMatch } from "./RouteMatch";
import { SubRoute, useSubRoutePrefix } from "./SubRoute";

type PromptRoute = {
    path: string;
};
export type PromptRoutes = Record<string, PromptRoute>;
interface PromptContext {
    register: (id: string, path: string) => void;
    unregister: (id: string) => void;
}
export const PromptContext = createContext<PromptContext | undefined>(undefined);

// react-router Prompt doesn't support multiple Prompts, this one does
interface IProps {
    /**
     * Will be called with the next location and action the user is attempting to navigate to.
     * Return a string to show a prompt to the user or true to allow the transition.
     */
    message: (location: Location, action: NavigationType) => boolean | string;
    saveAction?: SaveAction;
    resetAction?: ResetAction;
    subRoutePath?: string;
}
export const RouterPrompt = ({ message, saveAction, resetAction, subRoutePath, children }: PropsWithChildren<IProps>) => {
    const id = useConstant<string>(() => uuid());
    const { path } = useCurrentRouteMatch();
    const context = useContext(RouterContext);
    const subRoutePrefix = useSubRoutePrefix();
    const promptRoutes = useRef<PromptRoutes>({});
    if (subRoutePath && subRoutePath.startsWith("./")) {
        subRoutePath = subRoutePrefix + subRoutePath.substring(1);
    }
    useEffect(() => {
        if (context) {
            context.register({ id, message, saveAction, resetAction, path, subRoutePath, promptRoutes });
        } else {
            console.error("Can't register RouterPrompt, missing <RouterPromptHandler>");
        }
        return function cleanup() {
            if (context) {
                context.unregister(id);
            }
        };
    });
    const childrenWithSubRoute = subRoutePath ? <SubRoute path={subRoutePath}>{children}</SubRoute> : children;
    return (
        <PromptContext.Provider
            value={{
                register: (id: string, path: string) => {
                    promptRoutes.current[id] = { path };
                },
                unregister: (id: string) => {
                    delete promptRoutes.current[id];
                },
            }}
        >
            {childrenWithSubRoute}
        </PromptContext.Provider>
    );
};
