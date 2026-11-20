import { useCallback, useState } from "react";

const themeBoundarySelector = "[data-dextinity-color-scheme]";

/**
 * Finds the closest `Theme` around an element, so a popup portaled there keeps that theme's color scheme, brand, and density.
 * Pass `anchorRef` to the element the popup belongs to and `container` to the portal; outside a `Theme`, `container` is
 * `undefined`, which portals to the document body.
 */
export function useThemePortalContainer<AnchorElement extends Element>() {
    const [anchor, setAnchor] = useState<AnchorElement | null>(null);
    const anchorRef = useCallback((element: AnchorElement | null) => setAnchor(element), []);
    const container = anchor?.closest<HTMLElement>(themeBoundarySelector) ?? undefined;

    return { anchor, anchorRef, container };
}
