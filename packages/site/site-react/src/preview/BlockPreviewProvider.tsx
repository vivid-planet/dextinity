"use client";

import type { PropsWithChildren } from "react";

import { useIFrameBridge } from "../iframebridge/useIFrameBridge";
import { createBlockPreviewFetch } from "./createBlockPreviewFetch";
import { PreviewContext } from "./PreviewContext";

let currentContentScopeJwt: string | null = null;
if (typeof window !== "undefined") {
    // monkey patch the fetch function to include the scope in the headers
    window.fetch = createBlockPreviewFetch(window.fetch, () => currentContentScopeJwt);
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
