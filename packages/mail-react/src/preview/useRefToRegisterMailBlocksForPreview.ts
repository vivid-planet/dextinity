"use client";

import { type RefObject, useEffect, useRef } from "react";

import { PREVIEW_ROUTE_CLASS_SELECTOR, readPreviewRouteAndLabelFromClassNames } from "./blockPreviewClassName.js";

export interface PreviewElement {
    element: HTMLElement;
    adminRoute: string;
    label: string;
    measurementTarget: "element";
}

export interface IFrameBridge {
    hasBridge: boolean;
    addPreviewElement: (previewElement: PreviewElement) => void;
    removePreviewElement: (previewElement: PreviewElement) => void;
}

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
 * Returns a ref for the element that contains the mail HTML. Registers the blocks in it that use `withPreview` with the block preview.
 *
 * @param iFrameBridge The result of `useIFrameBridge` from `@dextinity/site-react`.
 */
export function useRefToRegisterMailBlocksForPreview<Container extends HTMLElement>({
    hasBridge,
    addPreviewElement,
    removePreviewElement,
}: IFrameBridge): RefObject<Container | null> {
    const containerRef = useRef<Container>(null);

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
