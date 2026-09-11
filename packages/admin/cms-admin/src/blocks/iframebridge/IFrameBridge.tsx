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
});

interface IFrameBridgeProviderProps {
    onReceiveMessage?: (message: IFrameMessage) => void;
}
export const IFrameBridgeProvider = ({ children, onReceiveMessage }: PropsWithChildren<IFrameBridgeProviderProps>) => {
    const iFrameRef = useRef<HTMLIFrameElement>(null);
    const [iFrameReady, setIFrameReady] = useState(false);

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
                    setIFrameReady(true);
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
