import { Filter } from "@dextinity/admin-icons";
import type { ComponentsOverrides } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import { type PropsWithChildren, type ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";

import { createComponentSlot } from "../../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../../helpers/ThemedComponentBaseProps";
import { FilterBarButton } from "../filterBarButton/FilterBarButton";

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export type FilterBarMoreFiltersClassKey = "root" | "button";

const Root = createComponentSlot("div")<FilterBarMoreFiltersClassKey>({
    componentName: "FilterBarMoreFilters",
    slotName: "root",
})(css`
    margin-bottom: 10px;
    margin-right: 6px;
`);

const StyledFilterBarButton = createComponentSlot(FilterBarButton)<FilterBarMoreFiltersClassKey>({
    componentName: "FilterBarMoreFilters",
    slotName: "button",
})(
    ({ theme }) => css`
        font-weight: ${theme.typography.fontWeightBold};
    `,
);

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface FilterBarMoreFiltersProps
    extends ThemedComponentBaseProps<{
        root: "div";
        button: typeof FilterBarButton;
    }> {
    icon?: ReactNode;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function FilterBarMoreFilters(inProps: PropsWithChildren<FilterBarMoreFiltersProps>) {
    const {
        children,
        icon = <Filter />,
        slotProps,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminFilterBarMoreFilters",
    });
    const [hasExtended, setHasExtended] = useState(false);

    if (hasExtended) {
        return <>{children}</>;
    }

    return (
        <Root {...slotProps?.root} {...restProps}>
            <StyledFilterBarButton {...slotProps?.button} onClick={() => setHasExtended(true)} startIcon={icon} endIcon={null}>
                <FormattedMessage id="dextinity.filterbar.moreFilter" defaultMessage="More Filter" />
            </StyledFilterBarButton>
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminFilterBarMoreFilters: FilterBarMoreFiltersClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminFilterBarMoreFilters: FilterBarMoreFiltersProps;
    }

    interface Components {
        DextinityAdminFilterBarMoreFilters?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminFilterBarMoreFilters"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminFilterBarMoreFilters"];
        };
    }
}
