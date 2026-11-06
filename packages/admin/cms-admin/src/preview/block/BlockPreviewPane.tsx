import { DevicePreview, Icon, IconButton } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useIntl } from "react-intl";

import { previewDevices } from "../common/previewDevice";
import { usePreviewLabels } from "../common/usePreviewLabels";
import { VisibilityToggle } from "../common/VisibilityToggle";
import type { BlockPreviewApi } from "./useBlockPreview";
import { useBlockPreviewBridge } from "./useBlockPreviewBridge";

export interface BlockPreviewPaneProps {
    /** The address of the block preview page of the site, which receives the preview state through the `IFrameBridgeProvider`. */
    url: string;
    /** The state to render, created with the root block's `createPreviewState`. */
    previewState: unknown;
    previewApi: Pick<BlockPreviewApi, "device" | "setDevice" | "showOnlyVisible" | "setShowOnlyVisible">;
    /** The public address of the edited page, shown above the preview. Defaults to `url`. */
    siteUrl?: string;
    /** Opens the saved page in the site preview, e.g. with `openSitePreviewWindow`. Without it, the action is not shown. */
    onOpenSitePreview?: () => void;
    /** Further actions at the end of the toolbar. */
    actions?: ReactNode;
    className?: string;
}

/**
 * The live preview of unsaved blocks, with a device switch and a toggle for invisible blocks. Render it inside the
 * `IFrameBridgeProvider` that also wraps the block admin, so hovering and selecting blocks works in both directions.
 */
export function BlockPreviewPane({ url, previewState, previewApi, siteUrl, onOpenSitePreview, actions, className }: BlockPreviewPaneProps) {
    const intl = useIntl();
    const labels = usePreviewLabels();
    const iFrameBridge = useBlockPreviewBridge({ url, previewState, showOnlyVisible: previewApi.showOnlyVisible });

    return (
        <Root
            className={className}
            url={siteUrl ?? url}
            src={url}
            device={previewApi.device}
            onDeviceChange={previewApi.setDevice}
            devices={previewDevices}
            loading={!iFrameBridge.iFrameReady}
            labels={labels}
            slotProps={{ iframe: { ref: iFrameBridge.iFrameRef } }}
            actions={
                <>
                    <VisibilityToggle showOnlyVisible={previewApi.showOnlyVisible} onChange={previewApi.setShowOnlyVisible} />
                    {onOpenSitePreview && (
                        <IconButton
                            variant="text"
                            color="secondary"
                            size="small"
                            aria-label={intl.formatMessage({ id: "dextinity.preview.openSitePreview", defaultMessage: "Open preview" })}
                            onClick={onOpenSitePreview}
                        >
                            <Icon name="open-new-tab" />
                        </IconButton>
                    )}
                    {actions}
                </>
            }
        />
    );
}

const Root = styled(DevicePreview)`
    block-size: 100%;
    min-block-size: 0;
`;
