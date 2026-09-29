import { FieldContainer } from "@dextinity/admin";
import { ColorPicker } from "@dextinity/admin-color-picker";
import { ArrowRight } from "@dextinity/admin-icons";
import { InputAdornment } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { componentDocsDecorator } from "./utils/componentDocsDecorator";
import { DocsPage } from "./utils/DocsPage";

type Story = StoryObj<typeof ColorPicker>;

export const argTypes = {
    value: {
        control: "text",
    },
    onChange: {
        control: false,
    },
    colorFormat: {
        control: "select",
        options: ["hex", "rgba"],
    },
    colorPalette: {
        control: "text",
    },
    hidePicker: {
        control: "boolean",
    },
    hideHeader: {
        control: "boolean",
    },
    hideFooter: {
        control: "boolean",
    },
    fullWidth: {
        control: "boolean",
    },
    startAdornment: {
        control: "select",
        options: [undefined, "ArrowRight"],
    },
    endAdornment: {
        control: "select",
        options: [undefined, "ArrowRight"],
    },
    invalidIndicatorCharacter: {
        control: "text",
    },
    required: {
        control: "boolean",
    },
    titleText: {
        control: "text",
    },
    clearButtonText: {
        control: "text",
    },
    components: {
        control: false,
    },
    slotProps: {
        control: false,
    },
} as const;

const meta: Meta<typeof ColorPicker> = {
    component: ColorPicker,
    title: "Component Docs/ColorPicker",
    tags: ["adminComponentDocs"],
    decorators: [componentDocsDecorator()],
    parameters: {
        docs: {
            page: () => <DocsPage defaultStory={Default} />,
        },
    },
    argTypes: argTypes,
    excludeStories: ["argTypes"],
};

export default meta;

/**
 * The `ColorPicker` component is used to select colors in a form, e.g., a HEX code or an RGBA string.
 *
 * For usage inside Final Form, use the `ColorField` component.
 */
export const Default: Story = {
    render: ({ startAdornment, endAdornment, ...props }) => {
        return (
            <ColorPicker
                {...props}
                startAdornment={
                    startAdornment === "ArrowRight" ? (
                        <InputAdornment position="start">
                            <ArrowRight />
                        </InputAdornment>
                    ) : undefined
                }
                endAdornment={
                    endAdornment === "ArrowRight" ? (
                        <InputAdornment position="end">
                            <ArrowRight />
                        </InputAdornment>
                    ) : undefined
                }
            />
        );
    },
};

/**
 * Generally, `ColorPicker` should be used inside of `FieldContainer` to provide a label and other form specific functionality.
 */
export const UsageInsideFieldContainer: Story = {
    render: (props) => {
        return (
            <FieldContainer label="Color">
                <ColorPicker {...props} />
            </FieldContainer>
        );
    },
};

/**
 * Set the `colorFormat` prop to `rgba` to select a color with an opacity value.
 */
export const ValueWithOpacity: Story = {
    render: (props) => {
        return <ColorPicker {...props} colorFormat="rgba" />;
    },
};
