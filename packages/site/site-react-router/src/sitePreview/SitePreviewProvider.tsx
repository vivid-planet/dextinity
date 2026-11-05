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
 * Tells the site preview of the admin the location of the page and enables the preview mode of the blocks.
 * Render it around the pages when `previewParams()` returns the parameters of a site preview.
 */
export function SitePreviewProvider({ children }: PropsWithChildren) {
    const { pathname, search } = useLocation();

    useEffect(() => {
        function sendLocation() {
            const message: SitePreviewIFrameLocationMessage = {
                dextinityType: SitePreviewIFrameMessageType.SitePreviewLocation,
                data: { search: new URLSearchParams(search).toString(), pathname },
            };
            sendSitePreviewIFrameMessage(message);
        }
        sendLocation();
        window.addEventListener("load", sendLocation);
        return () => {
            window.removeEventListener("load", sendLocation);
        };
    }, [pathname, search]);

    return <PreviewContext.Provider value={{ previewType: "SitePreview", showPreviewSkeletons: false }}>{children}</PreviewContext.Provider>;
}
