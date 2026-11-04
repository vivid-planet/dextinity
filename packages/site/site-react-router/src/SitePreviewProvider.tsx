"use client";

import {
    PreviewContext,
    sendSitePreviewIFrameMessage,
    type SitePreviewIFrameLocationMessage,
    SitePreviewIFrameMessageType,
} from "@dextinity/site-react";
import { type PropsWithChildren, useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Marks the page as site preview for the blocks and reports the location to the admin, which shows the site in an iframe.
 * Render it while `getSitePreview(context)` is set.
 */
export function SitePreviewProvider({ children }: PropsWithChildren) {
    const { pathname, search } = useLocation();

    useEffect(() => {
        function sendUpstreamMessage() {
            const message: SitePreviewIFrameLocationMessage = {
                dextinityType: SitePreviewIFrameMessageType.SitePreviewLocation,
                data: { search: new URLSearchParams(search).toString(), pathname },
            };
            sendSitePreviewIFrameMessage(message);
        }
        sendUpstreamMessage();
        window.addEventListener("load", sendUpstreamMessage);
        return () => {
            window.removeEventListener("load", sendUpstreamMessage);
        };
    }, [pathname, search]);

    return <PreviewContext.Provider value={{ previewType: "SitePreview", showPreviewSkeletons: false }}>{children}</PreviewContext.Provider>;
}
