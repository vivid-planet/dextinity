import { css, IconButton, ListItem as MuiListItem, ListItemText, Switch as MuiSwitch } from "@mui/material";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { DataGridColumnsManagementListItemClassKey } from "./DataGridColumnsManagementListItem";

export const Root = createComponentSlot(MuiListItem)<DataGridColumnsManagementListItemClassKey>({
    componentName: "DataGridColumnsManagementListItem",
    slotName: "root",
})(css`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0;
    justify-content: space-between;
`);

export const SwitchTitleContainer = createComponentSlot("div")<DataGridColumnsManagementListItemClassKey>({
    componentName: "DataGridColumnsManagementListItem",
    slotName: "switchTitleContainer",
})(css`
    display: flex;
    align-items: center;
`);

export const Switch = createComponentSlot(MuiSwitch)<DataGridColumnsManagementListItemClassKey>({
    componentName: "DataGridColumnsManagementListItem",
    slotName: "switch",
})();

export const ListItemTitle = createComponentSlot(ListItemText)<DataGridColumnsManagementListItemClassKey>({
    componentName: "DataGridColumnsManagementListItem",
    slotName: "listItemTitle",
})();

type PinnedIconStyleProps = {
    active: boolean;
};

export const PinnedContainer = createComponentSlot("div")<DataGridColumnsManagementListItemClassKey>({
    componentName: "DataGridColumnsManagementListItem",
    slotName: "pinnedContainer",
})();

export const PinnedIconButton = createComponentSlot(IconButton)<DataGridColumnsManagementListItemClassKey, PinnedIconStyleProps>({
    componentName: "DataGridColumnsManagementListItem",
    slotName: "pinnedButton",
})(
    ({ theme, ownerState }) => css`
        color: ${ownerState.active ? theme.palette.primary.main : theme.palette.grey["200"]};
    `,
);
