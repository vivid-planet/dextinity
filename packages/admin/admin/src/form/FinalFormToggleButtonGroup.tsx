import { ButtonBase, Typography } from "@mui/material";
import { type ComponentsOverrides, css, type Theme, useThemeProps } from "@mui/material/styles";
import type { ReactNode } from "react";
import type { FieldRenderProps } from "react-final-form";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

export type FinalFormToggleButtonGroupClassKey = "root" | "button" | "label" | "selected" | "disabled";

export interface FinalFormToggleButtonGroupProps<FieldValue> extends ThemedComponentBaseProps<{
    root: "div";
    button: typeof ButtonBase;
    label: typeof Typography;
}> {
    options: Array<{ value: FieldValue; label: ReactNode; disabled?: boolean }>;
    optionsPerRow?: number;
    disabled?: boolean;
}

type FinalFormToggleButtonGroupInternalProps<FieldValue> = FieldRenderProps<FieldValue, HTMLDivElement>;

type RootOwnerState = {
    optionsPerRow?: number;
};

type ButtonOwnerState = {
    selected: boolean;
    disabled: boolean;
};

/**
 * Final Form-compatible ToggleButtonGroup component.
 *
 * @see {@link ToggleButtonGroupField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export function FinalFormToggleButtonGroup<FieldValue = unknown>(
    inProps: FinalFormToggleButtonGroupProps<FieldValue> & FinalFormToggleButtonGroupInternalProps<FieldValue>,
) {
    const {
        input: { value, onChange },
        meta,
        options,
        optionsPerRow,
        disabled,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminFinalFormToggleButtonGroup" });

    return (
        <Root ownerState={{ optionsPerRow }} {...slotProps?.root} {...restProps}>
            {options.map(({ value: optionValue, label, disabled: optionDisabled }, index) => {
                const buttonDisabled = Boolean(disabled) || Boolean(optionDisabled);

                return (
                    <Button
                        key={index}
                        ownerState={{ selected: value === optionValue, disabled: buttonDisabled }}
                        focusRipple
                        {...slotProps?.button}
                        onClick={() => onChange(optionValue)}
                        disabled={buttonDisabled}
                    >
                        <Label variant="body2" {...slotProps?.label} variantMapping={{ body2: "span", ...slotProps?.label?.variantMapping }}>
                            {label}
                        </Label>
                    </Button>
                );
            })}
        </Root>
    );
}

const Root = createComponentSlot("div")<FinalFormToggleButtonGroupClassKey, RootOwnerState>({
    componentName: "FinalFormToggleButtonGroup",
    slotName: "root",
})(
    ({ theme, ownerState }) => css`
        display: inline-flex;
        min-height: 40px;
        border: 1px solid ${theme.palette.divider};
        background-color: ${theme.palette.divider};
        border-radius: 2px;
        overflow: hidden;
        gap: 1px;

        ${
            ownerState.optionsPerRow &&
            css`
                display: inline-grid;
                grid-template-columns: repeat(${ownerState.optionsPerRow}, 1fr);
            `
        }
    `,
);

const Button = createComponentSlot(ButtonBase)<FinalFormToggleButtonGroupClassKey, ButtonOwnerState>({
    componentName: "FinalFormToggleButtonGroup",
    slotName: "button",
    classesResolver: ({ selected, disabled }) => [selected && "selected", disabled && "disabled"],
})(
    ({ theme, ownerState }) => css`
        padding-left: ${theme.spacing(3)};
        padding-right: ${theme.spacing(3)};
        padding-top: 9px;
        padding-bottom: 9px;
        background-color: ${theme.palette.background.paper};

        :hover {
            background-color: ${theme.palette.grey[50]};
        }

        ${
            ownerState.selected &&
            css`
                color: ${theme.palette.primary.main};

                :before {
                    content: "";
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    height: 2px;
                    background-color: ${theme.palette.primary.main};
                }
            `
        }

        ${
            ownerState.disabled &&
            css`
                color: ${theme.palette.action.disabled};
                background-color: ${theme.palette.grey[50]};

                :before {
                    background-color: ${theme.palette.action.disabled};
                }
            `
        }
    `,
);

const Label = createComponentSlot(Typography)<FinalFormToggleButtonGroupClassKey>({
    componentName: "FinalFormToggleButtonGroup",
    slotName: "label",
})(css`
    display: flex;
    align-items: center;
`);

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminFinalFormToggleButtonGroup: FinalFormToggleButtonGroupProps<unknown>;
    }

    interface ComponentNameToClassKey {
        DextinityAdminFinalFormToggleButtonGroup: FinalFormToggleButtonGroupClassKey;
    }

    interface Components {
        DextinityAdminFinalFormToggleButtonGroup?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminFinalFormToggleButtonGroup"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminFinalFormToggleButtonGroup"];
        };
    }
}
