import { css, FormControl, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { DataGridPaginationClassKey } from "./DataGridPagination";

export const Root = createComponentSlot("div")<DataGridPaginationClassKey>({
    componentName: "DataGridPagination",
    slotName: "root",
})(css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 12px;
`);

export const PageInformation = createComponentSlot(Typography)<DataGridPaginationClassKey>({
    componentName: "DataGridPagination",
    slotName: "pageInformation",
})();

// Prevents the page size select from registering with a surrounding `FormControl`, e.g., of a field that opens a dialog containing the data grid
export const PageSizeFormControl = styled(FormControl)`
    display: contents;
`;
