import { createContext, createRef, type PropsWithChildren, type Ref, useCallback, useEffect, useRef, useState } from "react";
import { Route, useHistory } from "react-router";

import {
    type AdminMessage,
    AdminMessageType,
    type IAdminBlockMessage,
    type IAdminContentScopeMessage,
    type IAdminGraphQLApiUrlMessage,
    type IAdminHoverComponentMessage,
    type IAdminSelectComponentMessage,
    type IAdminShowOnlyVisibleMessage,
    type IFrameMessage,
    IFrameMessageType,
} from "./IFrameMessage";

export interface IFrameBridgeContext {
    iFrameRef: Ref<HTMLIFrameElement>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendBlockState: (blockState: any) => void; // TODO: only PageBlock is supported currently
    sendContentScopeJwt(contentScopeJwt: string): void;
    sendGraphQLApiUrl(apiUrl: string): void;
    sendShowOnlyVisible: (showOnlyVisible: boolean) => void;
    iFrameReady: boolean;
    hoveredSiteRoute: string | null;
    sendSelectComponent: (adminRoute: string) => void;
    sendHoverComponent: (adminRoute: string | null) => void;
    /** Call when the `iframe` starts loading another address, so the bridge waits for the new document to be ready. */
    onIFrameNavigate: () => void;
    /** Pass to the `onLoad` of the `iframe`, so a document that loaded is sent the state even if its "Ready" got lost in a navigation. */
    onIFrameLoad: () => void;
}

export const IFrameBridgeContext = createContext<IFrameBridgeContext>({
    iFrameRef: createRef(),
    sendBlockState: () => {
        // empty
    },
    sendShowOnlyVisible: () => {
        // empty
    },
    iFrameReady: false,
    hoveredSiteRoute: null,
    sendSelectComponent: () => {
        // empty
    },
    sendHoverComponent: () => {
        // empty
    },
    sendContentScopeJwt: () => {
        // empty
    },
    sendGraphQLApiUrl: () => {
        // empty
    },
    onIFrameNavigate: () => {
        // empty
    },
    onIFrameLoad: () => {
        // empty
    },
});

interface IFrameBridgeProviderProps {
    onReceiveMessage?: (message: IFrameMessage) => void;
}
export const IFrameBridgeProvider = ({ children, onReceiveMessage }: PropsWithChildren<IFrameBridgeProviderProps>) => {
    const iFrameRef = useRef<HTMLIFrameElement>(null);
    const [iFrameReady, setIFrameReady] = useState(false);
    // Changes with each accepted "Ready", which re-renders the consumers so they send their state again
    const [, setReadyCount] = useState(0);
    // The site sends "Ready" on every render of its bridge, so only the first one after a (re)load counts. Counting all of them would
    // send the state again, re-render the site, and get another "Ready" in return.
    const isAwaitingReadyRef = useRef(true);

    const [hoveredSiteRoute, setHoveredSiteRoute] = useState<string | null>(null);

    const history = useHistory();
    const sendMessage = useCallback(
        (message: AdminMessage) => {
            if (!iFrameReady) {
                throw Error("iFrame not ready");
            }

            if (iFrameRef && iFrameRef.current && iFrameRef.current.contentWindow) {
                iFrameRef.current.contentWindow.postMessage(JSON.stringify(message), "*");
            }
        },
        [iFrameReady],
    );
    const _onReceiveMessage = useCallback(
        (message: IFrameMessage) => {
            onReceiveMessage?.(message);
            switch (message.dextinityType) {
                case IFrameMessageType.Ready:
                    if (isAwaitingReadyRef.current) {
                        isAwaitingReadyRef.current = false;
                        setIFrameReady(true);
                        setReadyCount((count) => count + 1);
                    }
                    break;
                case IFrameMessageType.SelectComponent:
                    history.push(message.data.adminRoute);
                    break;
                case IFrameMessageType.HoverComponent:
                    setHoveredSiteRoute(message.data.route);
                    break;
            }
        },
        [history, onReceiveMessage],
    );

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            try {
                const message = JSON.parse(event.data);
                // Check if message is an iframe message from us -> there are more messaging from e.g webpack,etc.
                // eslint-disable-next-line no-prototype-builtins
                if (message.hasOwnProperty("dextinityType")) {
                    _onReceiveMessage(message as IFrameMessage);
                }
            } catch {
                // empty
            }
        };

        window.addEventListener("message", handleMessage, false);

        return () => {
            window.removeEventListener("message", handleMessage, false);
        };
    }, [_onReceiveMessage]);

    const onIFrameNavigate = useCallback(() => {
        isAwaitingReadyRef.current = true;
        setIFrameReady(false);
    }, []);

    // A "Ready" sent while the previous document was still unloading can be taken for the new document's, whose own "Ready" is then
    // ignored. Once the new document has loaded, it gets the state anyway, and its next "Ready" counts as well.
    const onIFrameLoad = useCallback(() => {
        isAwaitingReadyRef.current = true;
        setReadyCount((count) => count + 1);
    }, []);

    const sendSelectComponent = useCallback(
        (adminRoute: string) => {
            const message: IAdminSelectComponentMessage = { dextinityType: AdminMessageType.SelectComponent, data: { adminRoute } };
            sendMessage(message);
        },
        [sendMessage],
    );

    return (
        <Route>
            {() => {
                return (
                    <IFrameBridgeContext.Provider
                        value={{
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            sendBlockState: (blockState: any) => {
                                const message: IAdminBlockMessage = {
                                    dextinityType: AdminMessageType.Block,
                                    data: {
                                        block: blockState, // @TODO: refactor block to blockState
                                    },
                                };
                                sendMessage(message);
                            },
                            sendShowOnlyVisible: (showOnlyVisible: boolean) => {
                                const message: IAdminShowOnlyVisibleMessage = {
                                    dextinityType: AdminMessageType.ShowOnlyVisible,
                                    data: {
                                        showOnlyVisible,
                                    },
                                };
                                sendMessage(message);
                            },
                            iFrameRef,
                            iFrameReady,
                            onIFrameNavigate,
                            onIFrameLoad,
                            sendSelectComponent,
                            hoveredSiteRoute: hoveredSiteRoute,
                            sendHoverComponent: (adminRoute) => {
                                const message: IAdminHoverComponentMessage = { dextinityType: AdminMessageType.HoverComponent, data: { adminRoute } };
                                sendMessage(message);
                            },
                            sendContentScopeJwt: (contentScopeJwt) => {
                                const message: IAdminContentScopeMessage = {
                                    dextinityType: AdminMessageType.ContentScope,
                                    data: { contentScopeJwt },
                                };
                                sendMessage(message);
                            },
                            sendGraphQLApiUrl: (graphQLApiUrl) => {
                                const message: IAdminGraphQLApiUrlMessage = {
                                    dextinityType: AdminMessageType.GraphQLApiUrl,
                                    data: { graphQLApiUrl },
                                };
                                sendMessage(message);
                            },
                        }}
                    >
                        {children}
                    </IFrameBridgeContext.Provider>
                );
            }}
        </Route>
    );
};
