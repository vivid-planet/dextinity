"use client";

import { decodeJwt } from "jose";
import isEqual from "lodash.isequal";
import { createContext, type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import styles from "./IFrameBridge.module.scss";
import { type AdminMessage, AdminMessageType, type IFrameMessage, IFrameMessageType } from "./IFrameMessage";
import { PreviewOverlay } from "./PreviewOverlay";
import { getCombinedPositioningOfElements, getRecursiveChildrenOfPreviewElement, PREVIEW_ELEMENT_SCROLLED_INTO_VIEW_EVENT } from "./utils";

type PreviewElement = {
    element: HTMLElement;
    adminRoute: string;
    label: string;
};

export type OverlayElementData = {
    adminRoute: string;
    label: string;
    position: {
        zIndex: number;
        top: number;
        left: number;
        width: number;
        height: number;
    };
};

export interface IFrameBridgeContext {
    hasBridge: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    block?: any;
    showOnlyVisible: boolean;
    selectedAdminRoute?: string;
    hoveredAdminRoute?: string | null;
    sendSelectComponent: (id: string) => void;
    sendHoverComponent: (route: string | null) => void;
    /**
     * @deprecated Use sendSitePreviewIFrameMessage instead
     */
    sendMessage: (message: IFrameMessage) => void;
    showOutlines: boolean;
    contentScope: unknown;
    contentScopeJwt: string;
    graphQLApiUrl: string | undefined;
    previewElementsData: OverlayElementData[];
    addPreviewElement: (element: PreviewElement) => void;
    removePreviewElement: (element: PreviewElement) => void;
}

export const IFrameBridgeContext = createContext<IFrameBridgeContext>({
    hasBridge: false,
    showOutlines: false,
    showOnlyVisible: false,
    sendSelectComponent: () => {
        // empty
    },
    sendHoverComponent: () => {
        // empty
    },
    sendMessage: () => {
        //empty
    },
    contentScope: undefined,
    contentScopeJwt: "",
    graphQLApiUrl: undefined,
    previewElementsData: [],
    removePreviewElement: () => {
        // empty
    },
    addPreviewElement: () => {
        // empty
    },
});

function getContentScopeFromJwt(jwt: string): unknown {
    try {
        const parsedJwt = decodeJwt(jwt);
        return parsedJwt.scope;
    } catch (e) {
        console.error("Failed to parse content scope JWT", e);
        return undefined;
    }
}

export const IFrameBridgeProvider = ({ children }: PropsWithChildren) => {
    const [block, setBlock] = useState<unknown | undefined>(undefined);
    const [showOnlyVisible, setShowOnlyVisible] = useState<boolean>(false);
    const [selectedAdminRoute, setSelectedAdminRoute] = useState<string | undefined>(undefined);
    const [hoveredAdminRoute, setHoveredAdminRoute] = useState<string | null>(null);
    const [showOutlines, setShowOutlines] = useState<boolean>(false);
    const [contentScope, setContentScope] = useState<unknown>(undefined);
    const [contentScopeJwt, setContentScopeJwt] = useState<string>("");
    const [graphQLApiUrl, setGraphQLApiUrl] = useState<string>("");
    const [previewElements, setPreviewElements] = useState<PreviewElement[]>([]);
    const [previewElementsData, setPreviewElementsData] = useState<OverlayElementData[]>([]);

    const childrenWrapperRef = useRef<HTMLDivElement>(null);
    const childrenWrapperWidth = childrenWrapperRef.current?.offsetWidth;

    const recalculatePreviewElementsData = useCallback(() => {
        if (!childrenWrapperWidth) {
            return;
        }

        const newPreviewElementsData = previewElements
            .map((previewElement) => {
                const childNodes = getRecursiveChildrenOfPreviewElement(previewElement.element);
                const positioning = getCombinedPositioningOfElements(childNodes);

                const isRenderedOutsideOfViewportWidth = positioning.left > childrenWrapperWidth;

                if (isRenderedOutsideOfViewportWidth) {
                    // TODO: Simply return `null` here after updating to typescript 5+
                    return {
                        adminRoute: previewElement.adminRoute,
                        label: previewElement.label,
                        position: {
                            top: positioning.top,
                            left: positioning.left,
                            width: 0,
                            height: positioning.height,
                        },
                    };
                }

                const spaceBetweenRightEdgeOfElementAndRightEdgeOfViewport = positioning.left + positioning.width - childrenWrapperWidth;
                const tooWideForPreviewViewportByPixels =
                    spaceBetweenRightEdgeOfElementAndRightEdgeOfViewport > 0 ? spaceBetweenRightEdgeOfElementAndRightEdgeOfViewport : 0;

                return {
                    adminRoute: previewElement.adminRoute,
                    label: previewElement.label,
                    position: {
                        top: positioning.top,
                        left: positioning.left,
                        width: positioning.width - tooWideForPreviewViewportByPixels,
                        height: positioning.height,
                    },
                };
            })
            .filter((elementData) => elementData.position.width !== 0) // TODO: Filter out null after updating to typescript 5+ instead of filtering `width !== 0`
            .sort((previousElementData, nextElementData) => {
                const previousSize = previousElementData.position.width * previousElementData.position.height;
                const nextSize = nextElementData.position.width * nextElementData.position.height;
                return nextSize - previousSize;
            })
            .map((elementData, index) => {
                return {
                    ...elementData,
                    position: {
                        ...elementData.position,
                        zIndex: index + 1,
                    },
                };
            });

        setPreviewElementsData((previousElementsData) => {
            const dataDidNotChange = isEqual(previousElementsData, newPreviewElementsData);

            if (dataDidNotChange) {
                // Returning the previous object (same reference) prevents the state-update from triggering a re-render
                return previousElementsData;
            }

            return newPreviewElementsData;
        });
    }, [previewElements, childrenWrapperWidth]);

    useEffect(() => {
        if (childrenWrapperRef.current) {
            const mutationObserver = new MutationObserver(() => {
                recalculatePreviewElementsData();
            });

            const resizeObserver = new ResizeObserver(() => {
                recalculatePreviewElementsData();
            });

            mutationObserver.observe(childrenWrapperRef.current, { childList: true, subtree: true, attributes: true });
            resizeObserver.observe(childrenWrapperRef.current);

            return () => {
                mutationObserver.disconnect();
                resizeObserver.disconnect();
            };
        }
    }, [recalculatePreviewElementsData]);

    useEffect(() => {
        previewElements.forEach((previewElement) => {
            previewElement.element.addEventListener(PREVIEW_ELEMENT_SCROLLED_INTO_VIEW_EVENT, recalculatePreviewElementsData);
        });

        return () => {
            previewElements.forEach((previewElement) => {
                previewElement.element.removeEventListener(PREVIEW_ELEMENT_SCROLLED_INTO_VIEW_EVENT, recalculatePreviewElementsData);
            });
        };
    }, [previewElements, recalculatePreviewElementsData]);

    const sendMessage = useCallback((message: IFrameMessage) => {
        window.parent.postMessage(JSON.stringify(message), "*");
    }, []);

    const debounceDeactivateOutlines = useDebounceCallback(() => {
        setShowOutlines(false);
    }, 2500);

    const onReceiveMessage = useCallback(
        (message: AdminMessage) => {
            switch (message.dextinityType) {
                case AdminMessageType.Block:
                    setBlock(message.data.block);
                    break;
                case AdminMessageType.ShowOnlyVisible:
                    setShowOnlyVisible(message.data.showOnlyVisible);
                    break;
                case AdminMessageType.SelectComponent:
                    setSelectedAdminRoute(
                        message.data.adminRoute.lastIndexOf("#") > 0
                            ? message.data.adminRoute.substr(0, message.data.adminRoute.lastIndexOf("#"))
                            : message.data.adminRoute,
                    );
                    break;
                case AdminMessageType.HoverComponent:
                    setHoveredAdminRoute(message.data.adminRoute);
                    setShowOutlines(true);
                    debounceDeactivateOutlines();
                    break;
                case AdminMessageType.ContentScope:
                    setContentScope(getContentScopeFromJwt(message.data.contentScopeJwt));
                    setContentScopeJwt(message.data.contentScopeJwt);
                    break;
                case AdminMessageType.GraphQLApiUrl:
                    setGraphQLApiUrl(message.data.graphQLApiUrl);
                    break;
            }
        },
        [debounceDeactivateOutlines],
    );

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const handleMessage = (e: MessageEvent) => {
            try {
                const message = JSON.parse(e.data);
                // Check if message is an iframe message from us -> there are more messaging from e.g webpack,etc.
                // eslint-disable-next-line no-prototype-builtins
                if (message.hasOwnProperty("dextinityType")) {
                    onReceiveMessage(message as AdminMessage);
                }
            } catch {
                // empty
            }
        };

        window.addEventListener("message", handleMessage, false);

        sendMessage({ dextinityType: IFrameMessageType.Ready });

        return () => {
            window.removeEventListener("message", handleMessage, false);
        };
    }, [onReceiveMessage, sendMessage]);

    const addPreviewElement = useCallback(
        (element: PreviewElement) => {
            setPreviewElements((prev) => [...prev, element]);
        },
        [setPreviewElements],
    );

    const removePreviewElement = useCallback(
        (element: PreviewElement) => {
            setPreviewElements((prev) => prev.filter((el) => el.adminRoute !== element.adminRoute));
        },
        [setPreviewElements],
    );

    const iFrameBridgeValues = useMemo(
        () => ({
            showOutlines,
            hasBridge: true,
            block,
            showOnlyVisible,
            selectedAdminRoute,
            hoveredAdminRoute,
            sendSelectComponent: (adminRoute: string) => {
                setSelectedAdminRoute(adminRoute);
                sendMessage({ dextinityType: IFrameMessageType.SelectComponent, data: { adminRoute } });
            },
            sendHoverComponent: (route: string | null) => {
                sendMessage({ dextinityType: IFrameMessageType.HoverComponent, data: { route } });
            },
            sendMessage,
            contentScope,
            contentScopeJwt,
            graphQLApiUrl,
            previewElementsData,
            addPreviewElement,
            removePreviewElement,
        }),
        [
            showOutlines,
            block,
            showOnlyVisible,
            selectedAdminRoute,
            hoveredAdminRoute,
            sendMessage,
            contentScope,
            contentScopeJwt,
            graphQLApiUrl,
            previewElementsData,
            addPreviewElement,
            removePreviewElement,
        ],
    );

    return (
        <IFrameBridgeContext.Provider value={iFrameBridgeValues}>
            <div
                onMouseMove={() => {
                    setShowOutlines(true);
                    debounceDeactivateOutlines();
                }}
            >
                <PreviewOverlay />
                <div ref={childrenWrapperRef} className={styles.childrenWrapper}>
                    {children}
                </div>
            </div>
        </IFrameBridgeContext.Provider>
    );
};
