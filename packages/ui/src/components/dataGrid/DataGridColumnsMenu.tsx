import { type ForwardedRef, forwardRef, type ReactElement, type ReactNode, type RefAttributes, useState } from "react";

import { Menu, type MenuPlacement, type MenuProps } from "../menu/Menu";
import { MenuCheckboxItem } from "../menu/MenuCheckboxItem";
import type { DataGridColumn, DataGridColumnVisibility } from "./DataGrid";

export interface DataGridColumnsMenuProps<Row> extends Omit<MenuProps, "trigger" | "children" | "open" | "onOpenChange" | "placement"> {
    /** The columns of the grid, in their order. */
    columns: DataGridColumn<Row>[];
    /** Which columns are shown; a column missing here is shown. */
    columnVisibility: DataGridColumnVisibility;
    /** Called with the new visibility when a column is switched. */
    onColumnVisibilityChange: (columnVisibility: DataGridColumnVisibility) => void;
    /** The element that opens the menu, e.g. an `IconButton` or a `Button` in a toolbar. */
    trigger: ReactElement;
    /**
     * The preferred position next to the trigger.
     *
     * @defaultValue `"bottom-start"`
     */
    placement?: MenuPlacement;
}

/**
 * A menu to show and hide the columns of a `DataGrid`. Columns with `hideable: false` and the last shown column can't be hidden.
 * The grid shows it in its header when `onColumnVisibilityChange` is set; use it directly to place it in a toolbar.
 */
export const DataGridColumnsMenu = forwardRef(function DataGridColumnsMenu<Row>(
    { columns, columnVisibility, onColumnVisibilityChange, trigger, placement, ...restProps }: DataGridColumnsMenuProps<Row>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const [open, setOpen] = useState(false);
    const shownCount = columns.filter((column) => columnVisibility[column.key] !== false).length;

    return (
        <Menu {...restProps} ref={ref} open={open} onOpenChange={setOpen} placement={placement} trigger={trigger}>
            {columns.map((column) => {
                const shown = columnVisibility[column.key] !== false;
                return (
                    <MenuCheckboxItem
                        key={column.key}
                        label={column.header}
                        checked={shown}
                        disabled={column.hideable === false || (shown && shownCount === 1)}
                        onChange={(checked) => onColumnVisibilityChange({ ...columnVisibility, [column.key]: checked })}
                    />
                );
            })}
        </Menu>
    );
}) as <Row>(props: DataGridColumnsMenuProps<Row> & RefAttributes<HTMLDivElement>) => ReactNode;
