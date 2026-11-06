import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import sliderTokens from "../_tokens.scss?raw";
import { Slider, type SliderProps } from "../Slider";

const iconOptions = {
    Image: <Icon name="image" />,
    Gallery: <Icon name="gallery" />,
};

/** Keeps the story controlled: moving updates the local value; the `value` arg sets the initial one. */
function ControlledSlider(props: SliderProps) {
    const [value, setValue] = useState(props.value);
    return (
        <Slider
            {...props}
            value={value}
            onChange={(next) => {
                props.onChange(next);
                setValue(next);
            }}
        />
    );
}

const meta = {
    component: Slider,
    title: "Building blocks/Media & upload/Slider",
    decorators: [themeDecorator],
    parameters: { tokens: sliderTokens },
    args: {
        "aria-label": "Icon size",
        value: 40,
        onChange: fn(),
    },
    argTypes: {
        startIcon: { control: "select", options: Object.keys(iconOptions), mapping: iconOptions },
        endIcon: { control: "select", options: Object.keys(iconOptions), mapping: iconOptions },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledSlider {...args} />,
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Always controlled: `value` + `onChange`.
 * - Name the slider with `aria-label`; it has no visible label.
 */
export const Default: Story = {};

/**
 * A small and a large icon mark the ends, as for the icon size above a file list.
 */
export const WithIcons: Story = {
    args: { startIcon: <Icon name="image" />, endIcon: <Icon name="image" />, min: 84, max: 220, step: 2, value: 118 },
};

export const Disabled: Story = {
    args: { disabled: true, startIcon: <Icon name="image" />, endIcon: <Icon name="image" /> },
};

/**
 * Arrow keys change the value by `step`; Home and End jump to the ends.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        const slider = canvas.getByRole("slider", { name: "Icon size" });
        await expect(slider).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(41));
        await userEvent.keyboard("{End}");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(100));
        await expect(slider).toHaveAttribute("aria-valuenow", "100");
    },
};
