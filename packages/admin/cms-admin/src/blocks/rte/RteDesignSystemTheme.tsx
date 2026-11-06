import { useThemePortalContainer } from "@dextinity/ui";
import { type Theme, ThemeProvider } from "@mui/material/styles";
import { type PropsWithChildren, useCallback } from "react";

/**
 * Styles the Draft.js editor of `@dextinity/admin-rte` like the fields of `@dextinity/ui`, in every color scheme of the surrounding `Theme`.
 * The editor still renders with MUI, so it is restyled through the MUI theme with the design tokens, and its menus are portaled into the
 * `Theme` so the tokens reach them.
 */
export function RteDesignSystemTheme({ children }: PropsWithChildren) {
    const { anchorRef, container } = useThemePortalContainer<HTMLDivElement>();

    const createTheme = useCallback(
        (outerTheme: Theme): Theme => ({
            ...outerTheme,
            components: {
                ...outerTheme.components,
                DextinityAdminRte: {
                    defaultProps: {
                        colors: {
                            border: "var(--dextinity-field-line)",
                            outerBorderOnHover: "var(--dextinity-field-line-hover)",
                            outerBorderOnFocus: "var(--dextinity-field-line-focus)",
                            toolbarBackground: "var(--dextinity-field-background)",
                            buttonIcon: "var(--dextinity-icon-button-foreground)",
                            buttonIconDisabled: "var(--dextinity-color-text-subtle)",
                            buttonBackgroundHover: "var(--dextinity-icon-button-background-hover)",
                            buttonBorderHover: "transparent",
                            buttonBorderDisabled: "transparent",
                        },
                    },
                    styleOverrides: {
                        root: {
                            overflow: "clip",
                            backgroundColor: "var(--dextinity-field-background)",
                            color: "var(--dextinity-field-foreground)",
                            borderRadius: "var(--dextinity-field-radius-stacked)",
                            fontFamily: "var(--dextinity-font-family-text)",
                            fontSize: "var(--dextinity-field-font-size)",
                            transition: "border-color var(--dextinity-motion-duration-short) var(--dextinity-motion-easing)",
                            "&:focus-within": {
                                boxShadow: "0 0 0 3px var(--dextinity-field-halo-focus)",
                            },
                            "& a": {
                                color: "var(--dextinity-rich-text-editor-link-color)",
                            },
                        },
                        editor: {
                            "& .public-DraftEditor-content": {
                                padding: "var(--dextinity-rich-text-editor-content-padding)",
                                lineHeight: "var(--dextinity-rich-text-editor-line-height)",
                            },
                        },
                        disabled: {
                            opacity: "var(--dextinity-field-disabled-opacity)",
                        },
                    },
                },
                DextinityAdminRteToolbar: {
                    styleOverrides: {
                        root: {
                            paddingLeft: 4,
                            paddingRight: 4,
                        },
                        slot: {
                            height: 36,
                            paddingTop: 4,
                            paddingBottom: 4,
                            paddingRight: 3,
                            marginRight: 3,
                            display: "flex",
                            alignItems: "center",
                            "&::after": {
                                top: 10,
                                bottom: 10,
                            },
                        },
                    },
                },
                DextinityAdminRteControlButton: {
                    styleOverrides: {
                        root: {
                            height: 26,
                            minWidth: 24,
                            borderRadius: "var(--dextinity-radius-control)",
                            "&:hover:not(:disabled)": {
                                color: "var(--dextinity-icon-button-foreground-hover)",
                            },
                            "& svg": {
                                fontSize: 16,
                            },
                        },
                        renderAsIcon: {
                            width: 24,
                        },
                        selected: {
                            "&:not(:disabled), &:not(:disabled):hover": {
                                borderColor: "transparent",
                                backgroundColor: "var(--dextinity-toolbar-button-background-pressed)",
                                color: "var(--dextinity-toolbar-button-foreground-pressed)",
                            },
                        },
                    },
                },
                DextinityAdminRteBlockTypeControls: {
                    styleOverrides: {
                        select: {
                            "& .MuiSelect-select.MuiInputBase-input": {
                                color: "var(--dextinity-toolbar-menu-foreground)",
                                fontSize: "var(--dextinity-toolbar-menu-font-size)",
                                paddingLeft: "var(--dextinity-toolbar-menu-padding)",
                            },
                        },
                    },
                },
                DextinityAdminRteBlockElement: {
                    styleOverrides: {
                        root: {
                            color: "inherit",
                        },
                        blockquote: {
                            backgroundColor: "var(--dextinity-color-surface-sunken)",
                        },
                    },
                },
                MuiPopover: {
                    defaultProps: {
                        container,
                    },
                },
                MuiMenu: {
                    styleOverrides: {
                        paper: {
                            backgroundColor: "var(--dextinity-menu-background)",
                            backgroundImage: "none",
                            backdropFilter: "blur(var(--dextinity-menu-blur))",
                            borderRadius: "var(--dextinity-menu-radius)",
                            boxShadow: "var(--dextinity-menu-shadow)",
                            color: "var(--dextinity-menu-item-foreground)",
                            minWidth: "var(--dextinity-menu-min-width)",
                        },
                        list: {
                            padding: "var(--dextinity-menu-padding)",
                        },
                    },
                },
                MuiMenuItem: {
                    styleOverrides: {
                        root: {
                            minHeight: "var(--dextinity-menu-item-height)",
                            gap: "var(--dextinity-menu-item-gap)",
                            paddingLeft: "var(--dextinity-menu-item-padding)",
                            paddingRight: "var(--dextinity-menu-item-padding)",
                            borderRadius: "var(--dextinity-menu-item-radius)",
                            fontFamily: "var(--dextinity-font-family-text)",
                            fontSize: "var(--dextinity-menu-item-font-size)",
                            fontWeight: "normal",
                            color: "inherit",
                            "&:hover, &.Mui-focusVisible": {
                                backgroundColor: "var(--dextinity-menu-item-background-highlight)",
                            },
                            "&.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible": {
                                backgroundColor: "var(--dextinity-toolbar-button-background-pressed)",
                                color: "var(--dextinity-toolbar-button-foreground-pressed)",
                            },
                        },
                    },
                },
                MuiListItemIcon: {
                    styleOverrides: {
                        root: {
                            minWidth: 0,
                            color: "var(--dextinity-menu-item-icon-color)",
                        },
                    },
                },
            },
        }),
        [container],
    );

    return (
        <div ref={anchorRef}>
            <ThemeProvider theme={createTheme}>{children}</ThemeProvider>
        </div>
    );
}
