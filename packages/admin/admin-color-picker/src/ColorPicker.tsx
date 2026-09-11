import { ClearInputAdornment, type InputWithPopperComponents, type InputWithPopperProps } from "@dextinity/admin";
import { Close } from "@dextinity/admin-icons";
import { type ComponentsOverrides, type InputBaseProps, Typography } from "@mui/material";
import { type Theme, useThemeProps } from "@mui/material/styles";
import { type ChangeEvent, type ComponentType, type FocusEvent, type HTMLAttributes, type ReactNode, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import tinycolor from "tinycolor2";
import { useDebouncedCallback } from "use-debounce";

import {
    ColorPalette,
    ColorPaletteItem,
    type ColorPickerClassKey,
    ColorPickerWrapper,
    Footer,
    FooterClearButton,
    Header,
    HeaderCloseButton,
    HeaderTitleText,
    HexColorPicker,
    InputAdornment,
    PopperRoot,
    Preview,
    PreviewIndicator,
    type PreviewIndicatorColorProps,
    type PreviewIndicatorEmptyOrInvalidProps,
    RgbaStringColorPicker,
    Root,
    type SlotProps,
} from "./ColorPicker.slots";

export interface ColorPickerColorPreviewProps extends Omit<HTMLAttributes<HTMLDivElement>, "color">, PreviewIndicatorColorProps {}
export interface ColorPickerNoColorPreviewProps extends HTMLAttributes<HTMLDivElement>, PreviewIndicatorEmptyOrInvalidProps {}

export interface ColorPickerPropsComponents extends InputWithPopperComponents {
    ColorPickerColorPreview?: ComponentType<ColorPickerColorPreviewProps>;
    ColorPickerInvalidPreview?: ComponentType<ColorPickerNoColorPreviewProps>;
    ColorPickerEmptyPreview?: ComponentType<ColorPickerNoColorPreviewProps>;
}

const DefaultColorPreviewIndicator = ({ type, color }: ColorPickerColorPreviewProps) => {
    return <PreviewIndicator ownerState={{ type, color }} />;
};

const DefaultNoColorPreviewIndicator = ({ type }: ColorPickerNoColorPreviewProps) => {
    return <PreviewIndicator ownerState={{ type }} />;
};

export interface ColorPickerProps extends Omit<InputWithPopperProps, "children" | "onChange" | "value" | "components" | "slotProps"> {
    value?: string | null;
    onChange?: (color?: string) => void;
    colorFormat?: "hex" | "rgba";
    colorPalette?: string[];
    hidePicker?: boolean;
    hideHeader?: boolean;
    hideFooter?: boolean;
    fullWidth?: boolean;
    startAdornment?: InputBaseProps["startAdornment"];
    endAdornment?: InputBaseProps["endAdornment"];
    required?: boolean;
    titleText?: ReactNode;
    clearButtonText?: ReactNode;
    components?: ColorPickerPropsComponents;
    slotProps?: SlotProps;
}

export const ColorPicker = (inProps: ColorPickerProps) => {
    const {
        classes,
        value,
        colorFormat = "hex",
        hidePicker,
        hideHeader,
        hideFooter,
        colorPalette,
        onChange,
        startAdornment,
        endAdornment,
        onBlur,
        required,
        titleText = <FormattedMessage id="dextinity.colorPicker.title" defaultMessage="Choose a color" />,
        clearButtonText = <FormattedMessage id="dextinity.colorPicker.clearButton" defaultMessage="clear color" />,
        components = {},
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminColorPicker" });
    const {
        ColorPickerColorPreview: ColorPreview = DefaultColorPreviewIndicator,
        ColorPickerInvalidPreview: InvalidPreview = DefaultNoColorPreviewIndicator,
        ColorPickerEmptyPreview: EmptyPreview = DefaultNoColorPreviewIndicator,
        ...inputWithPopperComponents
    } = components;

    const [displayValue, setDisplayValue] = useState<string>(value ?? "");
    const previewColor = displayValue ? tinycolor(displayValue) : null;

    useEffect(() => {
        setDisplayValue(value ?? "");
    }, [value, setDisplayValue]);

    /**
     * When quickly sliding in the color-picker, multiple `onChange` events would be triggered every second.
     * Debouncing those events ensures the picker is always responsive and prevents it from sometimes crashing.
     */
    const debouncedOnChange = useDebouncedCallback((color) => {
        onChange?.(color);
    }, 250);

    const onChangeColor = (color: string) => {
        const colorValue = tinycolor(color);

        if (colorValue.isValid()) {
            const stringValue = colorFormat === "rgba" ? colorValue.toRgbString() : colorValue.toHexString();
            debouncedOnChange(stringValue);
            setDisplayValue(stringValue);
        } else {
            debouncedOnChange(null);
            setDisplayValue("");
        }
    };

    return (
        <Root
            required={required}
            startAdornment={
                startAdornment ? (
                    startAdornment
                ) : (
                    <InputAdornment position="start" disablePointerEvents {...slotProps?.inputAdornment}>
                        <Preview>
                            {previewColor ? (
                                previewColor.isValid() ? (
                                    <ColorPreview
                                        type="color"
                                        color={previewColor.toRgbString()}
                                        {...slotProps?.previewIndicator}
                                        {...slotProps?.previewIndicatorColor}
                                    />
                                ) : (
                                    <InvalidPreview type="invalid" {...slotProps?.previewIndicator} {...slotProps?.previewIndicatorInvalid}>
                                        ?
                                    </InvalidPreview>
                                )
                            ) : (
                                <EmptyPreview type="empty" {...slotProps?.previewIndicator} {...slotProps?.previewIndicatorEmpty} />
                            )}
                        </Preview>
                    </InputAdornment>
                )
            }
            endAdornment={
                !required && value ? (
                    <>
                        <ClearInputAdornment position="end" onClick={() => onChange?.(undefined)} />
                        {endAdornment}
                    </>
                ) : (
                    endAdornment
                )
            }
            value={displayValue}
            onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                setDisplayValue(e.currentTarget.value);
            }}
            onBlur={(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                onBlur?.(e);
                onChangeColor(displayValue);
            }}
            components={inputWithPopperComponents}
            {...slotProps?.root}
            {...restProps}
        >
            {(closePopper) => {
                return (
                    <PopperRoot {...slotProps?.popperRoot}>
                        {!hideHeader && (
                            <Header {...slotProps?.header}>
                                <HeaderTitleText {...slotProps?.headerTitleText}>{titleText}</HeaderTitleText>
                                <HeaderCloseButton onClick={() => closePopper(true)} {...slotProps?.headerCloseButton}>
                                    <Close />
                                </HeaderCloseButton>
                            </Header>
                        )}

                        {!hidePicker && (
                            <ColorPickerWrapper {...slotProps?.colorPickerWrapper}>
                                {colorFormat === "hex" && (
                                    <HexColorPicker color={value ?? ""} onChange={onChangeColor} {...slotProps?.hexColorPicker} />
                                )}
                                {colorFormat === "rgba" && (
                                    <RgbaStringColorPicker color={value ?? ""} onChange={onChangeColor} {...slotProps?.rgbaStringColorPicker} />
                                )}
                            </ColorPickerWrapper>
                        )}
                        {colorPalette?.length && (
                            <ColorPalette {...slotProps?.colorPalette}>
                                {colorPalette.map((color, index) => (
                                    <ColorPaletteItem
                                        key={`${index}_${color}`}
                                        onClick={() => {
                                            onChangeColor(color);
                                            closePopper(true);
                                        }}
                                        ownerState={{ colorValue: color }}
                                        {...slotProps?.colorPaletteItem}
                                    />
                                ))}
                            </ColorPalette>
                        )}
                        {!hideFooter && (
                            <Footer {...slotProps?.footer}>
                                <FooterClearButton
                                    {...slotProps?.footerClearButton}
                                    onClick={() => {
                                        onChangeColor("");
                                        closePopper(true);
                                    }}
                                >
                                    <Preview {...slotProps?.preview}>
                                        <EmptyPreview type="empty" {...slotProps?.previewIndicator} {...slotProps?.previewIndicatorEmpty} />
                                    </Preview>
                                    <Typography>{clearButtonText}</Typography>
                                </FooterClearButton>
                            </Footer>
                        )}
                    </PopperRoot>
                );
            }}
        </Root>
    );
};

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminColorPicker: ColorPickerClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminColorPicker: ColorPickerProps;
    }

    interface Components {
        DextinityAdminColorPicker?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminColorPicker"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminColorPicker"];
        };
    }
}
