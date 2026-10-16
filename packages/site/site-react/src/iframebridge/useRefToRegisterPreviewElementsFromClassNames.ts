"use client";

import { type RefObject, useEffect, useRef } from "react";

import type { PreviewElement } from "./IFrameBridge";
import { useIFrameBridge } from "./useIFrameBridge";
import { PREVIEW_ROUTE_CLASS_SELECTOR, readPreviewRouteAndLabelFromClassNames } from "./utils";

function findPreviewElements(container: HTMLElement): PreviewElement[] {
    return Array.from(container.querySelectorAll(PREVIEW_ROUTE_CLASS_SELECTOR)).flatMap((element) => {
        const routeAndLabel = readPreviewRouteAndLabelFromClassNames(element);

        if (routeAndLabel === undefined || !(element instanceof HTMLElement)) {
            return [];
        }

        const previewElement: PreviewElement = { element, ...routeAndLabel, measurementTarget: "element" };

        return [previewElement];
    });
}

/**
 * Returns a ref for the element that contains the HTML. Registers the elements in it whose class names carry a preview route
 * with the block preview, for instance mail blocks wrapped in `withPreview` from `@dextinity/mail-react`.
 */
export function useRefToRegisterPreviewElementsFromClassNames<Container extends HTMLElement>(): RefObject<Container | null> {
    const containerRef = useRef<Container>(null);
    const { hasBridge, addPreviewElement, removePreviewElement } = useIFrameBridge();

    useEffect(() => {
        const container = containerRef.current;

        if (!hasBridge || container === null) {
            return;
        }

        let registeredElements: PreviewElement[] = [];

        const registerPreviewElements = () => {
            registeredElements.forEach(removePreviewElement);
            registeredElements = findPreviewElements(container);
            registeredElements.forEach(addPreviewElement);
        };

        registerPreviewElements();

        const mutationObserver = new MutationObserver(registerPreviewElements);
        mutationObserver.observe(container, { childList: true, subtree: true });

        return () => {
            mutationObserver.disconnect();
            registeredElements.forEach(removePreviewElement);
        };
    }, [hasBridge, addPreviewElement, removePreviewElement]);

    return containerRef;
}
