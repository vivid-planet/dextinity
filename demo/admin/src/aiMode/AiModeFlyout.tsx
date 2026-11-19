import { Alert, MasterLayoutContext, useWindowSize } from "@dextinity/admin";
import { useAiModeToolsetsStore, useContentScope, useCurrentUser } from "@dextinity/cms-admin";
import { Slide, useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { createConfig } from "@src/config";
import { useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { useDragDropManager } from "react-dnd";
import { FormattedMessage, useIntl } from "react-intl";
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
    const location = useLocation();
    const { scope } = useContentScope();
    const user = useCurrentUser();
    useShareDragDropManagerWithChat();

    const bridgeRef = useRef<BridgeElement | null>(null);
    const toolsetsStore = useAiModeToolsetsStore();
    const textSelectionStore = useTextSelectionStore();

    const pushContext = useCallback(() => {
        bridgeRef.current?.bridge?.setContext({
            scope,
            pathname: location.pathname,
            toolsets: toolsetsStore.getToolsets().map(({ id, description, context, tools = [] }) => ({
                id,
                description,
                context,
                tools: tools.map(({ name }) => name),
            })),
            selection: textSelectionStore.getCurrent(),
        });
    }, [scope, location.pathname, toolsetsStore, textSelectionStore]);

    // Read via a ref so that registerBridge, the ref callback of the chat, doesn't change on navigation. A new ref
    // callback makes React detach and reattach the ref, which would register the MCP server and the tools again.
    const pushContextRef = useRef(pushContext);
    pushContextRef.current = pushContext;

    const registeredToolsSignatureRef = useRef<string | null>(null);

    // Each call replaces the tools the chat had, so it gets the tools of every mounted toolset. Only a change the agent
    // sees registers them again: the handlers are looked up when a tool is called.
    const registerHostTools = useCallback(() => {
        const bridge = bridgeRef.current?.bridge;
        if (!bridge) {
            return;
        }

        const definitions = toolsetsStore.getTools().map(({ handler: _handler, ...definition }) => definition);
        const signature = JSON.stringify(definitions);
        if (signature === registeredToolsSignatureRef.current) {
            return;
        }
        registeredToolsSignatureRef.current = signature;

        bridge.registerHostTools(
            definitions.map((definition) => ({
                ...definition,
                handler: (args) => {
                    const tool = toolsetsStore.getTool(definition.name);
                    if (!tool) {
                        return `${definition.name} isn't available on the page that is open in the admin anymore.`;
                    }
                    return tool.handler(args, { clearTextSelection: textSelectionStore.clear });
                },
            })),
        );
    }, [toolsetsStore, textSelectionStore]);

    const registerBridge = useCallback(
        (element: BridgeElement | null) => {
            bridgeRef.current = element;
            // A new chat has no host tools, so it needs no registration until a toolset offers some.
            registeredToolsSignatureRef.current = JSON.stringify([]);
            if (!element?.bridge) {
                return;
            }

            element.bridge.registerMcpServers([{ url: mcpServerUrl }]);
            registerHostTools();
            pushContextRef.current();
        },
        [registerHostTools],
    );

    // The selection belongs to the page it was made on. Navigating while the chat has focus changes no selection the
    // store would see, e.g. with open_page_tree_node, so it is forgotten here. Before the push below, which runs on the same navigation.
    useEffect(() => {
        textSelectionStore.clear();
    }, [textSelectionStore, location.pathname]);

    // Re-push on navigation.
    useEffect(() => {
        pushContext();
    }, [pushContext]);

    // Re-push (debounced) when a toolset or the selection changes — a toolset's context can change with every keystroke,
    // and dragging a selection changes it on every mouse move.
    useEffect(() => {
        let timeout: number | undefined;
        const schedulePush = () => {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(pushContext, contextPushDebounceMs);
        };
        const unsubscribeToolsets = toolsetsStore.subscribe(() => {
            // Right away rather than debounced, so that the agent doesn't call a tool of a page that is gone.
            registerHostTools();
            schedulePush();
        });
        const unsubscribeTextSelection = textSelectionStore.subscribe(schedulePush);

        return () => {
            unsubscribeToolsets();
            unsubscribeTextSelection();
            window.clearTimeout(timeout);
        };
    }, [toolsetsStore, textSelectionStore, pushContext, registerHostTools]);

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
