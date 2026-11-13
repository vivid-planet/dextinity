import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { fieldArgTypes, type FieldStoryArgs, hasFieldArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
import { landscapeImage } from "../../../storybook/sampleImages";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { FocalPointPicker, type FocalPointPickerProps } from "../FocalPointPicker";
import focalPointPickerTokens from "../FocalPointPicker.tokens.scss?raw";
import styles from "./FocalPointPicker.stories.module.scss";

type FocalPointPickerStoryArgs = FocalPointPickerProps & Pick<FieldStoryArgs, "label" | "helperText" | "validationMessage" | "state">;

/**
 * Keeps the story controlled: moving the point updates the local value and clears `auto`. With a field arg, it puts the picker in a
 * `Field` with `layout="group"`.
 */
function ControlledFocalPointPicker(args: FocalPointPickerStoryArgs) {
    const { field, control } = splitFieldArgs(args);
    const [value, setValue] = useState(control.value);
    const [auto, setAuto] = useState(control.auto);
    const picker = (
        <FocalPointPicker
            {...control}
            value={value}
            auto={auto}
            onChange={(next) => {
                control.onChange(next);
                setValue(next);
                setAuto(false);
            }}
        />
    );
    return (
        <div className={styles.container}>
            {hasFieldArgs(field) ? (
                <StoryField field={field} layout="group">
                    {picker}
                </StoryField>
            ) : (
                picker
            )}
        </div>
    );
}

const meta = {
    component: FocalPointPicker,
    title: "Building blocks/Media & upload/FocalPointPicker",
    decorators: [themeDecorator],
    parameters: { tokens: focalPointPickerTokens },
    args: {
        src: landscapeImage,
        value: { x: 0.56, y: 0.34 },
        onChange: fn(),
    },
    argTypes: {
        auto: { control: "boolean" },
        disabled: { control: "boolean" },
        label: fieldArgTypes.label,
        helperText: fieldArgTypes.helperText,
        validationMessage: fieldArgTypes.validationMessage,
        state: fieldArgTypes.state,
        ratios: { control: "object" },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledFocalPointPicker {...args} />,
} satisfies Meta<FocalPointPickerStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Click or drag in the image; the crops below update right away. With the point focused, the arrow keys move it by 1 %, with Shift
 * by 10 %.
 *
 * **Rules**
 *
 * - Set the focal point automatically; people correct it.
 * - Never crop without a preview.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const marker = canvas.getByRole("slider", { name: "Focal point" });
        marker.focus();
        await userEvent.keyboard("{ArrowRight}");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith({ x: 0.57, y: 0.34 }));
        await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith({ x: 0.57, y: 0.44 }));
        await expect(marker).toHaveAttribute("aria-valuetext", "57 % from the left, 44 % from the top");
    },
};

/**
 * A point suggested by image analysis shows dashed with a tag, until someone moves it.
 */
export const Automatic: Story = {
    args: { auto: true },
    play: async ({ canvas }) => {
        await expect(canvas.getByText("Automatic")).toBeVisible();
        canvas.getByRole("slider").focus();
        await userEvent.keyboard("{ArrowLeft}");
        await expect(canvas.queryByText("Automatic")).toBeNull();
    },
};

export const CustomRatios: Story = {
    args: { ratios: ["3:1", "1:1"] },
};

export const WithoutPreviews: Story = {
    args: { ratios: [] },
};

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ args, canvas }) => {
        canvas.getByRole("slider").focus();
        await userEvent.keyboard("{ArrowRight}");
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

/**
 * A `Field` with `layout="group"` adds the label and the message: `<Field label="Focal point" layout="group" state="error"
 * validationMessage="…"><FocalPointPicker … /></Field>`.
 *
 * **Rules**
 * - Say what is missing and how to fix it.
 */
export const Error: Story = {
    args: { label: "Focal point", state: "error", validationMessage: "Set the point on the main subject." },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("group", { name: "Focal point" })).toBeInTheDocument();
        const marker = canvas.getByRole("slider");
        await expect(marker).toHaveAttribute("aria-invalid", "true");
        await expect(marker).toHaveAccessibleDescription("Set the point on the main subject.");
    },
};

export const Warning: Story = {
    args: { label: "Focal point", state: "warning", validationMessage: "The point is close to the edge; narrow crops may cut off the subject." },
};

export const Success: Story = {
    args: { label: "Focal point", state: "success", validationMessage: "Matches the detected face." },
};
