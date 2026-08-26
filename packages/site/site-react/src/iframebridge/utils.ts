export const BLOCK_PREVIEW_CONTAINER_DATA_ATTRIBUTE = "data-dextinity-block-preview-container";
export const PREVIEW_ELEMENT_SCROLLED_INTO_VIEW_EVENT = "dextinity-preview-element-scrolled-into-view";

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
