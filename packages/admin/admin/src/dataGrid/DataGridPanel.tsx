import { Add, Check, Close, Reset } from "@dextinity/admin-icons";
import {
    type ComponentsOverrides,
    css,
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogContent,
    Divider,
    type Theme,
    Typography,
    useMediaQuery,
    useTheme,
    useThemeProps,
} from "@mui/material";
import {
    gridColumnVisibilityModelSelector,
    gridFilterableColumnDefinitionsSelector,
    type GridFilterItem,
    gridFilterModelSelector,
    GridPanel,
    type GridPanelProps,
    gridPreferencePanelStateSelector,
    GridPreferencePanelsValue,
    useGridApiContext,
    useGridRootProps,
    useGridSelector,
} from "@mui/x-data-grid";
import type { DataGridProcessedProps } from "@mui/x-data-grid/internals";
import { type ReactNode, useCallback, useMemo } from "react";
import { FormattedMessage } from "react-intl";

import { Button } from "../common/buttons/Button";
import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

const panelTypeTitle: Record<GridPreferencePanelsValue, ReactNode> = {
    [GridPreferencePanelsValue.filters]: <FormattedMessage id="dextinity.dataGrid.panel.filters" defaultMessage="Filters" />,
    [GridPreferencePanelsValue.columns]: <FormattedMessage id="dextinity.dataGrid.panel.columns" defaultMessage="Columns" />,
    [GridPreferencePanelsValue.aiAssistant]: <FormattedMessage id="dextinity.dataGrid.panel.aiAssistant" defaultMessage="AI Assistant" />,
};

export type DataGridPanelClassKey =
    | "desktopGridPanel"
    | "desktopPanelFooterDivider"
    | "desktopPanelFooter"
    | "desktopAddFilterButton"
    | "mobileDialog"
    | "mobileDialogHeader"
    | "mobileDialogTitle"
    | "mobileDialogCloseButton"
    | "mobileDialogContent"
    | "mobileDialogFooter"
    | "mobileAddFilterButtonWrapper"
    | "mobileAddFilterButton"
    | "mobileDialogFooterActions"
    | "resetFiltersButton"
    | "resetColumnsButton"
    | "applyButton";

export type DataGridPanelProps = GridPanelProps &
    Omit<
        ThemedComponentBaseProps<{
            desktopGridPanel: typeof GridPanel;
            desktopPanelFooterDivider: typeof Divider;
            desktopPanelFooter: "div";
            desktopAddFilterButton: typeof Button;
            mobileDialog: typeof Dialog;
            mobileDialogHeader: "div";
            mobileDialogTitle: typeof Typography;
            mobileDialogCloseButton: typeof Button;
            mobileDialogContent: typeof DialogContent;
            mobileDialogFooter: "div";
            mobileAddFilterButtonWrapper: "div";
            mobileAddFilterButton: typeof Button;
            mobileDialogFooterActions: "div";
            resetFiltersButton: typeof Button;
            resetColumnsButton: typeof Button;
            applyButton: typeof Button;
        }>,
        "sx"
    > & {
        iconMapping?: {
            closeDialog?: ReactNode;
            addFilter?: ReactNode;
            resetFilters?: ReactNode;
            resetColumns?: ReactNode;
            apply?: ReactNode;
        };
    };

const addFilterText = <FormattedMessage id="dextinity.dataGrid.panel.addFilter" defaultMessage="Add filter" />;

let lastAddedFilterItemId = 0;

export const DataGridPanel = (inProps: DataGridPanelProps) => {
    const {
        children,
        open,
        slotProps,
        iconMapping = {},
        onClose,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminDataGridPanel" });
    const apiRef = useGridApiContext();
    const filterModel = useGridSelector(apiRef, gridFilterModelSelector);
    const filterableColumns = useGridSelector(apiRef, gridFilterableColumnDefinitionsSelector);
    const { openedPanelValue } = useGridSelector(apiRef, gridPreferencePanelStateSelector);
    const initialColumnVisibilityModel = useMemo(() => gridColumnVisibilityModelSelector(apiRef), [apiRef]);
    const rootProps = useGridRootProps();

    const {
        closeDialog: closeDialogIcon = <Close />,
        addFilter: addFilterIcon = <Add />,
        resetFilters: resetFiltersIcon = <Reset />,
        resetColumns: resetColumnsIcon = <Reset />,
        apply: applyIcon = <Check />,
    } = iconMapping;

    const geNewFilterItem = useCallback(() => {
        const firstColumnWithOperator = filterableColumns.find((colDef) => colDef.filterOperators?.length);

        if (!firstColumnWithOperator?.filterOperators?.length) {
            return null;
        }

        return {
            field: firstColumnWithOperator.field,
            operator: firstColumnWithOperator.filterOperators[0].value,
            id: lastAddedFilterItemId++,
        };
    }, [filterableColumns]);

    const filterItems = useMemo<GridFilterItem[]>(() => {
        if (filterModel.items.length) {
            return filterModel.items;
        }

        const newFilterItem = geNewFilterItem();

        if (newFilterItem) {
            return [newFilterItem];
        }

        return [];
    }, [filterModel.items, geNewFilterItem]);

    const addNewFilter = useCallback(() => {
        const newFilterItem = geNewFilterItem();

        if (newFilterItem) {
            apiRef.current.upsertFilterItems([...filterItems, newFilterItem]);
        }
    }, [apiRef, filterItems, geNewFilterItem]);

    const resetFilters = useCallback(() => {
        apiRef.current.setFilterModel({ items: [] });
    }, [apiRef]);

    const resetColumns = useCallback(() => {
        apiRef.current.setColumnVisibilityModel(initialColumnVisibilityModel);
    }, [apiRef, initialColumnVisibilityModel]);

    const closeDialog = useCallback(() => {
        onClose?.();
    }, [onClose]);

    const theme = useTheme();
    const renderFullScreen = useMediaQuery(theme.breakpoints.down("md"));

    const resetFiltersButton = (
        <ResetFiltersButton variant="outlined" startIcon={resetFiltersIcon} onClick={resetFilters} {...slotProps?.resetFiltersButton}>
            <FormattedMessage id="dextinity.dataGrid.panel.resetFilters" defaultMessage="Reset filters" />
        </ResetFiltersButton>
    );

    const resetColumnsButton = (
        <ResetColumnsButton variant="outlined" startIcon={resetColumnsIcon} onClick={resetColumns} {...slotProps?.resetColumnsButton}>
            <FormattedMessage id="dextinity.dataGrid.panel.resetColumns" defaultMessage="Reset columns" />
        </ResetColumnsButton>
    );

    const applyButton = (
        <ApplyButton startIcon={applyIcon} onClick={closeDialog} {...slotProps?.applyButton}>
            <FormattedMessage id="dextinity.dataGrid.panel.apply" defaultMessage="Apply" />
        </ApplyButton>
    );

    if (renderFullScreen) {
        return (
            <MobileDialog open={open} onClose={closeDialog} fullScreen {...slotProps?.mobileDialog}>
                <MobileDialogHeader {...slotProps?.mobileDialogHeader}>
                    <MobileDialogTitle {...slotProps?.mobileDialogTitle}>{!!openedPanelValue && panelTypeTitle[openedPanelValue]}</MobileDialogTitle>
                    <MobileDialogCloseButton {...slotProps?.mobileDialogCloseButton} variant="textDark" onClick={closeDialog}>
                        {closeDialogIcon}
                    </MobileDialogCloseButton>
                </MobileDialogHeader>
                <MobileDialogContent {...slotProps?.mobileDialogContent}>{children}</MobileDialogContent>
                <MobileDialogFooter {...slotProps?.mobileDialogFooter}>
                    {openedPanelValue === GridPreferencePanelsValue.filters && !rootProps.disableMultipleColumnsFiltering && (
                        <MobileAddFilterButtonWrapper {...slotProps?.mobileAddFilterButtonWrapper}>
                            <MobileAddFilterButton
                                variant="textDark"
                                startIcon={addFilterIcon}
                                onClick={addNewFilter}
                                {...slotProps?.mobileAddFilterButton}
                            >
                                {addFilterText}
                            </MobileAddFilterButton>
                        </MobileAddFilterButtonWrapper>
                    )}
                    <MobileDialogFooterActions {...slotProps?.mobileDialogFooterActions}>
                        {openedPanelValue === GridPreferencePanelsValue.filters && (
                            <>
                                {resetFiltersButton}
                                {applyButton}
                            </>
                        )}
                        {openedPanelValue === GridPreferencePanelsValue.columns && (
                            <>
                                {resetColumnsButton}
                                {applyButton}
                            </>
                        )}
                    </MobileDialogFooterActions>
                </MobileDialogFooter>
            </MobileDialog>
        );
    }

    return (
        <DesktopGridPanel ownerState={rootProps} open={open} onClose={onClose} {...slotProps?.desktopGridPanel} {...restProps}>
            {children}
            <DesktopPanelFooterDivider {...slotProps?.desktopPanelFooterDivider} />
            <DesktopPanelFooter {...slotProps?.desktopPanelFooter}>
                {openedPanelValue === GridPreferencePanelsValue.filters && (
                    <>
                        <div>
                            {!rootProps.disableMultipleColumnsFiltering && (
                                <DesktopAddFilterButton variant="outlined" startIcon={addFilterIcon} onClick={addNewFilter}>
                                    {addFilterText}
                                </DesktopAddFilterButton>
                            )}
                        </div>
                        {resetFiltersButton}
                    </>
                )}
                {openedPanelValue === GridPreferencePanelsValue.columns && (
                    <>
                        {resetColumnsButton}
                        {applyButton}
                    </>
                )}
            </DesktopPanelFooter>
        </DesktopGridPanel>
    );
};

const DesktopGridPanel = createComponentSlot(GridPanel)<DataGridPanelClassKey, DataGridProcessedProps>({
    componentName: "DataGridPanel",
    slotName: "desktopGridPanel",
})(
    ({ theme }) => css`
        .MuiDataGrid-panelHeader,
        .MuiDataGrid-columnsManagementHeader,
        .MuiDataGrid-panelFooter,
        .MuiDataGrid-columnsManagementFooter {
            // Hide MUIs header and footer so we can add our own with a better structure for styling
            display: none;
        }

        .MuiDataGrid-paper {
            border: 1px solid ${theme.palette.grey[100]};
            box-shadow: ${theme.shadows[4]};
            border-radius: 4px;
            max-height: none;
            flex-direction: column;
            padding: 0;
        }
    `,
);

const DesktopPanelFooterDivider = createComponentSlot(Divider)<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "desktopPanelFooterDivider",
})();

const DesktopPanelFooter = createComponentSlot("div")<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "desktopPanelFooter",
})(
    ({ theme }) => css`
        display: flex;
        justify-content: space-between;
        padding: ${theme.spacing(4)};
        gap: ${theme.spacing(3)};
    `,
);

const DesktopAddFilterButton = createComponentSlot(Button)<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "desktopAddFilterButton",
})();

const MobileDialog = createComponentSlot(Dialog)<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "mobileDialog",
})(css`
    .MuiDataGrid-panelContent,
    .MuiDataGrid-columnsManagement {
        max-height: none;
    }

    .MuiDataGrid-panelHeader,
    .MuiDataGrid-columnsManagementHeader,
    .MuiDataGrid-panelFooter,
    .MuiDataGrid-columnsManagementFooter {
        // Hide MUIs header and footer so we can add our own with a better structure for styling
        display: none;
    }
`);

const MobileDialogHeader = createComponentSlot("div")<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "mobileDialogHeader",
})(
    ({ theme }) => css`
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: ${theme.spacing(2)};
        padding-left: ${theme.spacing(4)};
        box-shadow: ${theme.shadows[4]};
    `,
);

const MobileDialogTitle = createComponentSlot(Typography)<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "mobileDialogTitle",
})();

const MobileDialogCloseButton = createComponentSlot(Button)<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "mobileDialogCloseButton",
})(css`
    min-width: 0; // TODO: Should this be done in the theme?
`);

const MobileDialogContent = createComponentSlot(DialogContent)<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "mobileDialogContent",
})(
    ({ theme }) => css`
        padding: 0;
        background-color: white;

        ${theme.breakpoints.up("sm")} {
            padding: 0;
        }
    `,
);

const MobileDialogFooter = createComponentSlot("div")<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "mobileDialogFooter",
})();

const MobileAddFilterButtonWrapper = createComponentSlot("div")<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "mobileAddFilterButtonWrapper",
})(
    ({ theme }) => css`
        position: relative;
        display: flex;
        justify-content: center;
        padding: ${theme.spacing(2)} ${theme.spacing(4)};
        box-shadow: ${theme.shadows[4]};
        border-bottom: 1px solid ${theme.palette.divider};
    `,
);

const MobileAddFilterButton = createComponentSlot(Button)<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "mobileAddFilterButton",
})();

const MobileDialogFooterActions = createComponentSlot("div")<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "mobileDialogFooterActions",
})(
    ({ theme }) => css`
        display: flex;
        justify-content: space-between;
        padding: ${theme.spacing(4)};
        box-shadow: ${theme.shadows[4]};
    `,
);

const ResetFiltersButton = createComponentSlot(Button)<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "resetFiltersButton",
})();

const ResetColumnsButton = createComponentSlot(Button)<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "resetColumnsButton",
})();

const ApplyButton = createComponentSlot(Button)<DataGridPanelClassKey>({
    componentName: "DataGridPanel",
    slotName: "applyButton",
})();

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminDataGridPanel: DataGridPanelProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminDataGridPanel: DataGridPanelClassKey;
    }

    interface Components {
        DextinityAdminDataGridPanel?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminDataGridPanel"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminDataGridPanel"];
        };
    }
}
