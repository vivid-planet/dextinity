import {
    type ComponentsOverrides,
    Popper as MuiPopper,
    type Theme,
    // eslint-disable-next-line no-restricted-imports
    Tooltip as MuiTooltip,
    tooltipClasses,
    type TooltipClassKey as MuiTooltipClassKey,
    type TooltipProps as MuiTooltipProps,
    Typography,
} from "@mui/material";
import { css, useTheme, useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

type SlotProps = MuiTooltipProps["slotProps"] &
    ThemedComponentBaseProps<{
        title: typeof Typography;
        text: typeof Typography;
    }>["slotProps"];

export interface TooltipProps extends Omit<MuiTooltipProps, "slotProps" | "title"> {
    color?: Color;
    title?: ReactNode;
    description?: ReactNode;
    customContent?: ReactNode;
    slotProps?: SlotProps;
}

type Slot = "root" | "title" | "text";
type Color = "light" | "dark" | "error" | "success" | "warning";
type ComponentState = "hasTitleOnly";

export type TooltipClassKey = Slot | Color | ComponentState | MuiTooltipClassKey;

type OwnerState = {
    color: Color;
    disableInteractive: boolean | undefined;
    arrow: boolean | undefined;
    isRtl: boolean;
    hasTitleOnly: boolean;
};

const TooltipRoot = createComponentSlot(MuiTooltip)<TooltipClassKey, OwnerState>({
    componentName: "Tooltip",
    slotName: "root",
})();

const TooltipPopper = createComponentSlot(MuiPopper)<TooltipClassKey, OwnerState>({
    componentName: "Tooltip",
    slotName: "popper",
    classesResolver(ownerState) {
        return [
            ownerState.color,
            // Copied the following from MUIs default TooltipPopper: https://github.com/mui/material-ui/blob/a13c0c026692aafc303756998a78f1d6c2dd707d/packages/mui-material/src/Tooltip/Tooltip.js#L48
            !ownerState.disableInteractive && "popperInteractive",
            ownerState.arrow && "popperArrow",
            ownerState.hasTitleOnly && "hasTitleOnly",
        ];
    },
})(({ theme, ownerState }) => {
    const colorPropToTextColor: Record<Color, string> = {
        light: theme.palette.grey[900],
        dark: theme.palette.common.white,
        error: theme.palette.common.white,
        success: theme.palette.common.black,
        warning: theme.palette.common.black,
    };

    const colorPropToBackgroundColor: Record<Color, string> = {
        light: theme.palette.common.white,
        dark: ownerState.hasTitleOnly ? theme.palette.grey[500] : theme.palette.grey[900],
        error: theme.palette.error.light,
        success: theme.palette.success.light,
        warning: theme.palette.warning.light,
    };

    return css`
        ${!ownerState.hasTitleOnly &&
        css`
            min-width: 200px;
        `}

        .${tooltipClasses.tooltip} {
            box-shadow: ${theme.shadows[3]};
            border-radius: 4px;
            padding: 3px 6px;
            color: ${colorPropToTextColor[ownerState.color]};
            background-color: ${colorPropToBackgroundColor[ownerState.color]};
            line-height: 0; // Custom content may include space-caracters, due to code indentation. Removing the line-height prevents these from adding unintended whitespace.

            ${!ownerState.hasTitleOnly &&
            css`
                padding: 10px;
            `}
        }

        .${tooltipClasses.arrow} {
            color: ${colorPropToBackgroundColor[ownerState.color]};
        }

        // Copied the following from MUIs default TooltipPopper: https://github.com/mui/material-ui/blob/a13c0c026692aafc303756998a78f1d6c2dd707d/packages/mui-material/src/Tooltip/Tooltip.js#L55
        z-index: ${theme.zIndex.tooltip};
        pointer-events: none;
        ${!ownerState.disableInteractive &&
        css`
            pointer-events: auto;
        `};
        ${ownerState.arrow &&
        css`
            &[data-popper-placement*="bottom"] .${tooltipClasses.arrow} {
                top: 0;
                margin-top: -0.71em;
                &::before {
                    transform-origin: 0 100%;
                }
            }
            &[data-popper-placement*="top"] .${tooltipClasses.arrow} {
                bottom: 0;
                margin-bottom: -0.71em;
                &::before {
                    transform-origin: 100% 0;
                }
            }
            &[data-popper-placement*="right"] .${tooltipClasses.arrow} {
                ${!ownerState.isRtl
                    ? css`
                          left: 0;
                          margin-left: -0.71em;
                      `
                    : css`
                          right: 0;
                          margin-right: -0.71em;
                      `}
                height: 1em;
                width: 0.71em;
                &::before {
                    transform-origin: 100% 100%;
                }
            }
            &[data-popper-placement*="left"] .${tooltipClasses.arrow} {
                ${!ownerState.isRtl
                    ? css`
                          right: 0;
                          margin-right: -0.71em;
                      `
                    : css`
                          left: 0;
                          margin-left: -0.71em;
                      `}
                height: 1em;
                width: 0.71em;
                &::before {
                    transform-origin: 0 0;
                }
            }
        `};
    `;
});

const Title = createComponentSlot(Typography)<TooltipClassKey>({
    componentName: "Tooltip",
    slotName: "title",
})(css`
    margin-bottom: 2px;
`);

const Text = createComponentSlot(Typography)<TooltipClassKey>({
    componentName: "Tooltip",
    slotName: "text",
})();

export const Tooltip = (inProps: TooltipProps) => {
    const props = useThemeProps({ props: inProps, name: "DextinityAdminTooltip" });
    const { color = "dark", disableInteractive, arrow, children, title, description, customContent, slotProps = {}, ...restProps } = props;
    const theme = useTheme();

    if (customContent && (title || description)) {
        throw new Error("You cannot provide a `title` or `description` when using custom content via the `customContent` prop.");
    }

    if (!("title" in props) && !customContent) {
        throw new Error("You must provide a `title` or `customContent` when using the `Tooltip` component.");
    }

    const ownerState: OwnerState = {
        color,
        disableInteractive,
        arrow,
        isRtl: theme.direction === "rtl",
        hasTitleOnly: !description && !customContent,
    };

    const { title: titleSlotProps, text: textSlotProps, ...muiSlotProps } = slotProps;

    const commonTooltipProps = {
        tabIndex: 0,
        ...restProps,
        title: getMuiTooltipTitle({ title, description, customContent }, { title: titleSlotProps, text: textSlotProps }),
        disableInteractive,
        arrow,
        ownerState,
        slots: {
            popper: TooltipPopper,
            ...restProps.slots,
        },
        slotProps: {
            ...muiSlotProps,
            popper: {
                ownerState,
                ...muiSlotProps?.popper,
            },
        },
    };

    return (
        <TooltipRoot enterTouchDelay={0} {...commonTooltipProps}>
            {children}
        </TooltipRoot>
    );
};

type TooltipContentProps = Pick<TooltipProps, "title" | "description" | "customContent">;
type TooltipContentSlotProps = Pick<NonNullable<SlotProps>, "title" | "text">;

const getMuiTooltipTitle = ({ title, description, customContent }: TooltipContentProps, slotProps: TooltipContentSlotProps) => {
    if (typeof customContent !== "undefined") {
        return customContent;
    }

    if (description) {
        return (
            <>
                <Title variant="subtitle2" {...slotProps.title}>
                    {title}
                </Title>
                <Text variant="body2" {...slotProps.text}>
                    {description}
                </Text>
            </>
        );
    }

    if (!title) {
        return title;
    }

    return (
        <Text variant="body2" {...slotProps.text}>
            {title}
        </Text>
    );
};

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminTooltip: TooltipProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminTooltip: TooltipClassKey;
    }

    interface Components {
        DextinityAdminTooltip?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminTooltip"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminTooltip"];
        };
    }
}
