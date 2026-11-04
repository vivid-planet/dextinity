"use client";
import { BlockPreviewProvider, IFrameBridgeProvider, PixelImageBlock, useIFrameBridge } from "@dextinity/site-react-router";

function PreviewedBlock() {
    const { block } = useIFrameBridge();
    if (!block) {
        return <p id="block-preview">Waiting for a block</p>;
    }
    return (
        <div id="block-preview">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <PixelImageBlock data={block as any} aspectRatio="16x9" />
        </div>
    );
}

export function BlockPreviewContent() {
    return (
        <IFrameBridgeProvider>
            <BlockPreviewProvider>
                <PreviewedBlock />
            </BlockPreviewProvider>
        </IFrameBridgeProvider>
    );
}
