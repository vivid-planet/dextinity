import { MasterLayoutContext, useWindowSize } from "@dextinity/admin";
import { useContentScope, useCurrentUser } from "@dextinity/cms-admin";
import { Slide, useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { createConfig } from "@src/config";
import { useCallback, useContext, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

import type { BridgeElement } from "./aiHubBridge";
import { useAiMode } from "./AiModeContext";
import { ScriptLoader } from "./ScriptLoader";
import { useTextSelectionStore } from "./textSelection";

export const aiModeFlyoutWidth = 400;

const contextPushDebounceMs = 300;

const config = createConfig();

// The chat sends its requests to the API, which forwards them to the AI Hub API with the secret key.
const aiHubProxyUrl = `${config.apiUrl}/ai-hub`;

const mcpServerUrl = `${config.apiUrl}/mcp`;

export function AiModeFlyout() {
    const { isOpen } = useAiMode();
    const { headerHeight } = useContext(MasterLayoutContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const windowSize = useWindowSize();
    const intl = useIntl();
    const location = useLocation();
    const { scope } = useContentScope();
    const user = useCurrentUser();

    const bridgeRef = useRef<BridgeElement | null>(null);
    const textSelectionStore = useTextSelectionStore();

    const pushContext = useCallback(() => {
        bridgeRef.current?.bridge?.setContext({
            scope,
            pathname: location.pathname,
            selection: textSelectionStore.getCurrent(),
        });
    }, [scope, location.pathname, textSelectionStore]);

    // Read via a ref so that registerBridge, the ref callback of the chat, doesn't change on navigation. A new ref
    // callback makes React detach and reattach the ref, which would register the MCP server again.
    const pushContextRef = useRef(pushContext);
    pushContextRef.current = pushContext;

    const registerBridge = useCallback((element: BridgeElement | null) => {
        bridgeRef.current = element;
        if (!element?.bridge) {
            return;
        }

        element.bridge.registerMcpServers([{ url: mcpServerUrl }]);

        pushContextRef.current();
    }, []);

    // The selection belongs to the page it was made on. Navigating while the chat has focus changes no selection the
    // store would see, so it is forgotten here. Before the push below, which runs on the same navigation.
    useEffect(() => {
        textSelectionStore.clear();
    }, [textSelectionStore, location.pathname]);

    // Re-push on navigation.
    useEffect(() => {
        pushContext();
    }, [pushContext]);

    // Re-push (debounced) when the selection changes — dragging a selection changes it on every mouse move.
    useEffect(() => {
        let timeout: number | undefined;
        const unsubscribe = textSelectionStore.subscribe(() => {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(pushContext, contextPushDebounceMs);
        });

        return () => {
            unsubscribe();
            window.clearTimeout(timeout);
        };
    }, [textSelectionStore, pushContext]);

    // Unmounted once closed, so the chat starts over with the next opening.
    return (
        <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
            <Root sx={{ top: headerHeight }}>
                <ScriptLoader src={config.aiHubWebComponentScriptSrc}>
                    <ai-hub-chat
                        ref={registerBridge}
                        api-url={aiHubProxyUrl}
                        widget-id={config.aiHubWidgetId}
                        // Only a hint: the AI Hub proxy replaces it with the ID of the user the request was authenticated as.
                        user-id={user.id}
                        language={intl.locale}
                        width={isMobile ? windowSize.width : aiModeFlyoutWidth}
                        height={windowSize.height - headerHeight}
                        integration-location="Admin Flyout"
                    />
                </ScriptLoader>
            </Root>
        </Slide>
    );
}

const Root = styled("aside")(({ theme }) => ({
    position: "fixed",
    right: 0,
    bottom: 0,
    width: "100%",
    overflow: "hidden",
    backgroundColor: theme.palette.common.white,
    boxShadow: theme.shadows[4],
    zIndex: theme.zIndex.drawer - 10,

    [theme.breakpoints.up("md")]: {
        width: aiModeFlyoutWidth,
    },

    "& ai-hub-chat": {
        display: "block",
        width: "100%",
        height: "100%",
    },
}));
