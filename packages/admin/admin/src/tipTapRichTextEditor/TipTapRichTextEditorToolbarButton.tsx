import { type ComponentsOverrides, css, type Theme, useThemeProps } from "@mui/material";
import { grey as muiGreyPalette } from "@mui/material/colors";
import type { MouseEvent, ReactNode } from "react";

import { Tooltip } from "../common/Tooltip";
import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

export type TipTapRichTextEditorToolbarButtonClassKey = "root" | "selected" | "disabled";

export interface TipTapRichTextEditorToolbarButtonProps extends ThemedComponentBaseProps<{
    root: "button";
}> {
    icon: ReactNode;
    tooltip: ReactNode;
    /**
     * Defaults to `tooltip` if it is a string.
     */
    ariaLabel?: string;
    selected?: boolean;
    disabled?: boolean;
    /**
     * Called on mouse down instead of on click, so the editor keeps its selection, and on a click from
     * the keyboard.
     */
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

type OwnerState = Pick<TipTapRichTextEditorToolbarButtonProps, "selected" | "disabled">;

export function TipTapRichTextEditorToolbarButton(inProps: TipTapRichTextEditorToolbarButtonProps) {
    const { icon, tooltip, ariaLabel, selected, disabled, onClick, slotProps, ...restProps } = useThemeProps({
        props: inProps,
        name: "DextinityAdminTipTapRichTextEditorToolbarButton",
    });
    const ownerState: OwnerState = { selected, disabled };

    return (
        <Tooltip title={tooltip}>
            <Root
                type="button"
                aria-label={ariaLabel ?? (typeof tooltip === "string" ? tooltip : undefined)}
                aria-pressed={selected}
                disabled={disabled}
                ownerState={ownerState}
                onMouseDown={(event: MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    onClick(event);
                }}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    // A click from the keyboard has no detail, unlike one from a pointer, which mouse down already handled.
                    if (event.detail === 0) {
                        onClick(event);
                    }
                }}
                {...slotProps?.root}
                {...restProps}
            >
                {icon}
            </Root>
        </Tooltip>
    );
}

const Root = createComponentSlot("button")<TipTapRichTextEditorToolbarButtonClassKey, OwnerState>({
    componentName: "TipTapRichTextEditorToolbarButton",
    slotName: "root",
    classesResolver(ownerState) {
        return [ownerState.selected && "selected", ownerState.disabled && "disabled"];
    },
})(
    ({ ownerState }) => css`
        display: flex;
        justify-content: center;
        align-items: center;
        height: 24px;
        width: 24px;
        padding: 0;
        font-size: 15px;
        background-color: transparent;
        border: 1px solid transparent;
        box-sizing: border-box;
        transition:
            background-color 200ms,
            border-color 200ms,
            color 200ms;
        color: ${muiGreyPalette[600]};

        .MuiSvgIcon-root {
            font-size: inherit;
            color: inherit;
        }

        &:hover {
            background-color: ${muiGreyPalette[200]};
            border-color: ${muiGreyPalette[400]};
        }

        &:disabled {
            color: ${muiGreyPalette[300]};

            &,
            &:hover {
                background-color: transparent;
                border-color: transparent;
            }
        }

        ${
            ownerState.selected &&
            css`
                &:not(:disabled),
                &:not(:disabled):hover {
                    border-color: ${muiGreyPalette[400]};
                    background-color: white;
                }
            `
        }
    `,
);

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminTipTapRichTextEditorToolbarButton: TipTapRichTextEditorToolbarButtonProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminTipTapRichTextEditorToolbarButton: TipTapRichTextEditorToolbarButtonClassKey;
    }

    interface Components {
        DextinityAdminTipTapRichTextEditorToolbarButton?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminTipTapRichTextEditorToolbarButton"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminTipTapRichTextEditorToolbarButton"];
        };
    }
}
