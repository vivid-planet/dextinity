"use client";
import {
    PreviewContext,
    sendSitePreviewIFrameMessage,
    type SitePreviewIFrameLocationMessage,
    SitePreviewIFrameMessageType,
} from "@dextinity/site-react";
import { type PropsWithChildren, useEffect } from "react";

import { usePathname, useSearchParams } from "./RouterProvider.js";

/**
 * Marks the page as site preview for the blocks and reports the location to the admin, which shows the site in an iframe
 */
export function SitePreviewProvider({ children }: PropsWithChildren) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        function sendUpstreamMessage() {
            const message: SitePreviewIFrameLocationMessage = {
                dextinityType: SitePreviewIFrameMessageType.SitePreviewLocation,
                data: { search: searchParams.toString(), pathname },
            };
            sendSitePreviewIFrameMessage(message);
        }
        sendUpstreamMessage();
        window.addEventListener("load", sendUpstreamMessage);
        return () => {
            window.removeEventListener("load", sendUpstreamMessage);
        };
    }, [pathname, searchParams]);

    return <PreviewContext.Provider value={{ previewType: "SitePreview", showPreviewSkeletons: false }}>{children}</PreviewContext.Provider>;
}
