import { DragHandle } from "@dextinity/admin-icons";
import type { ComponentsOverrides } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { type ReactNode, useCallback, useRef } from "react";
import { type DropTargetMonitor, useDrag, useDrop, type XYCoord } from "react-dnd";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";
import { type IRow, type ITableProps, type ITableRowProps, Table, TableColumns, TableHeadColumns } from "./Table";
import { TableBodyRow } from "./TableBodyRow";

export type TableDndOrderClassKey = "root" | "dragCell" | "dragIconContainer";

interface IDndOrderRowProps<TRow extends IRow>
    extends ThemedComponentBaseProps<{
            dragCell: typeof TableCell;
            dragIconContainer: "div";
        }>,
        ITableRowProps<TRow> {
    moveRow: (dragIndex: number, hoverIndex: number) => void;
    onDragEnd?: () => void;
    dragHandleIcon: ReactNode;
}

interface DragItem {
    index: number;
    id: string;
}

function DndOrderRow<TRow extends IRow>(props: IDndOrderRowProps<TRow>) {
    const { columns, row, rowProps, slotProps } = props;

    const refDragHandle = useRef<HTMLTableCellElement>(null);
    const refRow = useRef<HTMLTableRowElement>(null);

    const [{ isDragging }, drag, dragPreview] = useDrag({
        type: "row", // TODO: configurable? unique per table?
        item: () =>
            ({
                id: props.row.id,
                index: props.index,
            }) as DragItem,
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
        end: () => {
            if (props.onDragEnd) {
                props.onDragEnd();
            }
        },
    });

    const [, drop] = useDrop({
        accept: "row",
        hover(item: DragItem, monitor: DropTargetMonitor) {
            // SOURCE for this code: https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_ts/04-sortable/simple

            if (!refRow.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = props.index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = refRow.current?.getBoundingClientRect();

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
            props.moveRow(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
    });

    const opacity = isDragging ? 0 : 1;

    drag(refDragHandle);
    drop(dragPreview(refRow));

    return (
        <TableBodyRow ref={refRow} {...rowProps} style={{ opacity }}>
            <DragCell ref={refDragHandle} {...slotProps?.dragCell}>
                <DragIconContainer {...slotProps?.dragIconContainer}>{props.dragHandleIcon}</DragIconContainer>
            </DragCell>
            <TableColumns columns={columns} row={row} />
        </TableBodyRow>
    );
}

const Root = createComponentSlot(Table)<TableDndOrderClassKey>({
    componentName: "TableDndOrder",
    slotName: "root",
})();

const DragCell = createComponentSlot(TableCell)<TableDndOrderClassKey>({
    componentName: "TableDndOrder",
    slotName: "dragCell",
})(css`
    cursor: grab;
    width: 20px;
    padding-right: 0;
`);

const DragIconContainer = createComponentSlot("div")<TableDndOrderClassKey>({
    componentName: "TableDndOrder",
    slotName: "dragIconContainer",
})(css`
    display: flex;
    align-items: center;
    justify-content: center;

    :after {
        // Increase clickable area to include the padding-left of the next cell.
        content: "";
        position: absolute;
        z-index: 1;
        top: 0;
        right: -20px;
        bottom: 0;
        left: 0;
    }
`);

interface TableDndOrderProps<TRow extends IRow>
    extends ThemedComponentBaseProps<{
            root: typeof Table;
            dragCell: typeof TableCell;
            dragIconContainer: "div";
        }>,
        ITableProps<TRow> {
    moveRow: (dragIndex: number, hoverIndex: number) => void;
    onDragEnd?: () => void;
    dragHandleIcon?: ReactNode;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function TableDndOrder<TRow extends IRow>(inProps: TableDndOrderProps<TRow>) {
    const {
        moveRow,
        onDragEnd,
        dragHandleIcon = <DragHandle />,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminTableDndOrder" });

    const renderHeadTableRow = useCallback<NonNullable<ITableProps<TRow>["renderHeadTableRow"]>>((ownProps) => {
        return (
            <TableRow>
                <TableCell />
                <TableHeadColumns {...ownProps} />
            </TableRow>
        );
    }, []);
    const renderTableRow = useCallback<NonNullable<ITableProps<TRow>["renderTableRow"]>>(
        (ownProps) => {
            return <DndOrderRow dragHandleIcon={dragHandleIcon} moveRow={moveRow} onDragEnd={onDragEnd} {...ownProps} />;
        },
        [dragHandleIcon, moveRow, onDragEnd],
    );

    const tableProps = {
        renderTableRow,
        renderHeadTableRow,
    };

    return <Root {...slotProps?.root} {...restProps} {...tableProps} />;
}

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminTableDndOrder: TableDndOrderProps<IRow>;
    }

    interface ComponentNameToClassKey {
        DextinityAdminTableDndOrder: TableDndOrderClassKey;
    }

    interface Components {
        DextinityAdminTableDndOrder?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminTableDndOrder"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminTableDndOrder"];
        };
    }
}
