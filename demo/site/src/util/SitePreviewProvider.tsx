"use client";
import {
    PreviewContext,
    sendSitePreviewIFrameMessage,
    type SitePreviewIFrameLocationMessage,
    SitePreviewIFrameMessageType,
} from "@dextinity/site-react";
import { usePathname, useSearchParams } from "@src/framework/RouterProvider";
import { type PropsWithChildren, useEffect } from "react";

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

    return (
        <PreviewContext.Provider
            value={{
                previewType: "SitePreview",
                showPreviewSkeletons: false,
            }}
        >
            {children}
        </PreviewContext.Provider>
    );
}
