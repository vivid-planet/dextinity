import { css, ListItemButton, ListItemIcon, listItemIconClasses, ListItemText, listItemTextClasses } from "@mui/material";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { MainNavigationContext } from "./Context";
import type { MainNavigationItemLevel } from "./Item";

export type MainNavigationItemClassKey =
    "root" | "level1" | "level2" | "level3" | "open" | "hasIcon" | "hasSecondaryText" | "hasSecondaryAction" | "icon" | "text" | "tooltip";

export type OwnerState = {
    level: MainNavigationItemLevel;
    open: boolean;
    collapsibleOpen: boolean;
    hasSubItems: boolean;
    hasIcon: boolean;
    hasSecondaryText: boolean;
    hasSecondaryAction: boolean;
    variant: MainNavigationContext["drawerVariant"];
};

export const Root = createComponentSlot(ListItemButton)<MainNavigationItemClassKey, OwnerState>({
    componentName: "MainNavigationItem",
    slotName: "root",
    classesResolver(ownerState) {
        return [
            ownerState.level === 1 && "level1",
            ownerState.level === 2 && "level2",
            ownerState.level === 3 && "level3",
            ownerState.open && "open",
            ownerState.hasIcon && "hasIcon",
            ownerState.hasSecondaryText && "hasSecondaryText",
            ownerState.hasSecondaryAction && "hasSecondaryAction",
        ];
    },
})(
    ({ theme, ownerState }) => css`
        flex-shrink: 0;
        flex-grow: 0;

        &:after {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 2px;
            display: ${ownerState.open ? "block" : "none"};
        }

        .${listItemIconClasses.root} {
            color: ${theme.palette.grey[900]};
            min-width: unset;
        }

        .${listItemTextClasses.inset} {
            padding-left: ${ownerState.hasIcon && ownerState.level === 1 ? 30 : 0}px;
        }

        .Mui-selected .${listItemTextClasses.secondary} {
            color: inherit;
        }

        .${listItemTextClasses.primary}, .${listItemTextClasses.secondary} {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        ${
            ownerState.level === 1 &&
            css`
                border-bottom: 1px solid ${theme.palette.grey[50]};
                box-sizing: border-box;
                color: ${theme.palette.grey[900]};
                height: 60px;
                padding: 16px 22px;
                background-color: ${
                    !ownerState.open && ownerState.collapsibleOpen ? `${theme.palette.primary.main} !important` : theme.palette.common.white
                };

                .${listItemIconClasses.root} {
                    color: ${!ownerState.open && ownerState.collapsibleOpen ? `${theme.palette.common.white} !important` : ""};
                }

                :hover {
                    background-color: ${!ownerState.open ? `${theme.palette.primary.main} !important` : ""};
                    color: ${!ownerState.open ? `${theme.palette.common.white}` : ""};

                    .${listItemIconClasses.root} {
                        color: ${!ownerState.open ? `${theme.palette.common.white}` : ""};
                    }
                }

                &.Mui-selected {
                    background-color: ${theme.palette.common.white};
                    color: ${theme.palette.primary.main};

                    :after {
                        background-color: ${theme.palette.primary.main};
                    }

                    .${listItemIconClasses.root} {
                        color: ${theme.palette.primary.main};
                    }

                    :hover {
                        color: ${!ownerState.open ? theme.palette.common.white : theme.palette.primary.main};
                        background-color: ${theme.palette.grey[50]};

                        .${listItemIconClasses.root} {
                            color: ${!ownerState.open ? theme.palette.common.white : theme.palette.primary.main};
                        }
                    }
                }

                .${listItemTextClasses.primary} {
                    font-size: 16px;
                    line-height: 20px;
                    margin-left: 10px;
                    font-weight: 450;
                }

                .${listItemTextClasses.secondary} {
                    margin-left: 10px;
                }
            `
        }

        ${
            ownerState.level === 2 &&
            css`
                color: ${theme.palette.grey[900]};
                padding-left: ${ownerState.open ? 48 : 30}px;
                padding-right: 15px;
                padding-top: 8px;
                padding-bottom: 8px;
                width: ${ownerState.open ? "initial" : 240}px;

                .${listItemTextClasses.primary} {
                    font-size: 14px;
                    line-height: 20px;
                }

                :last-child {
                    border-bottom: 1px solid
                        ${
                            ownerState.open && (!ownerState.hasSubItems || !ownerState.collapsibleOpen)
                                ? theme.palette.grey[50]
                                : theme.palette.common.white
                        };
                    box-sizing: border-box;
                }

                &.Mui-selected {
                    background-color: ${theme.palette.common.white};
                    color: ${theme.palette.primary.main};
                    font-weight: ${theme.typography.fontWeightMedium};

                    :after {
                        background-color: ${ownerState.open ? theme.palette.primary.main : undefined};
                    }

                    :hover {
                        background-color: ${theme.palette.grey[50]};
                    }

                    .${listItemTextClasses.primary} {
                        font-weight: ${theme.typography.fontWeightMedium};
                    }

                    .${listItemIconClasses.root} {
                        color: ${theme.palette.primary.main};
                    }
                }

                .${listItemTextClasses.root} {
                    margin: 0;
                }
            `
        }

        ${
            ownerState.level === 3 &&
            css`
                color: ${theme.palette.grey[900]};
                padding-left: ${ownerState.open ? 50 : 30}px;
                padding-right: 15px;
                padding-top: 0;
                padding-bottom: 0;
                position: relative;
                width: ${ownerState.open ? "initial" : 240}px;

                background-color: ${
                    ownerState.open && ownerState.collapsibleOpen && ownerState.variant === "temporary"
                        ? theme.palette.grey[50]
                        : theme.palette.common.white
                };

                :hover {
                    background-color: ${
                        ownerState.open && ownerState.collapsibleOpen && ownerState.variant === "temporary"
                            ? theme.palette.grey[100]
                            : theme.palette.grey[50]
                    };
                }

                :last-child {
                    border-bottom: ${ownerState.open ? `1px solid ${theme.palette.grey[50]}` : "initial"};
                    box-sizing: border-box;
                }

                &.Mui-selected {
                    background-color: ${
                        ownerState.open && ownerState.collapsibleOpen && ownerState.variant === "temporary"
                            ? theme.palette.grey[50]
                            : theme.palette.common.white
                    };
                    color: ${theme.palette.primary.main};
                    font-weight: ${theme.typography.fontWeightMedium};

                    :hover {
                        background-color: ${
                            ownerState.open && ownerState.collapsibleOpen && ownerState.variant === "temporary"
                                ? theme.palette.grey[100]
                                : theme.palette.grey[50]
                        };
                    }

                    .${listItemTextClasses.primary} {
                        font-weight: ${theme.typography.fontWeightMedium};
                    }

                    .${listItemIconClasses.root} {
                        color: ${theme.palette.primary.main};
                    }
                }

                .${listItemTextClasses.root} {
                    margin: 0;
                }

                .${listItemTextClasses.primary} {
                    font-size: 14px;
                    line-height: 20px;
                    padding-left: ${ownerState.open ? 15 : 0}px;
                    padding-top: 8px;
                    padding-bottom: 8px;
                }

                ${
                    ownerState.open &&
                    css`
                        :not(:last-child) {
                            .${listItemTextClasses.root} {
                                position: relative;

                                &:before {
                                    content: "";
                                    position: absolute;
                                    width: 1px;
                                    height: 100%;
                                    top: 0;
                                    background-color: ${theme.palette.grey[200]};
                                }

                                &:after {
                                    content: "";
                                    position: absolute;
                                    width: 5px;
                                    height: 1px;
                                    top: 50%;
                                    transform: translateY(-50%);
                                    background-color: ${theme.palette.grey[200]};
                                }
                            }

                            &.Mui-selected {
                                .${listItemTextClasses.root} {
                                    :before,
                                    :after {
                                        background-color: ${theme.palette.primary.main};
                                    }
                                }
                            }
                        }

                        :last-child {
                            .${listItemTextClasses.root} {
                                position: relative;
                                padding-right: 10px;

                                &:before {
                                    content: "";
                                    position: absolute;
                                    width: 1px;
                                    height: 50%;
                                    top: 0;
                                    background-color: ${theme.palette.grey[200]};
                                }

                                &:after {
                                    content: "";
                                    position: absolute;
                                    width: 5px;
                                    height: 1px;
                                    top: 50%;
                                    transform: translateY(-50%);
                                    background-color: ${theme.palette.grey[200]};
                                }
                            }

                            &.Mui-selected {
                                .${listItemTextClasses.root} {
                                    :before,
                                    :after {
                                        background-color: ${theme.palette.primary.main};
                                    }
                                }
                            }
                        }
                    `
                }
            `
        }

        ${
            ownerState.hasSecondaryAction &&
            css`
                padding-right: 18px;
            `
        }
    `,
);

export const Icon = createComponentSlot(ListItemIcon)<MainNavigationItemClassKey, OwnerState>({
    componentName: "MainNavigationItem",
    slotName: "icon",
})(
    () => css`
        margin-right: 0;
    `,
);

export const Text = createComponentSlot(ListItemText)<MainNavigationItemClassKey, OwnerState>({
    componentName: "MainNavigationItem",
    slotName: "text",
})();
