import { useSubRoutePrefix } from "@dextinity/admin";
import { type PropsWithChildren, useEffect, useRef } from "react";
import scrollIntoView from "scroll-into-view-if-needed";

import * as sc from "./HoverPreviewComponent.sc";
import { useIFrameBridge } from "./useIFrameBridge";

interface HoverPreviewComponentProps {
    componentSlug: string;
}

export const HoverPreviewComponent = ({ children, componentSlug }: PropsWithChildren<HoverPreviewComponentProps>) => {
    // The routes of the previewed blocks are built from the same prefix, through
    // `BlockPreviewContext.parentUrl` and `parentUrlSubRoute`. A `SubRoute` passes its path through
    // a context instead of a router match, so `useRouteMatch` would miss that segment and a block
    // list below one, for instance below a `SaveBoundary`, would never be recognized as hovered.
    const subRoutePrefix = useSubRoutePrefix();
    const iFrameBridge = useIFrameBridge();
    const rootEl = useRef<HTMLDivElement | null>(null);

    const componentRoute = componentSlug.startsWith("#") ? `${subRoutePrefix}${componentSlug}` : `${subRoutePrefix}/${componentSlug}`;

    const isHovered = iFrameBridge.hoveredSiteRoute?.includes(componentRoute) ?? false;
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isHovered) {
                if (rootEl.current) {
                    scrollIntoView(rootEl.current, {
                        scrollMode: "if-needed",
                        block: "center",
                        inline: "nearest",
                        behavior: "smooth",
                    });
                }
            }
        }, 500);
        return () => {
            clearTimeout(timeout);
        };
    }, [isHovered]);

    return (
        <sc.Root
            ref={rootEl}
            onMouseOver={(e) => {
                if (iFrameBridge.iFrameReady) {
                    iFrameBridge.sendHoverComponent(componentRoute);
                    e.stopPropagation();
                }
            }}
            onMouseLeave={(e) => {
                if (iFrameBridge.iFrameReady) {
                    iFrameBridge.sendHoverComponent(null);
                    e.stopPropagation();
                }
            }}
        >
            <sc.Hover isHovered={isHovered} />
            <sc.Children>{children}</sc.Children>
        </sc.Root>
    );
};
