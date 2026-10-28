import { createComponentSlot, InputWithPopper, type ThemedComponentBaseProps } from "@dextinity/admin";
import { Box, ButtonBase, IconButton, InputAdornment as MuiInputAdornment, Typography } from "@mui/material";
import { css, type Theme } from "@mui/material/styles";
import type { ComponentProps, ComponentType } from "react";
import { HexColorPicker as HexColorPickerBase, RgbaStringColorPicker as RgbaStringColorPickerBase } from "react-colorful";

export type ColorPickerClassKey =
    | "root"
    | "inputAdornment"
    | "popperRoot"
    | "popperSection"
    | "header"
    | "headerTitleText"
    | "headerCloseButton"
    | "colorPickerWrapper"
    | "colorPalette"
    | "colorPaletteItem"
    | "footer"
    | "footerClearButton"
    | "preview"
    | "previewIndicator"
    | "previewIndicatorColor"
    | "previewIndicatorEmpty"
    | "previewIndicatorInvalid"
    | "hexColorPicker"
    | "rgbaStringColorPicker";

export type SlotProps = ThemedComponentBaseProps<{
    root: typeof InputWithPopper;
    inputAdornment: typeof InputAdornment;
    popperRoot: "div";
    header: "div";
    headerTitleText: typeof Typography;
    headerCloseButton: typeof IconButton;
    colorPickerWrapper: "div";
    colorPalette: "div";
    colorPaletteItem: typeof Box;
    footer: "div";
    footerClearButton: typeof ButtonBase;
    preview: "div";
    previewIndicator: "div";
    previewIndicatorColor: "div";
    previewIndicatorEmpty: "div";
    previewIndicatorInvalid: "div";
    hexColorPicker: typeof HexColorPickerBase;
    rgbaStringColorPicker: typeof RgbaStringColorPickerBase;
}>["slotProps"];

const getPopperSectionStyles = (theme: Theme) => css`
    padding: ${theme.spacing(3)};

    &:not(:last-child) {
        border-bottom: thin solid ${theme.palette.grey[100]};
    }
`;

export const Root = createComponentSlot(InputWithPopper)<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "root",
})();

export const InputAdornment = createComponentSlot(MuiInputAdornment)<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "inputAdornment",
})();

export const PopperRoot = createComponentSlot("div")<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "popperRoot",
})(css`
    width: 300px;
`);

export const Header = createComponentSlot("div")<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "header",
})(
    ({ theme }) => css`
        ${getPopperSectionStyles(theme)}
        position: relative;
        padding-right: 40px;
    `,
);

export const HeaderTitleText = createComponentSlot(Typography)<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "headerTitleText",
})(
    ({ theme }) => css`
        font-weight: ${theme.typography.fontWeightBold};
    `,
);

export const HeaderCloseButton = createComponentSlot(IconButton)<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "headerCloseButton",
})(
    ({ theme }) => css`
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: ${theme.spacing(2)};
    `,
);

export const ColorPickerWrapper = createComponentSlot("div")<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "colorPickerWrapper",
    classesResolver() {
        return ["popperSection"];
    },
})(
    ({ theme }) => css`
        ${getPopperSectionStyles(theme)}

        .react-colorful {
            width: 100%;
            height: auto;

            &__pointer {
                width: 30px;
                height: 30px;
            }

            &__saturation,
            &__hue,
            &__alpha {
                border-radius: 0;

                &:not(:last-child) {
                    margin-bottom: ${theme.spacing(3)};
                }
            }

            &__saturation {
                border-bottom: none;
                height: 270px;
            }

            &__hue,
            &__alpha {
                height: 20px;
            }

            &__alpha-gradient {
                box-shadow: none;
            }
        }
    `,
);

export const ColorPalette = createComponentSlot("div")<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "colorPalette",
    classesResolver() {
        return ["popperSection"];
    },
})(
    ({ theme }) => css`
        ${getPopperSectionStyles(theme)}
        display: flex;
        flex-wrap: wrap;
        gap: ${theme.spacing(1)};
    `,
);

type ColorPaletteItemProps = {
    colorValue: string;
};

export const ColorPaletteItem = createComponentSlot(Box)<ColorPickerClassKey, ColorPaletteItemProps>({
    componentName: "ColorPicker",
    slotName: "colorPaletteItem",
})(
    ({ theme, ownerState }) => css`
        cursor: pointer;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        border: thin solid ${theme.palette.grey[100]};
        border-radius: ${theme.shape.borderRadius};
        box-sizing: border-box;
        background-color: ${ownerState.colorValue};
    `,
);

export const Footer = createComponentSlot("div")<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "footer",
    classesResolver() {
        return ["popperSection"];
    },
})(
    ({ theme }) => css`
        ${getPopperSectionStyles(theme)}
        padding: ${theme.spacing(1)};
    `,
);

export const FooterClearButton = createComponentSlot(ButtonBase)<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "footerClearButton",
})(
    ({ theme }) => css`
        padding: ${theme.spacing(2)};
        border-radius: ${theme.shape.borderRadius};
        gap: 8px;
    `,
);

export const Preview = createComponentSlot("div")<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "preview",
})(css`
    position: relative;
    overflow: hidden;
    width: 24px;
    height: 24px;
`);

type PreviewIndicatorProps = PreviewIndicatorEmptyOrInvalidProps | PreviewIndicatorColorProps;

export type PreviewIndicatorEmptyOrInvalidProps = {
    type: "empty" | "invalid";
};

export type PreviewIndicatorColorProps = {
    type: "color";
    color: string;
};

export const PreviewIndicator = createComponentSlot("div")<ColorPickerClassKey, PreviewIndicatorProps>({
    componentName: "ColorPicker",
    slotName: "previewIndicator",
    classesResolver({ type }) {
        return [
            type === "color" && "previewIndicatorColor",
            type === "empty" && "previewIndicatorEmpty",
            type === "invalid" && "previewIndicatorInvalid",
        ];
    },
})(
    ({ theme, ownerState }) => css`
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        border: thin solid ${theme.palette.divider};
        border-radius: ${theme.shape.borderRadius};

        ${
            ownerState.type === "color" &&
            css`
                background-color: ${ownerState.color};
            `
        }

        ${
            ownerState.type === "empty" &&
            css`
                display: flex;
                align-items: center;
                justify-content: center;

                &:before {
                    content: "";
                    display: block;
                    background-color: #f62929;
                    width: 1px;
                    height: calc(100% - 4px);
                    transform: rotate(45deg);
                }
            `
        }

        ${
            ownerState.type === "invalid" &&
            css`
                font-size: 16px;
                line-height: 24px;
                font-weight: ${theme.typography.fontWeightBold};
                color: ${theme.palette.text.secondary};
                text-align: center;
            `
        }
    `,
);

export const HexColorPicker: ComponentType<ComponentProps<typeof HexColorPickerBase>> = createComponentSlot(HexColorPickerBase)<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "hexColorPicker",
})();

export const RgbaStringColorPicker: ComponentType<ComponentProps<typeof RgbaStringColorPickerBase>> = createComponentSlot(
    RgbaStringColorPickerBase,
)<ColorPickerClassKey>({
    componentName: "ColorPicker",
    slotName: "rgbaStringColorPicker",
})();
