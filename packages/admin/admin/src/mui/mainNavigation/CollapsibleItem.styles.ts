import { Typography } from "@mui/material";
import { css } from "@mui/material/styles";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { MainNavigationContext } from "./Context";
import { MainNavigationItem, type MainNavigationItemLevel } from "./Item";

export type MainNavigationCollapsibleItemClassKey = "root" | "open" | "childSelected" | "mainNavigationItem" | "itemTitle" | "collapsibleIndicator";

export type OwnerState = {
    childSelected: boolean;
    open: boolean;
    menuOpen: boolean;
    subMenuOpen: boolean;
    level: MainNavigationItemLevel;
    variant: MainNavigationContext["drawerVariant"];
};

export const Root = createComponentSlot("div")<MainNavigationCollapsibleItemClassKey, OwnerState>({
    componentName: "MainNavigationCollapsibleItem",
    slotName: "root",
    classesResolver: (ownerState) => {
        return [ownerState.open && "open", ownerState.childSelected && "childSelected"];
    },
})(
    ({ theme, ownerState }) => css`
        ${
            ownerState.childSelected &&
            css`
                color: ${theme.palette.primary.main};
                font-weight: ${theme.typography.fontWeightMedium};
            `
        }
    `,
);

export const CollapsibleItemMainNavigationItem = createComponentSlot(MainNavigationItem)<MainNavigationCollapsibleItemClassKey, OwnerState>({
    componentName: "MainNavigationCollapsibleItem",
    slotName: "mainNavigationItem",
})(
    ({ theme, ownerState }) => css`
        background-color: ${theme.palette.common.white};
        ${
            !ownerState.menuOpen &&
            ownerState.level === 1 &&
            css`
                justify-content: space-between;
            `
        }

        ${
            ownerState.level === 2 &&
            ownerState.menuOpen &&
            ownerState.variant === "temporary" &&
            ownerState.subMenuOpen &&
            css`
                border-top: 1px solid ${theme.palette.grey[100]};
                background-color: ${theme.palette.grey[50]};

                :hover {
                    background-color: ${theme.palette.grey[100]} !important;
                }
            `
        }

        ${
            ownerState.childSelected &&
            css`
                .DextinityAdminMainNavigationItem-text,
                .DextinityAdminMainNavigationItem-icon {
                    color: ${theme.palette.primary.main};
                }

                .DextinityAdminMainNavigationItem-primary {
                    ${
                        (ownerState.level === 2 || ownerState.level === 3) &&
                        css`
                            font-weight: 600;
                        `
                    };
                }
            `
        }
    `,
);

export const ItemTitle = createComponentSlot(Typography)<MainNavigationCollapsibleItemClassKey>({
    componentName: "MainNavigationCollapsibleItem",
    slotName: "itemTitle",
})(
    ({ theme }) => css`
        font-size: 12px;
        line-height: 16px;
        font-weight: 600;
        padding: 20px 15px 20px 15px;
        color: ${theme.palette.grey[500]};
    `,
);

export const CollapsibleIndicator = createComponentSlot("div")<MainNavigationCollapsibleItemClassKey, OwnerState>({
    componentName: "MainNavigationCollapsibleItem",
    slotName: "collapsibleIndicator",
})(
    ({ theme, ownerState }) => css`
        font-size: 16px;
        line-height: 0;
        color: ${theme.palette.grey[900]};
        margin-left: 8px;

        ${
            ownerState.level === 1 &&
            !ownerState.menuOpen &&
            css`
                font-size: 12px;
                color: ${theme.palette.grey[200]};

                ${
                    ownerState.subMenuOpen &&
                    css`
                        color: ${theme.palette.common.white};
                    `
                }
            `
        }
    `,
);
