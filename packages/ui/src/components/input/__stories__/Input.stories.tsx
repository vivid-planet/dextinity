import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { Input } from "../Input";
import inputTokens from "../Input.tokens.scss?raw";

const adornmentOptions = {
    Euro: "€",
    Unit: "unit",
};

const meta = {
    component: Input,
    title: "Building blocks/Form fields/Input",
    parameters: { tokens: inputTokens },
    decorators: [themeDecorator],
    args: {
        "aria-label": "Title",
        placeholder: "Placeholder",
        onChange: fn(),
    },
    argTypes: {
        status: {
            control: "radio",
            options: ["error", "success", "warning"],
        },
        startAdornment: {
            control: "select",
            options: Object.keys(adornmentOptions),
            mapping: adornmentOptions,
        },
        endAdornment: {
            control: "select",
            options: Object.keys(adornmentOptions),
            mapping: adornmentOptions,
        },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
        render: { control: false },
    },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Error: Story = {
    args: {
        status: "error",
    },
};

export const Success: Story = {
    args: {
        status: "success",
    },
};

export const Warning: Story = {
    args: {
        status: "warning",
    },
};

export const ReadOnly: Story = {
    args: {
        readOnly: true,
        defaultValue: "Read-only value",
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

export const Loading: Story = {
    args: {
        loading: true,
    },
};

export const WithAdornments: Story = {
    args: {
        startAdornment: "€",
        endAdornment: "unit",
    },
};

export const Search: Story = {
    args: {
        type: "search",
        "aria-label": "Search",
        placeholder: "Search",
        startAdornment: <Icon name="search" />,
    },
};
