import { useSubRoutePrefix } from "@dextinity/admin";
import { type PropsWithChildren, useEffect, useRef } from "react";
import { useRouteMatch } from "react-router";
import scrollIntoView from "scroll-into-view-if-needed";

import * as sc from "./HoverPreviewComponent.sc";
import { useIFrameBridge } from "./useIFrameBridge";

interface HoverPreviewComponentProps {
    componentSlug: string;
}

function useComponentRoute(componentSlug: string) {
    const match = useRouteMatch();
    const subRoutePrefix = useSubRoutePrefix();

    if (componentSlug.startsWith("#")) {
        // The preview builds anchor routes from `parentUrl`, which doesn't contain the sub-route a composite block
        // renders its child blocks in, so the router match is the matching prefix.
        return `${match.url}${componentSlug}`;
    }

    // The preview builds page routes from `parentUrlSubRoute ?? parentUrl`, like the `StackSwitch` builds its page URLs, so they
    // contain the path of a `SubRoute`, for instance the one of a `SaveBoundary`. These components are rendered on the switch's
    // initial page, though, whose sub-route prefix has an additional `/index` segment.
    return `${subRoutePrefix.replace(/\/index$/, "")}/${componentSlug}`;
}

export const HoverPreviewComponent = ({ children, componentSlug }: PropsWithChildren<HoverPreviewComponentProps>) => {
    const componentRoute = useComponentRoute(componentSlug);
    const iFrameBridge = useIFrameBridge();
    const rootEl = useRef<HTMLDivElement | null>(null);

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
