// MUI's implementation: https://github.com/mui/mui-x/blob/v7.x/packages/x-data-grid/src/components/columnsManagement/GridColumnsManagement.tsx
import {
    type ComponentsOverrides,
    type Divider as MuiDivider,
    type List as MuiList,
    type ListSubheader,
    type Theme,
    useThemeProps,
} from "@mui/material";
import { gridColumnVisibilityModelSelector, type GridPinnedColumnPosition, useGridApiContext, useGridSelector } from "@mui/x-data-grid";
import type { GridApiPro } from "@mui/x-data-grid-pro";
import { type ChangeEvent, useMemo } from "react";
import { FormattedMessage } from "react-intl";

import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { Body, Divider, List, ListHeader, Root } from "./DataGridColumnsManagement.sc";
import { DataGridColumnsManagementListItem } from "./DataGridColumnsManagementListItem";

export type DataGridColumnsManagementProps = ThemedComponentBaseProps<{
    root: "div";
    body: "div";
    list: typeof MuiList;
    listHeader: typeof ListSubheader;
    divider: typeof MuiDivider;
}>;

export type DataGridColumnsManagementClassKey = "root" | "body" | "list" | "listHeader" | "divider";

export const DataGridColumnsManagement = (inProps: DataGridColumnsManagementProps) => {
    const { sx, className, slotProps = {} } = useThemeProps({ props: inProps, name: "DextinityAdminDataGridColumnsManagement" });

    const apiRef = useGridApiContext<GridApiPro>();
    const columnVisibilityModel = useGridSelector(apiRef, gridColumnVisibilityModelSelector);
    const columns = apiRef.current.getAllColumns();

    const pinnedColumns = apiRef.current.getPinnedColumns();

    const toggleColumn = (event: ChangeEvent<HTMLInputElement>) => {
        const { name: field } = event.target;
        const column = columns.find((value) => value.field === field);
        if (column?.hideable) {
            const isCurrentlyVisible = columnVisibilityModel[field] !== false;

            const newVisibilityModel = {
                ...columnVisibilityModel,
                [field]: !isCurrentlyVisible,
            };

            apiRef.current.setColumnVisibilityModel(newVisibilityModel);
        }
    };

    const pinnedLeftColumns = useMemo(() => {
        return columns.filter((column) => {
            return pinnedColumns.left?.includes(column.field) ?? false;
        });
    }, [columns, pinnedColumns.left]);

    const nonPinnedColumns = useMemo(() => {
        return columns.filter((column) => {
            return !pinnedColumns.left?.includes(column.field) && !pinnedColumns.right?.includes(column.field);
        });
    }, [columns, pinnedColumns.left, pinnedColumns.right]);

    const pinnedRightColumns = useMemo(() => {
        return columns.filter((column) => {
            return pinnedColumns.right?.includes(column.field) ?? false;
        });
    }, [columns, pinnedColumns.right]);

    const handleOnPinColumn: (field: string, position: GridPinnedColumnPosition) => void = (field, position) => {
        const column = columns.find((value) => value.field === field);
        if (!column || !column.pinnable) {
            return;
        }

        const currentPosition = apiRef.current.isColumnPinned(field);

        const shouldPin = currentPosition === false || position !== currentPosition;
        if (shouldPin) {
            apiRef.current.pinColumn(field, position);
        } else {
            apiRef.current.unpinColumn(field);
        }
    };

    return (
        <Root sx={sx} className={className} {...slotProps.root}>
            <Body {...slotProps.body}>
                {pinnedLeftColumns.length > 0 && (
                    <>
                        <List
                            subheader={
                                <ListHeader {...slotProps.listHeader}>
                                    <FormattedMessage id="dextinity.dataGridColumnsManagement.header.pinnedLeft" defaultMessage="Pinned left" />
                                </ListHeader>
                            }
                            {...slotProps.list}
                        >
                            {pinnedLeftColumns.map((column, index) => {
                                return (
                                    <DataGridColumnsManagementListItem
                                        key={column.field}
                                        column={column}
                                        checked={columnVisibilityModel?.[column.field] ?? true}
                                        onPinColumnClick={handleOnPinColumn}
                                        onToggleClicked={toggleColumn}
                                    />
                                );
                            })}
                        </List>
                        <Divider {...slotProps.divider} />
                    </>
                )}

                {nonPinnedColumns.length > 0 && (
                    <>
                        <List
                            subheader={
                                <ListHeader {...slotProps.listHeader}>
                                    <FormattedMessage id="dextinity.dataGridColumnsManagement.header.scrolling" defaultMessage="Scrolling" />
                                </ListHeader>
                            }
                            {...slotProps.list}
                        >
                            {nonPinnedColumns.map((column, index) => {
                                return (
                                    <DataGridColumnsManagementListItem
                                        key={column.field}
                                        column={column}
                                        checked={columnVisibilityModel?.[column.field] ?? true}
                                        onPinColumnClick={handleOnPinColumn}
                                        onToggleClicked={toggleColumn}
                                    />
                                );
                            })}
                        </List>
                        <Divider {...slotProps.divider} />
                    </>
                )}
                {pinnedRightColumns.length > 0 && (
                    <List
                        subheader={
                            <ListHeader {...slotProps.listHeader}>
                                <FormattedMessage id="dextinity.dataGridColumnsManagement.header.pinnedright" defaultMessage="Pinned right" />
                            </ListHeader>
                        }
                        {...slotProps.list}
                    >
                        {pinnedRightColumns.map((column, index) => {
                            return (
                                <DataGridColumnsManagementListItem
                                    key={column.field}
                                    column={column}
                                    checked={columnVisibilityModel?.[column.field] ?? true}
                                    onPinColumnClick={handleOnPinColumn}
                                    onToggleClicked={toggleColumn}
                                />
                            );
                        })}
                    </List>
                )}
            </Body>
        </Root>
    );
};

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminDataGridColumnsManagement: DataGridColumnsManagementProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminDataGridColumnsManagement: DataGridColumnsManagementClassKey;
    }

    interface Components {
        DextinityAdminDataGridColumnsManagement?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminDataGridColumnsManagement"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminDataGridColumnsManagement"];
        };
    }
}
