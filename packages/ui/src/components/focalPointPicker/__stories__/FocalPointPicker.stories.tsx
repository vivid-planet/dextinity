import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { landscapeImage } from "../../../storybook/sampleImages";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { FocalPointPicker, type FocalPointPickerProps } from "../FocalPointPicker";
import focalPointPickerTokens from "../FocalPointPicker.tokens.scss?raw";
import styles from "./FocalPointPicker.stories.module.scss";

/** Keeps the story controlled: moving the point updates the local value and clears `auto`. */
function ControlledFocalPointPicker(props: FocalPointPickerProps) {
    const [value, setValue] = useState(props.value);
    const [auto, setAuto] = useState(props.auto);
    return (
        <div className={styles.container}>
            <FocalPointPicker
                {...props}
                value={value}
                auto={auto}
                onChange={(next) => {
                    props.onChange(next);
                    setValue(next);
                    setAuto(false);
                }}
            />
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
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        ratios: { control: "object" },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledFocalPointPicker {...args} />,
} satisfies Meta<typeof FocalPointPicker>;

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
 * **Rules**
 * - Say what is missing and how to fix it.
 */
export const Error: Story = {
    args: { state: "error", validationMessage: "Set the point on the main subject." },
    play: async ({ canvas }) => {
        const marker = canvas.getByRole("slider");
        await expect(marker).toHaveAttribute("aria-invalid", "true");
        await expect(marker).toHaveAccessibleDescription("Set the point on the main subject.");
    },
};

export const Warning: Story = {
    args: { state: "warning", validationMessage: "The point is close to the edge; narrow crops may cut off the subject." },
};

export const Success: Story = {
    args: { state: "success", validationMessage: "Matches the detected face." },
};
