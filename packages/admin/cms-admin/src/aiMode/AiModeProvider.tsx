import { useStoredState } from "@dextinity/admin";
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from "react";

import { type Permission, useUserPermissionCheck } from "../userPermissions/hooks/currentUser";
import { isAiHubConfigured } from "./aiHubConfig";
import { AiModeToolsetsProvider, useHasAiModeToolsets } from "./AiModeToolsets";

/** @experimental */
export type AiModeProviderProps = {
    /** The script of the AI Hub's `ai-hub-chat` web component. Without it, the AI Mode is off. */
    webComponentScriptSrc?: string;
    /** The AI Hub widget the chat runs on. Without it, the AI Mode is off. */
    widgetId?: string;
    /** The API route that forwards the chat's requests to the AI Hub API with the widget's secret key, which must not reach the browser. */
    aiHubProxyUrl: string;
    /** The MCP server the chat registers, which the agent reads the API with. */
    mcpServerUrl: string;
    /** The permission a user needs for the AI Mode. The AI Hub proxy and the MCP server should require it as well. */
    requiredPermission: Permission;
};

type AiModeChatConfig = Pick<AiModeProviderProps, "aiHubProxyUrl" | "mcpServerUrl"> & {
    webComponentScriptSrc: string;
    widgetId: string;
};

type AiModeContextValue = {
    /** Whether the AI Hub is configured and the user has the required permission. */
    isEnabled: boolean;
    /** Whether the page that is open registers an AI Mode toolset. */
    isAvailable: boolean;
    isOpen: boolean;
    toggle: () => void;
};

const AiModeContext = createContext<AiModeContextValue>({ isEnabled: false, isAvailable: false, isOpen: false, toggle: () => undefined });

const AiModeChatConfigContext = createContext<AiModeChatConfig | null>(null);

/**
 * Turns the AI Mode on for the admin within, and collects the AI Mode toolsets of its pages. `AiModeHeaderItem` and
 * `AiModeSidePanel` render nothing outside of it or while the AI Mode is off.
 *
 * @experimental
 */
export function AiModeProvider({
    webComponentScriptSrc,
    widgetId,
    aiHubProxyUrl,
    mcpServerUrl,
    requiredPermission,
    children,
}: PropsWithChildren<AiModeProviderProps>) {
    const isAllowed = useUserPermissionCheck();

    const chatConfig = useMemo(() => {
        const config = { webComponentScriptSrc, widgetId, aiHubProxyUrl, mcpServerUrl };
        return isAiHubConfigured(config) && isAllowed(requiredPermission) ? config : null;
    }, [webComponentScriptSrc, widgetId, aiHubProxyUrl, mcpServerUrl, isAllowed, requiredPermission]);

    return (
        <AiModeToolsetsProvider>
            <AiModeChatConfigContext.Provider value={chatConfig}>
                <AiModeStateProvider isEnabled={chatConfig !== null}>{children}</AiModeStateProvider>
            </AiModeChatConfigContext.Provider>
        </AiModeToolsetsProvider>
    );
}

function AiModeStateProvider({ isEnabled, children }: PropsWithChildren<{ isEnabled: boolean }>) {
    const isAvailable = useHasAiModeToolsets();
    const [isStoredOpen, setIsOpen] = useStoredState<boolean>("ai-mode-open", false);
    // The stored state is kept while a page without the AI Mode is open, so the side panel opens again on returning to one with it.
    const isOpen = isEnabled && isAvailable && isStoredOpen;

    const toggle = useCallback(() => {
        setIsOpen((value) => !value);
    }, [setIsOpen]);

    const value = useMemo(() => ({ isEnabled, isAvailable, isOpen, toggle }), [isEnabled, isAvailable, isOpen, toggle]);

    return <AiModeContext.Provider value={value}>{children}</AiModeContext.Provider>;
}

export function useAiMode() {
    return useContext(AiModeContext);
}

export function useAiModeChatConfig() {
    return useContext(AiModeChatConfigContext);
}
