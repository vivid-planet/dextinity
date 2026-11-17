import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Field } from "../../field/Field";
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
        "aria-label": { description: "Names the input when no `Field` label does." },
        placeholder: { description: "An example of the expected value, shown while the input is empty." },
        onChange: { description: "Called with the change event on every edit; set `value` from `event.target.value`." },
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
        render: {
            control: false,
            description: "Replaces the rendered `<input>` element, e.g. with a masked input, which receives the input's props.",
        },
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

function TitleField() {
    const [title, setTitle] = useState("");
    return (
        <Field label="Title" required helperText="Use gender-neutral wording." counter={`${title.length} / 60`}>
            <Input name="title" value={title} maxLength={60} onChange={(event) => setTitle(event.target.value)} />
        </Field>
    );
}

/**
 * In a `Field`, the input takes the field's label, help, and state, and the field draws the box: together they make a complete text
 * field. Set the label, help, validation, prefix, and suffix on the `Field`.
 */
export const InField: Story = {
    render: () => <TitleField />,
    play: async ({ canvas }) => {
        const input = canvas.getByRole("textbox", { name: "Title" });
        await expect(input).toBeRequired();
        await expect(input).toHaveAccessibleDescription("Use gender-neutral wording.");
        await userEvent.type(input, "Careers");
        await expect(canvas.getByText("7 / 60")).toBeVisible();
    },
};
