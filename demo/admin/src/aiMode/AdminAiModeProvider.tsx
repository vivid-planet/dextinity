import { AiModeToolsetsProvider, useHasAiModeToolsets, useUserPermissionCheck } from "@dextinity/cms-admin";
import { createConfig } from "@src/config";
import type { PropsWithChildren } from "react";

import { isAiHubConfigured } from "./aiHubConfig";
import { AiModeProvider } from "./AiModeContext";

const config = createConfig();

// The AI Mode is available where a page registers an AI Mode toolset; on any other page, the header says it isn't available yet.
export function AdminAiModeProvider({ children }: PropsWithChildren) {
    const isAllowed = useUserPermissionCheck();

    return (
        <AiModeToolsetsProvider>
            <AiModeProviderForToolsets isEnabled={isAiHubConfigured(config) && isAllowed("aiHub")}>{children}</AiModeProviderForToolsets>
        </AiModeToolsetsProvider>
    );
}

function AiModeProviderForToolsets({ isEnabled, children }: PropsWithChildren<{ isEnabled: boolean }>) {
    const hasToolsets = useHasAiModeToolsets();

    return (
        <AiModeProvider isEnabled={isEnabled} isAvailable={hasToolsets}>
            {children}
        </AiModeProvider>
    );
}
