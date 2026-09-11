import { type ComponentsOverrides, TablePagination, type TablePaginationProps, type Theme, type Typography, useThemeProps } from "@mui/material";
import { gridPageCountSelector, gridPaginationSelector, useGridApiContext, useGridRootProps, useGridSelector } from "@mui/x-data-grid";
import type { ThemedComponentBaseProps } from "helpers/ThemedComponentBaseProps";
import { type ChangeEvent, type FunctionComponent, useCallback } from "react";
import { FormattedMessage } from "react-intl";

import { PageInformation, Root } from "./DataGridPagination.styles";
import { DataGridPaginationActions } from "./paginationActions/DataGridPaginationActions";

export type DataGridPaginationClassKey = "root" | "pageInformation";

export type DataGridPaginationProps = ThemedComponentBaseProps<{
    root: "div";
    pageInformation: typeof Typography;
}>;

export const DataGridPagination: FunctionComponent<DataGridPaginationProps> = (inProps) => {
    const {
        sx,
        className,
        slotProps = {},
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminDataGridPagination",
    });

    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();

    const paginationState = useGridSelector(apiRef, gridPaginationSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    const handlePageChange = useCallback<TablePaginationProps["onPageChange"]>(
        (event, page) => {
            apiRef.current.setPage(page);
        },
        [apiRef],
    );

    const handlePageSizeChange = useCallback(
        (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            const newPageSize = Number(event.target.value);
            apiRef.current.setPageSize(newPageSize);
        },
        [apiRef],
    );

    return (
        <Root sx={sx} className={className} {...slotProps.root}>
            <PageInformation variant="body2" {...slotProps.pageInformation}>
                <FormattedMessage
                    id="dextinity.dataGridPagination.pageInformation"
                    defaultMessage="{itemsFrom}-{itemsTo} of {itemsTotal, plural, one {# item} other {# items}}"
                    values={{
                        itemsFrom:
                            paginationState.rowCount === 0 ? 0 : paginationState.paginationModel.page * paginationState.paginationModel.pageSize + 1,
                        itemsTo: Math.min(
                            (paginationState.paginationModel.page + 1) * paginationState.paginationModel.pageSize,
                            paginationState.rowCount,
                        ),
                        itemsTotal: paginationState.rowCount,
                    }}
                />
            </PageInformation>

            <TablePagination
                ActionsComponent={DataGridPaginationActions}
                component="div"
                count={paginationState.rowCount}
                labelDisplayedRows={() => {
                    return null;
                }}
                labelRowsPerPage={<FormattedMessage defaultMessage="Items per page:" id="dextinity.dataGridPagination.itemsPerPageLabel" />}
                page={paginationState.paginationModel.page <= pageCount ? paginationState.paginationModel.page : pageCount}
                rowsPerPage={paginationState.paginationModel.pageSize}
                rowsPerPageOptions={rootProps.pageSizeOptions?.includes(paginationState.paginationModel.pageSize) ? rootProps.pageSizeOptions : []}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handlePageSizeChange}
            />
        </Root>
    );
};

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminDataGridPagination: DataGridPaginationProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminDataGridPagination: DataGridPaginationClassKey;
    }

    interface Components {
        DextinityAdminDataGridPagination?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminDataGridPagination"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminDataGridPagination"];
        };
    }
}
