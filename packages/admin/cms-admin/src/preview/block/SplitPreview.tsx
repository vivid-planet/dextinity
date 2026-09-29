import { useWindowSize } from "@dextinity/admin";
import { Box } from "@mui/material";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { BlockPreview } from "./BlockPreview";
import { Column, FirstColumnContainer, MaximizeButton, MaximizeIcon, PreviewContainer, Root, Split } from "./SplitPreview.sc";
import type { BlockPreviewApi } from "./useBlockPreview";

interface Props {
    url: string;
    previewApi: BlockPreviewApi;
    previewState: unknown;
    children: ReactNode | [ReactNode, ReactNode];
}

function SplitPreview({ url, previewState, children, previewApi }: Props) {
    const { minimized, setMinimized } = previewApi;
    const rootRef = useRef<HTMLDivElement>(null);
    const [columnHeight, setColumnHeight] = useState<number>(0);
    const windowSize = useWindowSize();

    useEffect(() => {
        if (rootRef.current) {
            setColumnHeight(windowSize.height - rootRef.current.getBoundingClientRect().y);
        }
    }, [windowSize, setColumnHeight, rootRef]);

    let firstColumn: ReactNode = null;
    let secondColumn: ReactNode;

    if (Array.isArray(children)) {
        firstColumn = children[0];
        secondColumn = children[1];
    } else {
        secondColumn = children;
    }

    const handleMaximizeClick = () => {
        setMinimized((minimized) => !minimized);
    };

    const initialBlockListWidth = 100 / 3;
    const initialPreviewWidth = 100 - initialBlockListWidth;

    return (
        <Root ref={rootRef}>
            <Split sizes={[initialPreviewWidth, initialBlockListWidth]} minSize={360} gutterSize={40}>
                <Column height={columnHeight}>
                    <FirstColumnContainer>
                        <Box paddingBottom={4}>{firstColumn}</Box>
                    </FirstColumnContainer>
                    <PreviewContainer minimized={minimized}>
                        <BlockPreview url={url} previewState={previewState} previewApi={previewApi} />
                        {minimized && (
                            <MaximizeButton onClick={handleMaximizeClick}>
                                <MaximizeIcon />
                            </MaximizeButton>
                        )}
                    </PreviewContainer>
                </Column>
                <Column height={columnHeight}>{secondColumn}</Column>
            </Split>
        </Root>
    );
}

export { SplitPreview };
