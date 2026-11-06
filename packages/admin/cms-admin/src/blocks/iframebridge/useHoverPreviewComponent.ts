import { useSubRoutePrefix } from "@dextinity/admin";
import { type MouseEvent, type RefObject, useEffect, useRef } from "react";
import { useRouteMatch } from "react-router";
import scrollIntoView from "scroll-into-view-if-needed";

import { useIFrameBridge } from "./useIFrameBridge";

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

interface HoverPreviewComponentApi<Element extends HTMLElement> {
    ref: RefObject<Element | null>;
    /** The component is hovered in the site preview. */
    isHovered: boolean;
    onMouseOver: (event: MouseEvent<Element>) => void;
    onMouseLeave: (event: MouseEvent<Element>) => void;
}

/**
 * Connects an element to its component in the site preview: hovering the element highlights the component there, and hovering the
 * component scrolls the element into view. Spread `onMouseOver` and `onMouseLeave` on the element and pass it `ref`.
 */
export function useHoverPreviewComponent<Element extends HTMLElement = HTMLElement>(componentSlug: string): HoverPreviewComponentApi<Element> {
    const componentRoute = useComponentRoute(componentSlug);
    const iFrameBridge = useIFrameBridge();
    const ref = useRef<Element | null>(null);

    const isHovered = iFrameBridge.hoveredSiteRoute?.includes(componentRoute) ?? false;
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isHovered && ref.current) {
                scrollIntoView(ref.current, {
                    scrollMode: "if-needed",
                    block: "center",
                    inline: "nearest",
                    behavior: "smooth",
                });
            }
        }, 500);
        return () => {
            clearTimeout(timeout);
        };
    }, [isHovered]);

    return {
        ref,
        isHovered,
        onMouseOver: (event) => {
            if (iFrameBridge.iFrameReady) {
                iFrameBridge.sendHoverComponent(componentRoute);
                event.stopPropagation();
            }
        },
        onMouseLeave: (event) => {
            if (iFrameBridge.iFrameReady) {
                iFrameBridge.sendHoverComponent(null);
                event.stopPropagation();
            }
        },
    };
}
