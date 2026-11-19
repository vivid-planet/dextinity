import { AiModeScopesProvider, useHasAiModeScopes, useUserPermissionCheck } from "@dextinity/cms-admin";
import { createConfig } from "@src/config";
import type { PropsWithChildren } from "react";

import { isAiHubConfigured } from "./aiHubConfig";
import { AiModeProvider } from "./AiModeContext";

const config = createConfig();

// The AI Mode is available where a page registers an AI Mode scope; on any other page, the header says it isn't available yet.
export function AdminAiModeProvider({ children }: PropsWithChildren) {
    const isAllowed = useUserPermissionCheck();

    return (
        <AiModeScopesProvider>
            <AiModeProviderForScopes isEnabled={isAiHubConfigured(config) && isAllowed("aiHub")}>{children}</AiModeProviderForScopes>
        </AiModeScopesProvider>
    );
}

function AiModeProviderForScopes({ isEnabled, children }: PropsWithChildren<{ isEnabled: boolean }>) {
    const hasScopes = useHasAiModeScopes();

    return (
        <AiModeProvider isEnabled={isEnabled} isAvailable={hasScopes}>
            {children}
        </AiModeProvider>
    );
}
