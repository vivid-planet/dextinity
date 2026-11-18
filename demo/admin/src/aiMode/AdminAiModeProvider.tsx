import { useContentScope, useUserPermissionCheck } from "@dextinity/cms-admin";
import { createConfig } from "@src/config";
import type { PropsWithChildren } from "react";
import { matchPath, useLocation } from "react-router";

import { isAiHubConfigured } from "./aiHubConfig";
import { AiModeProvider } from "./AiModeContext";
import { AiModePageStateProvider } from "./AiModePageStateContext";
import { AiModePageToolsProvider } from "./AiModePageToolsContext";

const config = createConfig();

// The AI Mode works in the page tree only; on any other page, the header says it isn't available yet. The page tree
// route is below the content scope, so this has to be too.
export function AdminAiModeProvider({ children }: PropsWithChildren) {
    const { match } = useContentScope();
    const { pathname } = useLocation();
    const pageTreeRouteMatch = matchPath({ path: `${match.url}/pages/pagetree`, end: false }, pathname);
    const isAllowed = useUserPermissionCheck();

    return (
        <AiModeProvider isEnabled={isAiHubConfigured(config) && isAllowed("aiHub")} isAvailable={pageTreeRouteMatch !== null}>
            <AiModePageStateProvider>
                <AiModePageToolsProvider>{children}</AiModePageToolsProvider>
            </AiModePageStateProvider>
        </AiModeProvider>
    );
}
