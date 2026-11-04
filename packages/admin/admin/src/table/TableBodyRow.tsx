import { type ComponentsOverrides, TableRow } from "@mui/material";
import { type Theme, useThemeProps } from "@mui/material/styles";
import type { TableRowProps } from "@mui/material/TableRow";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export type TableBodyRowClassKey = "root" | "even" | "odd";

type OwnerState = { isOdd: boolean };

const Root = createComponentSlot(TableRow)<TableBodyRowClassKey, OwnerState>({
    componentName: "TableBodyRow",
    slotName: "root",
    classesResolver(ownerState) {
        return [!ownerState.isOdd && "even", ownerState.isOdd && "odd"];
    },
})();

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface TableBodyRowProps
    extends
        ThemedComponentBaseProps<{
            root: typeof TableRow;
        }>,
        TableRowProps {
    index?: number;
    hideTableHead?: boolean;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function TableBodyRow(inProps: TableBodyRowProps) {
    const { title, children, index, hideTableHead, slotProps, ...restProps } = useThemeProps({ props: inProps, name: "DextinityAdminTableBodyRow" });

    const ownerState: OwnerState = {
        isOdd: ((index || 0) + (hideTableHead ? 1 : 0)) % 2 === 1,
    };

    return (
        <Root ownerState={ownerState} {...slotProps?.root} {...restProps}>
            {children}
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminTableBodyRow: TableBodyRowClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminTableBodyRow: TableBodyRowProps;
    }

    interface Components {
        DextinityAdminTableBodyRow?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminTableBodyRow"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminTableBodyRow"];
        };
    }
}
