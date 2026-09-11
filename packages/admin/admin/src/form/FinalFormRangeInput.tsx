import { FormControl, InputBase, Slider, type SliderProps } from "@mui/material";
import { type ComponentsOverrides, css, type Theme, useThemeProps } from "@mui/material/styles";
import { type ReactNode, useEffect, useState } from "react";
import type { FieldRenderProps } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

export type FinalFormRangeInputClassKey =
    | "root"
    | "disableSlider"
    | "inputsWrapper"
    | "inputFieldsSeparatorContainer"
    | "sliderWrapper"
    | "inputFieldContainer";

type OwnerState = {
    disableSlider: boolean;
};

const Root = createComponentSlot("div")<FinalFormRangeInputClassKey, OwnerState>({
    componentName: "FinalFormRangeInput",
    slotName: "root",
    classesResolver: ({ disableSlider }) => [disableSlider && "disableSlider"],
})();

const InputsWrapper = createComponentSlot("div")<FinalFormRangeInputClassKey, OwnerState>({
    componentName: "FinalFormRangeInput",
    slotName: "inputsWrapper",
})(
    ({ theme, ownerState }) => css`
        justify-content: space-between;
        align-items: center;
        display: flex;

        ${!ownerState.disableSlider &&
        css`
            margin-bottom: ${theme.spacing(3)};
        `}
    `,
);

const InputFieldsSeparatorContainer = createComponentSlot("div")<FinalFormRangeInputClassKey>({
    componentName: "FinalFormRangeInput",
    slotName: "inputFieldsSeparatorContainer",
})(
    ({ theme }) => css`
        text-align: center;
        padding-left: ${theme.spacing(2)};
        padding-right: ${theme.spacing(2)};
    `,
);

const SliderWrapper = createComponentSlot("div")<FinalFormRangeInputClassKey>({
    componentName: "FinalFormRangeInput",
    slotName: "sliderWrapper",
})(
    ({ theme }) => css`
        padding-left: ${theme.spacing(2)};
        padding-right: ${theme.spacing(2)};
    `,
);

const InputFieldContainer = createComponentSlot("div")<FinalFormRangeInputClassKey>({
    componentName: "FinalFormRangeInput",
    slotName: "inputFieldContainer",
})(css`
    text-align: center;
    flex-basis: 0;
    flex-grow: 1;
`);

export interface FinalFormRangeInputProps
    extends FieldRenderProps<{ min: number; max: number }, HTMLInputElement>,
        ThemedComponentBaseProps<{
            root: "div";
            inputsWrapper: "div";
            inputFieldsSeparatorContainer: "div";
            sliderWrapper: "div";
            inputFieldContainer: "div";
        }> {
    min: number;
    max: number;
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
    separator?: ReactNode;
    disableSlider?: boolean;
    sliderProps?: Omit<SliderProps, "min" | "max">;
    disabled?: boolean;
}

export function FinalFormRangeInput(inProps: FinalFormRangeInputProps) {
    const {
        min,
        max,
        startAdornment,
        endAdornment,
        separator = <FormattedMessage id="dextinity.rangeInput.separator" defaultMessage="to" />,
        disableSlider,
        sliderProps,
        input: { name, onChange, value: fieldValue },
        slotProps,
        disabled,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminFinalFormRangeInput" });

    const [internalMinInput, setInternalMinInput] = useState(fieldValue.min || undefined);
    const [internalMaxInput, setInternalMaxInput] = useState(fieldValue.max || undefined);

    const handleSliderChange = (event: Event, newValue: number[]) => {
        onChange({ min: newValue[0], max: newValue[1] });
    };

    const ownerState: OwnerState = { disableSlider: Boolean(disableSlider) };

    useEffect(() => {
        setInternalMinInput(fieldValue.min);
        setInternalMaxInput(fieldValue.max);
    }, [fieldValue]);

    const updateMinMaxValues = () => {
        const internalMinValue = typeof internalMinInput === "undefined" ? min : internalMinInput;
        const internalMaxValue = typeof internalMaxInput === "undefined" ? max : internalMaxInput;

        const minValue = Math.min(internalMinValue, internalMaxValue);
        const maxValue = Math.max(internalMinValue, internalMaxValue);

        onChange({
            min: Math.max(minValue, min),
            max: Math.min(maxValue, max),
        });
    };

    return (
        <Root ownerState={ownerState} {...slotProps?.root} {...restProps}>
            <InputsWrapper ownerState={ownerState} {...slotProps?.inputsWrapper}>
                <InputFieldContainer {...slotProps?.inputFieldContainer}>
                    <FormControl fullWidth>
                        <InputBase
                            name={`${name}.min`}
                            inputProps={{
                                value: internalMinInput !== undefined ? internalMinInput : "",
                                type: "number",
                                placeholder: min.toString(),
                            }}
                            disabled={disabled}
                            startAdornment={startAdornment}
                            endAdornment={endAdornment}
                            onBlur={() => {
                                if (internalMinInput !== undefined) {
                                    updateMinMaxValues();
                                } else {
                                    onChange(undefined);
                                }
                            }}
                            onChange={(e) => {
                                if (e.target.value === "") {
                                    setInternalMinInput(undefined);
                                } else {
                                    setInternalMinInput(Number(e.target.value));
                                }
                            }}
                        />
                    </FormControl>
                </InputFieldContainer>
                <InputFieldsSeparatorContainer {...slotProps?.inputFieldsSeparatorContainer}>{separator}</InputFieldsSeparatorContainer>
                <InputFieldContainer {...slotProps?.inputFieldContainer}>
                    <FormControl fullWidth>
                        <InputBase
                            name={`${name}.max`}
                            inputProps={{
                                value: internalMaxInput !== undefined ? internalMaxInput : "",
                                type: "number",
                                placeholder: max.toString(),
                            }}
                            disabled={disabled}
                            startAdornment={startAdornment ? startAdornment : ""}
                            endAdornment={endAdornment ? endAdornment : ""}
                            onBlur={() => {
                                if (internalMaxInput !== undefined) {
                                    updateMinMaxValues();
                                } else {
                                    onChange(undefined);
                                }
                            }}
                            onChange={(e) => {
                                if (e.target.value === "") {
                                    setInternalMaxInput(undefined);
                                } else {
                                    setInternalMaxInput(Number(e.target.value));
                                }
                            }}
                        />
                    </FormControl>
                </InputFieldContainer>
            </InputsWrapper>
            {!disableSlider && (
                <SliderWrapper {...slotProps?.sliderWrapper}>
                    <Slider
                        min={min}
                        max={max}
                        value={[fieldValue.min ? fieldValue.min : min, fieldValue.max ? fieldValue.max : max]}
                        onChange={handleSliderChange}
                        {...sliderProps}
                        disabled={disabled || sliderProps?.disabled}
                    />
                </SliderWrapper>
            )}
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminFinalFormRangeInput: FinalFormRangeInputClassKey;
    }

    interface Components {
        DextinityAdminFinalFormRangeInput?: {
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminFinalFormRangeInput"];
        };
    }
}
