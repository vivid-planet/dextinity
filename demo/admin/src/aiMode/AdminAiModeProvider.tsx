import { useContentScope } from "@dextinity/cms-admin";
import { createConfig } from "@src/config";
import type { PropsWithChildren } from "react";
import { useRouteMatch } from "react-router";

import { isAiHubConfigured } from "./aiHubConfig";
import { AiModeProvider } from "./AiModeContext";

const config = createConfig();

// The AI Mode works in the page tree only; on any other page, the header says it isn't available yet. The page tree
// route is below the content scope, so this has to be too.
export function AdminAiModeProvider({ children }: PropsWithChildren) {
    const { match } = useContentScope();
    const pageTreeRouteMatch = useRouteMatch(`${match.path}/pages/pagetree`);

    return (
        <AiModeProvider isEnabled={isAiHubConfigured(config)} isAvailable={pageTreeRouteMatch !== null}>
            {children}
        </AiModeProvider>
    );
}
