import { messages } from "@dextinity/admin";
import { Copy, Delete, Drag, MoreVertical, Paste, Warning } from "@dextinity/admin-icons";
import { Checkbox, Divider, IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { type ChangeEvent, type JSX, type MouseEventHandler, type ReactNode, useRef, useState } from "react";
import { type DropTargetMonitor, useDrag, useDrop, type XYCoord } from "react-dnd";
import { FormattedMessage } from "react-intl";

import { InsertInBetweenAction } from "../../../common/InsertInBetweenAction";
import { InsertInBetweenActionButton } from "../../../common/InsertInBetweenActionButton";
import { usePromise } from "../usePromise";
import * as sc from "./BlockRow.sc";

const ItemTypes = {
    BLOCK: "block",
};

interface BlockRowProps {
    renderPreviewContent: () => ReactNode;
    onContentClick?: () => void;
    onDeleteClick?: () => void;
    id: string;
    index: number;
    moveBlock: (dragIndex: number, hoverIndex: number) => void;
    visibilityButton: ReactNode;
    onAddNewBlock: (beforeIndex: number) => void;
    onCopyClick?: () => void;
    onPasteClick?: () => void;
    selected: boolean;
    onSelectedClick?: (selected: boolean) => void;
    isValidFn: () => boolean | Promise<boolean>;
    slideIn: boolean;
    hideBottomInsertBetweenButton?: boolean;
    additionalMenuItems?: (onMenuClose: () => void) => ReactNode;
    additionalContent?: ReactNode;
}

interface IDragItem {
    index: number;
    id: string;
    type: string;
}

export function BlockRow(props: BlockRowProps): JSX.Element {
    const { index, onAddNewBlock, slideIn } = props;
    const ref = useRef<HTMLDivElement>(null);
    const [, drop] = useDrop<IDragItem>({
        accept: ItemTypes.BLOCK,
        hover(item, monitor: DropTargetMonitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = props.index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            // Time to actually perform the action
            props.moveBlock(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
    });

    const [hover, setHover] = useState(false);
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.BLOCK,
        item: { type: ItemTypes.BLOCK, id: props.id, index: props.index }, // type in item should not be needed anymore since react-dnd 14
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));

    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();

    const handleMoreClick: MouseEventHandler<HTMLElement> = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(undefined);
    };

    const handleCopyClick = () => {
        props.onCopyClick?.();
        handleMenuClose();
    };

    const handlePasteClick = () => {
        props.onPasteClick?.();
        handleMenuClose();
    };

    const handleDeleteClick = () => {
        props.onDeleteClick?.();
        handleMenuClose();
    };

    // Evaluate is valid
    const isValid = usePromise(props.isValidFn, { initialValue: true });

    return (
        <sc.BlockWrapper>
            <sc.AddContainer>
                <InsertInBetweenAction
                    top={<InsertInBetweenActionButton onClick={() => onAddNewBlock(index)} />}
                    bottom={!props.hideBottomInsertBetweenButton && <InsertInBetweenActionButton onClick={() => onAddNewBlock(index + 1)} />}
                />
            </sc.AddContainer>
            <sc.Root
                ref={ref}
                style={{ opacity }}
                onMouseEnter={() => {
                    setHover(true);
                }}
                onMouseLeave={() => {
                    setHover(false);
                }}
                isMouseHover={hover}
                slideIn={slideIn}
            >
                <sc.BlockGrabber>
                    <Drag color="inherit" />
                </sc.BlockGrabber>

                <sc.InnerBlock>
                    <sc.SelectBlock>
                        {hover || props.selected ? (
                            <Checkbox
                                checked={props.selected}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                    props.onSelectedClick?.(event.target.checked);
                                }}
                            />
                        ) : (
                            <>{!isValid ? <Warning color="error" /> : null}</>
                        )}
                    </sc.SelectBlock>
                    <sc.OuterContent>
                        <sc.Content>
                            <sc.PreviewTextContainer>{props.renderPreviewContent()}</sc.PreviewTextContainer>
                        </sc.Content>
                        {props.additionalContent}
                    </sc.OuterContent>
                    <sc.ButtonContainer>
                        {props.visibilityButton}
                        <IconButton size="small" onClick={handleMoreClick}>
                            <MoreVertical color="action" />
                        </IconButton>
                    </sc.ButtonContainer>
                </sc.InnerBlock>
                <sc.RowClickContainer
                    onClick={() => {
                        if (props.onContentClick) {
                            props.onContentClick();
                        }
                    }}
                />

                <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleCopyClick}>
                        <ListItemIcon>
                            <Copy />
                        </ListItemIcon>
                        <FormattedMessage {...messages.copy} />
                    </MenuItem>
                    <MenuItem onClick={handlePasteClick}>
                        <ListItemIcon>
                            <Paste />
                        </ListItemIcon>
                        <FormattedMessage {...messages.paste} />
                    </MenuItem>
                    {props.additionalMenuItems?.(handleMenuClose)}
                    <Divider />
                    <MenuItem onClick={handleDeleteClick}>
                        <ListItemIcon>
                            <Delete />
                        </ListItemIcon>
                        <FormattedMessage {...messages.delete} />
                    </MenuItem>
                </Menu>
            </sc.Root>
        </sc.BlockWrapper>
    );
}
