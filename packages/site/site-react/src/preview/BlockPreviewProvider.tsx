"use client";

import { type PropsWithChildren } from "react";

import { useIFrameBridge } from "../iframebridge/useIFrameBridge";
import { PreviewContext } from "./PreviewContext";

let currentContentScopeJwt: string | null = null;
if (typeof window !== "undefined") {
    // monkey patch the fetch function to include the scope in the headers
    const originalFetch = window.fetch;
    window.fetch = async (input, init: RequestInit = {}) => {
        const headers = new Headers(init.headers);
        const url = new URL(input instanceof Request ? input.url : input.toString(), window.location.origin);
        if (url.host === window.location.host && currentContentScopeJwt) {
            headers.set("X-Block-Preview", currentContentScopeJwt);
        }
        return originalFetch(input, { ...init, headers });
    };
}

export const BlockPreviewProvider = ({ children }: PropsWithChildren) => {
    const { contentScopeJwt } = useIFrameBridge();
    currentContentScopeJwt = contentScopeJwt;

    return (
        <PreviewContext.Provider
            value={{
                previewType: "BlockPreview",
                showPreviewSkeletons: true,
            }}
        >
            {children}
        </PreviewContext.Provider>
    );
};
