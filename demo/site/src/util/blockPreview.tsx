"use client";

import { BlockPreviewProvider, IFrameBridgeProvider } from "@dextinity/site-nextjs";
import type { FunctionComponent } from "react";

export const withBlockPreview =
    <P extends object>(Component: FunctionComponent<P>) =>
    (props: P) => {
        return (
            <IFrameBridgeProvider>
                <BlockPreviewProvider>
                    <Component {...props} />
                </BlockPreviewProvider>
            </IFrameBridgeProvider>
        );
    };
