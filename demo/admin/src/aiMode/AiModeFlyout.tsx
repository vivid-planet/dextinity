import { Alert, MasterLayoutContext, useWindowSize } from "@dextinity/admin";
import { useContentScope, useCurrentUser } from "@dextinity/cms-admin";
import { Slide, useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { createConfig } from "@src/config";
import { useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { useDragDropManager } from "react-dnd";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";

import type { BridgeElement } from "./aiHubBridge";
import { useAiMode } from "./AiModeContext";
import { useAiModePageStateStore } from "./AiModePageStateContext";
import { useAiModePageToolsStore } from "./AiModePageToolsContext";
import { createAdminHostTools } from "./hostTools";
import { ScriptLoader } from "./ScriptLoader";
import { useTextSelectionStore } from "./textSelection";

export const aiModeFlyoutWidth = 400;

const contextPushDebounceMs = 300;

const config = createConfig();

// The chat sends its requests to the API, which forwards them to the AI Hub API with the secret key.
const aiHubProxyUrl = `${config.apiUrl}/ai-hub`;

const mcpServerUrl = `${config.apiUrl}/mcp`;

// TODO Remove once the web component sets up its react-dnd backend on its own element rather than on the window.
// The web component brings its own react-dnd. Its DndProvider reuses the manager it finds under this key on the window,
// otherwise it sets up a second HTML5 backend there, which throws "Cannot have two HTML5 backends at the same time".
// The admin's DndProvider puts its manager there, but takes it away again when StrictMode runs its effects twice.
const reactDndGlobalInstanceKey = Symbol.for("__REACT_DND_CONTEXT_INSTANCE__");

function useShareDragDropManagerWithChat() {
    const dragDropManager = useDragDropManager();

    // A layout effect, so that the manager is in place before the chat, a React root of its own, renders.
    useLayoutEffect(() => {
        const globalContext = window as unknown as Record<symbol, { dragDropManager: unknown } | null | undefined>;
        if (globalContext[reactDndGlobalInstanceKey]) {
            return;
        }

        globalContext[reactDndGlobalInstanceKey] = { dragDropManager };

        return () => {
            if (globalContext[reactDndGlobalInstanceKey]?.dragDropManager === dragDropManager) {
                globalContext[reactDndGlobalInstanceKey] = null;
            }
        };
    }, [dragDropManager]);
}

export function AiModeFlyout() {
    const { isOpen } = useAiMode();
    const { headerHeight } = useContext(MasterLayoutContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const windowSize = useWindowSize();
    const intl = useIntl();
    const history = useHistory();
    const location = useLocation();
    const { scope, match } = useContentScope();
    const user = useCurrentUser();
    useShareDragDropManagerWithChat();

    const bridgeRef = useRef<BridgeElement | null>(null);
    const pageStateStore = useAiModePageStateStore();
    const pageToolsStore = useAiModePageToolsStore();
    const textSelectionStore = useTextSelectionStore();

    const pushContext = useCallback(() => {
        bridgeRef.current?.bridge?.setContext({
            scope,
            pathname: location.pathname,
            page: pageStateStore.getCurrent()?.metadata ?? null,
            selection: textSelectionStore.getCurrent(),
        });
    }, [scope, location.pathname, pageStateStore, textSelectionStore]);

    // Read via a ref so that registerBridge, the ref callback of the chat, doesn't change on navigation. A new ref
    // callback makes React detach and reattach the ref, which would register the MCP server and the tools again.
    const pushContextRef = useRef(pushContext);
    pushContextRef.current = pushContext;

    const registerBridge = useCallback(
        (element: BridgeElement | null) => {
            bridgeRef.current = element;
            if (!element?.bridge) {
                return;
            }

            element.bridge.registerMcpServers([{ url: mcpServerUrl }]);
            element.bridge.registerHostTools(
                createAdminHostTools({
                    history,
                    scopeUrl: match.url,
                    getPageState: () => pageStateStore.getCurrent(),
                    getPageTools: () => pageToolsStore.getCurrent(),
                    clearTextSelection: textSelectionStore.clear,
                }),
            );

            pushContextRef.current();
        },
        [history, match.url, pageStateStore, pageToolsStore, textSelectionStore],
    );

    // The selection belongs to the page it was made on. Navigating while the chat has focus changes no selection the
    // store would see, e.g. with open_page, so it is forgotten here. Before the push below, which runs on the same navigation.
    useEffect(() => {
        textSelectionStore.clear();
    }, [textSelectionStore, location.pathname]);

    // Re-push on navigation.
    useEffect(() => {
        pushContext();
    }, [pushContext]);

    // Re-push (debounced) when the page state or the selection changes — block edits update the page state on
    // every keystroke, and dragging a selection changes it on every mouse move.
    useEffect(() => {
        let timeout: number | undefined;
        const schedulePush = () => {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(pushContext, contextPushDebounceMs);
        };
        const unsubscribePageState = pageStateStore.subscribe(schedulePush);
        const unsubscribeTextSelection = textSelectionStore.subscribe(schedulePush);

        return () => {
            unsubscribePageState();
            unsubscribeTextSelection();
            window.clearTimeout(timeout);
        };
    }, [pageStateStore, textSelectionStore, pushContext]);

    // Unmounted once closed, so the chat starts over with the next opening.
    return (
        <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
            <Root sx={{ top: headerHeight }}>
                <ScriptLoader
                    src={config.aiHubWebComponentScriptSrc}
                    errorFallback={
                        <ErrorAlert severity="error">
                            <FormattedMessage
                                id="aiMode.chatLoadError"
                                defaultMessage="The chat couldn't be loaded. Close the AI Companion and open it again to retry."
                            />
                        </ErrorAlert>
                    }
                >
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

const ErrorAlert = styled(Alert)(({ theme }) => ({
    margin: theme.spacing(2),
}));
