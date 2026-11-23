import { Alert, MasterLayoutContext, useWindowSize } from "@dextinity/admin";
import { Collapse, Slide, useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { useDragDropManager } from "react-dnd";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocation } from "react-router";

import { useContentScope } from "../contentScope/Provider";
import { useCurrentUser } from "../userPermissions/hooks/currentUser";
import type { BridgeElement } from "./aiHubBridge";
import { useAiMode, useAiModeChatConfig } from "./AiModeProvider";
import { useAiModeToolsetsStore } from "./AiModeToolsets";
import { ScriptLoader } from "./ScriptLoader";
import { useTextSelectionStore } from "./textSelection";

const desktopWidth = 400;

const contextPushDebounceMs = 300;

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

/**
 * The chat of the AI Mode, the side panel of the `MasterLayout`: `<MasterLayout sidePanelComponent={AiModeSidePanel} />`.
 * On desktop, the content narrows while the chat is open. On mobile, the chat covers the content.
 * Renders nothing while the AI Mode is off, see `AiModeProvider`.
 *
 * @experimental
 */
export function AiModeSidePanel() {
    const chatConfig = useAiModeChatConfig();

    return chatConfig ? <AiModeChatSidePanel {...chatConfig} /> : null;
}

function AiModeChatSidePanel({
    webComponentScriptSrc,
    widgetId,
    aiHubProxyUrl,
    mcpServerUrl,
}: {
    webComponentScriptSrc: string;
    widgetId: string;
    aiHubProxyUrl: string;
    mcpServerUrl: string;
}) {
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
    // The subscription to the toolsets reads it via the ref too: subscribing again on navigation would miss a toolset
    // that a page registers in the same commit, because React runs every effect's cleanup before the new effects.
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
        [registerHostTools, mcpServerUrl],
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
            timeout = window.setTimeout(() => pushContextRef.current(), contextPushDebounceMs);
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
    }, [toolsetsStore, textSelectionStore, registerHostTools]);

    const chatHeight = windowSize.height - headerHeight;

    const chat = (
        <ScriptLoader
            src={webComponentScriptSrc}
            errorFallback={
                <ErrorAlert severity="error">
                    <FormattedMessage
                        id="dextinity.aiMode.chatLoadError"
                        defaultMessage="The chat couldn't be loaded. Switch it off and on again to retry."
                    />
                </ErrorAlert>
            }
        >
            <ai-hub-chat
                ref={registerBridge}
                api-url={aiHubProxyUrl}
                widget-id={widgetId}
                // Only a hint: the AI Hub proxy replaces it with the ID of the user the request was authenticated as.
                user-id={user.id}
                language={intl.locale}
                width={isMobile ? windowSize.width : desktopWidth}
                height={chatHeight}
                integration-location="Admin Flyout"
            />
        </ScriptLoader>
    );

    // Unmounted once closed, so the chat starts over with the next opening.
    if (isMobile) {
        return (
            <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
                <MobileRoot sx={{ top: headerHeight }}>{chat}</MobileRoot>
            </Slide>
        );
    }

    // Takes its width in the layout, which narrows the content along with the animation.
    return (
        <DesktopCollapse in={isOpen} orientation="horizontal" mountOnEnter unmountOnExit sx={{ top: headerHeight, height: chatHeight }}>
            <DesktopRoot>{chat}</DesktopRoot>
        </DesktopCollapse>
    );
}

const chatStyles = {
    "& ai-hub-chat": {
        display: "block",
        width: "100%",
        height: "100%",
    },
};

const MobileRoot = styled("aside")(({ theme }) => ({
    position: "fixed",
    right: 0,
    bottom: 0,
    width: "100%",
    overflow: "hidden",
    backgroundColor: theme.palette.common.white,
    boxShadow: theme.shadows[4],
    zIndex: theme.zIndex.drawer - 10,
    ...chatStyles,
}));

// Sticky, so that the chat stays below the header while the page scrolls.
const DesktopCollapse = styled(Collapse)({
    position: "sticky",
});

const DesktopRoot = styled("aside")(({ theme }) => ({
    boxSizing: "border-box",
    width: desktopWidth,
    height: "100%",
    overflow: "hidden",
    backgroundColor: theme.palette.common.white,
    borderLeft: `1px solid ${theme.palette.divider}`,
    ...chatStyles,
}));

const ErrorAlert = styled(Alert)(({ theme }) => ({
    margin: theme.spacing(2),
}));
