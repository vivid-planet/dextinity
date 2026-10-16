import type { PreviewElement } from "./IFrameBridge";

export const BLOCK_PREVIEW_CONTAINER_DATA_ATTRIBUTE = "data-dextinity-block-preview-container";
export const PREVIEW_ELEMENT_SCROLLED_INTO_VIEW_EVENT = "dextinity-preview-element-scrolled-into-view";

export const removePreviewElementFromList = (previewElements: PreviewElement[], removedPreviewElement: PreviewElement) => {
    return previewElements.filter((previewElement) => previewElement.element !== removedPreviewElement.element);
};

// Must match the class names that `withPreview` from `@dextinity/mail-react` adds.
const PREVIEW_ROUTE_CLASS_PREFIX = "dextinity-preview-route:";
const PREVIEW_LABEL_CLASS_PREFIX = "dextinity-preview-label:";

export const PREVIEW_ROUTE_CLASS_SELECTOR = `[class*="${PREVIEW_ROUTE_CLASS_PREFIX}"]`;

function readClassNameValue(element: Element, prefix: string): string | undefined {
    const className = Array.from(element.classList).find((name) => name.startsWith(prefix));

    return className === undefined ? undefined : decodeURIComponent(className.slice(prefix.length));
}

export function readPreviewRouteAndLabelFromClassNames(element: Element): { adminRoute: string; label: string } | undefined {
    const adminRoute = readClassNameValue(element, PREVIEW_ROUTE_CLASS_PREFIX);

    if (adminRoute === undefined) {
        return undefined;
    }

    return { adminRoute, label: readClassNameValue(element, PREVIEW_LABEL_CLASS_PREFIX) ?? "" };
}

export const getRecursiveChildrenOfPreviewElement = (rootElement: Element): Element[] => {
    const previewElementChildNodes: Element[] = [];

    rootElement.childNodes.forEach((childNode) => {
        if (!(childNode instanceof Element)) {
            return;
        }

        if (childNode.hasAttribute(BLOCK_PREVIEW_CONTAINER_DATA_ATTRIBUTE)) {
            previewElementChildNodes.push(...getRecursiveChildrenOfPreviewElement(childNode));
        } else {
            previewElementChildNodes.push(childNode);
        }
    });

    return previewElementChildNodes;
};

export const getCombinedPositioningOfElements = (elements: Element[]) => {
    const topPositions: number[] = [];
    const leftPositions: number[] = [];
    const bottomPositions: number[] = [];
    const rightPositions: number[] = [];

    elements.forEach((element) => {
        const { top, left, bottom, right } = element.getBoundingClientRect();
        topPositions.push(top + window.scrollY);
        leftPositions.push(left + window.scrollX);
        bottomPositions.push(bottom - window.scrollY);
        rightPositions.push(right - window.scrollX);
    });

    const highestTopPosition = Math.min(...topPositions);
    const highestLeftPosition = Math.min(...leftPositions);

    const widthValues: number[] = [];
    const heightValues: number[] = [];

    elements.forEach((element) => {
        const { right, bottom } = element.getBoundingClientRect();
        widthValues.push(right - highestLeftPosition);
        heightValues.push(bottom - highestTopPosition + window.scrollY);
    });

    return {
        top: highestTopPosition,
        left: highestLeftPosition,
        width: Math.max(...widthValues),
        height: Math.max(...heightValues),
    };
};
