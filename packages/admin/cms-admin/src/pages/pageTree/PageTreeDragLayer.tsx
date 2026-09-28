import { Box } from "@mui/material";
import { useDragLayer, type XYCoord } from "react-dnd";
import { FormattedMessage } from "react-intl/lib";

import PageLabel from "./PageLabel";
import * as sc from "./PageTreeDragLayer.sc";
import type { PageTreePage } from "./usePageTree";

function getItemStyles(initialOffset: XYCoord | null, currentOffset: XYCoord | null) {
    if (!initialOffset || !currentOffset) {
        return {
            display: "none",
        };
    }

    const { x, y } = currentOffset;
    return {
        transform: `translate(${x}px, ${y}px)`,
    };
}

interface PageTreeDragLayerProps {
    numberSelectedPages: number;
}

const PageTreeDragLayer = ({ numberSelectedPages }: PageTreeDragLayerProps) => {
    const { item, isAcceptedItemType, initialOffset, currentOffset, isDragging } = useDragLayer((monitor) => ({
        item: monitor.getItem() as PageTreePage,
        isAcceptedItemType: monitor.getItemType() === "row",
        initialOffset: monitor.getInitialClientOffset(),
        currentOffset: monitor.getClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    if (!isDragging || !isAcceptedItemType) {
        return null;
    }
    return (
        <sc.PageTreeDragLayerWrapper>
            <sc.PageTreeDragLayerInner style={getItemStyles(initialOffset, currentOffset)}>
                {!item.selected || numberSelectedPages === 1 ? (
                    <PageLabel page={item} />
                ) : (
                    <Box pl={4}>
                        <FormattedMessage
                            id="dextinity.pagetree.dragLayer.numberDraggedPages"
                            defaultMessage="{numItems} pages"
                            values={{ numItems: numberSelectedPages }}
                        />
                    </Box>
                )}
            </sc.PageTreeDragLayerInner>
        </sc.PageTreeDragLayerWrapper>
    );
};

export default PageTreeDragLayer;
