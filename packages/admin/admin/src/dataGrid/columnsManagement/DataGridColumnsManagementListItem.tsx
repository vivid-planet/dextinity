import { PinLeft, PinRight } from "@dextinity/admin-icons";
import {
    type ComponentsOverrides,
    type IconButton,
    type ListItem,
    type ListItemText,
    type Switch as MuiSwitch,
    type Theme,
    useThemeProps,
} from "@mui/material";
import { GridPinnedColumnPosition, useGridApiContext } from "@mui/x-data-grid";
import type { GridStateColDef } from "@mui/x-data-grid/internals";
import type { GridApiPro } from "@mui/x-data-grid-pro";
import type { ChangeEvent, FunctionComponent } from "react";

import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import { ListItemTitle, PinnedContainer, PinnedIconButton, Root, Switch, SwitchTitleContainer } from "./DataGridColumnsManagementListItem.styles";

export type DataGridColumnsManagementListItemClassKey =
    | "root"
    | "switchTitleContainer"
    | "switch"
    | "listItemTitle"
    | "pinnedContainer"
    | "pinnedButton";

export type DataGridColumnsManagementListItemProps = ThemedComponentBaseProps<{
    root: typeof ListItem;
    switchTitleContainer: "div";
    switch: typeof MuiSwitch;
    listItemTitle: typeof ListItemText;
    pinnedContainer: "div";
    pinnedButton: typeof IconButton;
}> & {
    column: GridStateColDef;
    onPinColumnClick: (field: string, position: GridPinnedColumnPosition) => void;
    onToggleClicked: (event: ChangeEvent<HTMLInputElement>) => void;
    checked: boolean;
};

export const DataGridColumnsManagementListItem: FunctionComponent<DataGridColumnsManagementListItemProps> = (inProps) => {
    const {
        sx,
        className,
        slotProps = {},
        column,
        checked,
        onToggleClicked,
        onPinColumnClick,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminDataGridColumnsManagementListItem",
    });

    const apiRef = useGridApiContext<GridApiPro>();

    const isPinnable = column.pinnable ?? false;

    const pinPosition = apiRef.current.isColumnPinned(column.field);

    return (
        <Root sx={sx} className={className} {...slotProps?.root} {...restProps}>
            <SwitchTitleContainer>
                <Switch name={column.field} checked={checked} onChange={onToggleClicked} disabled={!column.hideable} {...slotProps.switch} />
                <ListItemTitle
                    slotProps={{
                        primary: {
                            variant: checked ? "subtitle2" : "body2",
                        },
                    }}
                    {...slotProps.listItemTitle}
                >
                    {column.headerName || column.field}
                </ListItemTitle>
            </SwitchTitleContainer>
            <PinnedContainer>
                <PinnedIconButton
                    disabled={!isPinnable}
                    ownerState={{ active: pinPosition === GridPinnedColumnPosition.LEFT }}
                    onClick={() => {
                        onPinColumnClick(column.field, GridPinnedColumnPosition.LEFT);
                    }}
                    {...slotProps.pinnedButton}
                >
                    <PinLeft />
                </PinnedIconButton>
                <PinnedIconButton
                    disabled={!isPinnable}
                    ownerState={{ active: pinPosition === GridPinnedColumnPosition.RIGHT }}
                    onClick={() => {
                        onPinColumnClick(column.field, GridPinnedColumnPosition.RIGHT);
                    }}
                    {...slotProps.pinnedButton}
                >
                    <PinRight />
                </PinnedIconButton>
            </PinnedContainer>
        </Root>
    );
};

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminDataGridColumnsManagementListItem: DataGridColumnsManagementListItemProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminDataGridColumnsManagementListItem: DataGridColumnsManagementListItemClassKey;
    }

    interface Components {
        DextinityAdminDataGridColumnsManagementListItem?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminDataGridColumnsManagementListItem"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminDataGridColumnsManagementListItem"];
        };
    }
}
