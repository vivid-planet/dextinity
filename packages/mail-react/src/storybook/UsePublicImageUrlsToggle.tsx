/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useState } from "react";
import { IconButton, TooltipNote, WithTooltip } from "storybook/internal/components";
import { UPDATE_GLOBALS } from "storybook/internal/core-events";
import { useChannel } from "storybook/manager-api";

const RENDER_RESULT_EVENT = "dextinity-mail-render-result";

export function UsePublicImageUrlsToggle() {
    const [isUsingPublicImageUrls, setIsUsingPublicImageUrls] = useState(false);

    // The manager shares globals only with its own preview, not with a referenced Storybook, so `useGlobals` can neither read nor set this value here.
    const emit = useChannel({
        [RENDER_RESULT_EVENT]: ({ usePublicImageUrls }: { usePublicImageUrls: boolean }) => {
            setIsUsingPublicImageUrls(usePublicImageUrls);
        },
    });

    const togglePublicImageUrls = () => emit(UPDATE_GLOBALS, { globals: { usePublicImageUrls: !isUsingPublicImageUrls } });

    return (
        <WithTooltip
            tooltip={<TooltipNote note="Helpful to test with real images on external devices that cannot access localhost, e.g. Email on Acid." />}
            trigger="hover"
        >
            <IconButton size="small" active={isUsingPublicImageUrls} onClick={togglePublicImageUrls}>
                <input type="checkbox" checked={isUsingPublicImageUrls} readOnly style={{ pointerEvents: "none", marginLeft: 4 }} />
                Use public image URLs
                <span role="img" aria-label="info">
                    ℹ️
                </span>
            </IconButton>
        </WithTooltip>
    );
}
