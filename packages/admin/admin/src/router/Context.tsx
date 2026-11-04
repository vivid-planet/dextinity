import type * as History from "history";
import { createContext, type RefObject } from "react";

import type { PromptRoutes } from "./Prompt";
import type { ResetAction, SaveAction } from "./PromptHandler";

interface IContext {
    register: (options: {
        id: string;
        message: (location: History.Location, action: History.Action) => string | boolean;
        saveAction?: SaveAction;
        resetAction?: ResetAction;
        path: string;
        subRoutePath?: string;
        promptRoutes?: RefObject<PromptRoutes>;
    }) => void;
    unregister: (id: string) => void;
}

export const RouterContext = createContext<IContext | undefined>(undefined);
