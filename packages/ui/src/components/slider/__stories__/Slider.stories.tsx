import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { fieldArgTypes, type FieldStoryArgs, hasFieldArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { Slider, type SliderProps } from "../Slider";
import sliderTokens from "../Slider.tokens.scss?raw";

const iconOptions = {
    Image: <Icon name="image" />,
    Gallery: <Icon name="images" />,
};

type SliderStoryArgs = SliderProps & Pick<FieldStoryArgs, "label" | "helperText" | "validationMessage" | "state">;

/**
 * Binds the value to its story arg, so the Controls panel drives it and a change on the canvas updates the arg. With a field arg, it
 * puts the slider in a `Field` with `layout="group"`.
 */
function ControlledSlider({ storyId, ...args }: SliderStoryArgs & { storyId: string }) {
    const { field, control } = splitFieldArgs(args);
    const [value, setValue] = useControlledArg(control, "value", { id: storyId });
    const slider = (
        <Slider
            {...control}
            value={value}
            onChange={(next) => {
                control.onChange(next);
                setValue(next);
            }}
        />
    );
    return hasFieldArgs(field) ? (
        <StoryField field={field} layout="group">
            {slider}
        </StoryField>
    ) : (
        slider
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
        label: fieldArgTypes.label,
        helperText: fieldArgTypes.helperText,
        validationMessage: fieldArgTypes.validationMessage,
        state: fieldArgTypes.state,
        startIcon: { control: "select", options: Object.keys(iconOptions), mapping: iconOptions },
        endIcon: { control: "select", options: Object.keys(iconOptions), mapping: iconOptions },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args, context) => <ControlledSlider {...args} storyId={context.id} />,
} satisfies Meta<SliderStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Always controlled: `value` + `onChange`.
 * - On its own, name the slider with `aria-label`; in a form, put it in a `Field` with `layout="group"`, whose label names it.
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

/**
 * A visible label above the slider, e.g. in a form: `<Field label="Opacity" layout="group"><Slider … /></Field>`.
 */
export const WithLabel: Story = {
    args: { "aria-label": undefined, label: "Opacity" },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("slider", { name: "Opacity" })).toBeInTheDocument();
    },
};

/**
 * **Rules**
 * - Say what is missing and how to fix it.
 */
export const Error: Story = {
    args: {
        "aria-label": undefined,
        label: "Opacity",
        value: 10,
        state: "error",
        validationMessage: "Use at least 20 % so the text stays readable.",
    },
    play: async ({ canvas }) => {
        const slider = canvas.getByRole("slider", { name: "Opacity" });
        await expect(slider).toBeInvalid();
        await expect(slider).toHaveAccessibleDescription("Use at least 20 % so the text stays readable.");
    },
};

export const Warning: Story = {
    args: { "aria-label": undefined, label: "Opacity", value: 30, state: "warning", validationMessage: "Low contrast with light images." },
};

export const Success: Story = {
    args: { "aria-label": undefined, label: "Opacity", value: 80, state: "success", validationMessage: "Readable on all images." },
};
