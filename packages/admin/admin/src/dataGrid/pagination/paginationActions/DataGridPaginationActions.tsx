import { ChevronLeft, ChevronRight } from "@dextinity/admin-icons";
import {
    type ComponentsOverrides,
    IconButton,
    type TablePaginationActionsProps,
    type Theme,
    type Typography,
    useMediaQuery,
    useTheme,
    useThemeProps,
} from "@mui/material";
import { gridPageCountSelector, gridPaginationSelector, useGridApiContext, useGridSelector } from "@mui/x-data-grid";
import type { ThemedComponentBaseProps } from "helpers/ThemedComponentBaseProps";
import type { FunctionComponent, PropsWithChildren, ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { PageOf, PreviousNext, Root } from "./DataGridPaginationActions.styles";

export type DataGridPaginationActionsClassKey = "root" | "pageOf" | "previousNext";

type PaginationActions = "previous" | "next";

export type DataGridPaginationActionsProps = ThemedComponentBaseProps<{
    root: "div";
    pageOf: typeof Typography;
    previousNext: "div";
}> &
    TablePaginationActionsProps & {
        iconMapping?: Partial<Record<PaginationActions, ReactNode>>;
    };

const defaultIconMapping: Record<PaginationActions, ReactNode> = {
    previous: <ChevronLeft />,
    next: <ChevronRight />,
};

export const DataGridPaginationActions: FunctionComponent<PropsWithChildren<DataGridPaginationActionsProps>> = (inProps) => {
    const apiRef = useGridApiContext();
    const paginationState = useGridSelector(apiRef, gridPaginationSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    const theme = useTheme();
    const showPageOfStyled = useMediaQuery(theme.breakpoints.up("sm"));

    const {
        count,
        onPageChange,
        page,
        rowsPerPage,
        iconMapping: passedIconMapping = {},
        sx,
        className,
        slotProps = {},
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminDataGridPaginationActions",
    });
    const iconMapping = { ...defaultIconMapping, ...passedIconMapping };

    const isOnFirstPage = paginationState.paginationModel.page === 0;
    const isOnLastPage = count !== -1 ? paginationState.paginationModel.page >= Math.ceil(count / rowsPerPage) - 1 : false;
    return (
        <Root sx={sx} className={className} {...slotProps.root}>
            {showPageOfStyled && (
                <PageOf variant="body2" {...slotProps.pageOf}>
                    <FormattedMessage
                        defaultMessage="Page {page} of {pageCount}"
                        id="dextinity.dataGridPaginationActions.pageXOfY"
                        values={{
                            page: pageCount === 0 ? 0 : page + 1,
                            pageCount: pageCount,
                        }}
                    />
                </PageOf>
            )}

            <PreviousNext {...slotProps.previousNext}>
                <IconButton
                    disabled={isOnFirstPage}
                    onClick={(event) => {
                        onPageChange(event, page - 1);
                    }}
                >
                    {iconMapping["previous"]}
                </IconButton>

                <IconButton
                    disabled={isOnLastPage}
                    onClick={(event) => {
                        onPageChange(event, page + 1);
                    }}
                >
                    {iconMapping["next"]}
                </IconButton>
            </PreviousNext>
        </Root>
    );
};

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminDataGridPaginationActions: DataGridPaginationActionsProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminDataGridPaginationActions: DataGridPaginationActionsClassKey;
    }

    interface Components {
        DextinityAdminDataGridPaginationActions?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminDataGridPaginationActions"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminDataGridPaginationActions"];
        };
    }
}
