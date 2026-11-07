import { useWindowSize } from "@dextinity/admin";
import { Icon } from "@dextinity/ui";
import { Box } from "@mui/material";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";

import { BlockPreview } from "./BlockPreview";
import { Column, FirstColumnContainer, MaximizeButton, PreviewContainer, PreviewContent, Root, ScrollableColumn, Split } from "./SplitPreview.sc";
import type { BlockPreviewApi } from "./useBlockPreview";

interface Props {
    url: string;
    previewApi: BlockPreviewApi;
    previewState: unknown;
    children: ReactNode | [ReactNode, ReactNode];
    /** The public address of the edited page, shown above the preview. Defaults to `url`. */
    siteUrl?: string;
}

/**
 * The editor next to the block preview, built with MUI.
 *
 * @deprecated Use `PageContentEditor` for pages, or `BlockPreviewPane` next to your own editor.
 */
function SplitPreview({ url, previewState, children, previewApi, siteUrl }: Props) {
    const intl = useIntl();
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
                        <Box
                            sx={{
                                paddingBottom: 4,
                            }}
                        >
                            {firstColumn}
                        </Box>
                    </FirstColumnContainer>
                    <PreviewContainer data-minimized={minimized ? "" : undefined}>
                        <PreviewContent inert={minimized}>
                            <BlockPreview url={url} siteUrl={siteUrl} previewState={previewState} previewApi={previewApi} />
                        </PreviewContent>
                        {minimized && (
                            <MaximizeButton
                                onClick={handleMaximizeClick}
                                aria-label={intl.formatMessage({ id: "dextinity.preview.maximize", defaultMessage: "Maximize preview" })}
                            >
                                <Icon name="maximize" />
                            </MaximizeButton>
                        )}
                    </PreviewContainer>
                </Column>
                <ScrollableColumn height={columnHeight}>{secondColumn}</ScrollableColumn>
            </Split>
        </Root>
    );
}

export { SplitPreview };
