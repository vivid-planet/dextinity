import { css, Divider as MuiDivider, List as MuiList, ListSubheader } from "@mui/material";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { DataGridColumnsManagementClassKey } from "./DataGridColumnsManagement";

export const Root = createComponentSlot("div")<DataGridColumnsManagementClassKey>({
    componentName: "DataGridColumnsManagement",
    slotName: "root",
})();

export const List = createComponentSlot(MuiList)<DataGridColumnsManagementClassKey>({
    componentName: "DataGridColumnsManagement",
    slotName: "list",
})(css`
    width: 100%;
`);

export const ListHeader = createComponentSlot(ListSubheader)<DataGridColumnsManagementClassKey>({
    componentName: "DataGridColumnsManagement",
    slotName: "listHeader",
})(
    ({ theme }) => css`
        padding-left: ${theme.spacing(2)};
    `,
);

export const Divider = createComponentSlot(MuiDivider)<DataGridColumnsManagementClassKey>({
    componentName: "DataGridColumnsManagement",
    slotName: "divider",
})(css`
    width: 100%;
`);

export const Body = createComponentSlot("div")<DataGridColumnsManagementClassKey>({
    componentName: "DataGridColumnsManagement",
    slotName: "body",
})(
    ({ theme }) => css`
        padding: ${theme.spacing(2)};
        display: flex;
        flex-direction: column;
        overflow: auto;
        flex: 1 1;
        max-height: 400px;
        align-items: flex-start;
    `,
);
