import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { type FieldStoryArgs, groupFieldArgTypes, hasFieldArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { RadioGroup, type RadioGroupProps } from "../RadioGroup";
import radioGroupTokens from "../RadioGroup.tokens.scss?raw";

type RadioGroupStoryArgs = RadioGroupProps & FieldStoryArgs;

/**
 * Binds the value to its story arg, so the Controls panel drives it and a change on the canvas updates the arg. With a field arg, it
 * puts the group in a `Field` with `layout="group"`, whose label names the group.
 */
function ControlledRadioGroup({ storyId, ...args }: RadioGroupStoryArgs & { storyId: string }) {
    const { field, control } = splitFieldArgs(args);
    const [value, setValue] = useControlledArg(control, "value", { id: storyId });
    const radioGroup = (
        <RadioGroup
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
            {radioGroup}
        </StoryField>
    ) : (
        radioGroup
    );
}

const meta = {
    component: RadioGroup,
    title: "Building blocks/Selection & toggles/RadioGroup",
    decorators: [themeDecorator],
    parameters: { tokens: radioGroupTokens },
    render: (args, context) => <ControlledRadioGroup {...args} storyId={context.id} />,
    args: {
        label: "Employment",
        options: [
            { value: "full-time", label: "Full-time" },
            { value: "part-time", label: "Part-time" },
            { value: "freelance", label: "Freelance" },
        ],
        value: "full-time",
        onChange: fn(),
    },
    argTypes: {
        ...groupFieldArgTypes,
        variant: { control: "radio", options: ["default", "card"] },
        orientation: { control: "radio", options: ["vertical", "horizontal"] },
        className: { control: false },
    },
} satisfies Meta<RadioGroupStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 * - Always controlled: `value` + `onChange`, `null` while nothing is chosen.
 * - For two to four options in a toolbar, use `SegmentedControl`; for many options, a `Select`.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("radio", { name: "Part-time" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("part-time"));
        await expect(canvas.getByRole("radio", { name: "Part-time" })).toHaveAttribute("aria-checked", "true");
        await expect(canvas.getByRole("radiogroup", { name: "Employment" })).toBeInTheDocument();
    },
};

/**
 * The arrow keys move the choice; Tab leaves the group.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("radio", { name: "Full-time" })).toHaveFocus();
        await userEvent.keyboard("{ArrowDown}");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("part-time"));
        await expect(canvas.getByRole("radio", { name: "Part-time" })).toHaveFocus();
    },
};

export const NothingChosen: Story = {
    args: { value: null },
};

export const Horizontal: Story = {
    args: { orientation: "horizontal" },
};

/**
 * Options with a description, e.g. the variants of a block.
 */
export const WithDescriptions: Story = {
    args: {
        label: "Teaser layout",
        value: "image-left",
        options: [
            { value: "image-left", label: "Image left", description: "The image takes a third of the width." },
            { value: "image-top", label: "Image on top", description: "For narrow columns." },
            { value: "text-only", label: "Text only", description: "Without an image." },
        ],
    },
};

/**
 * Bordered cards give options with a description more weight, e.g. when starting builds or choosing a page type.
 */
export const Card: Story = {
    args: { ...WithDescriptions.args, variant: "card" },
};

export const CardHorizontal: Story = {
    args: { ...WithDescriptions.args, variant: "card", orientation: "horizontal" },
};

export const HelperText: Story = {
    args: { helperText: "Shown as a filter on the job board." },
};

export const DisabledOption: Story = {
    args: {
        options: [
            { value: "full-time", label: "Full-time" },
            { value: "part-time", label: "Part-time" },
            { value: "freelance", label: "Freelance", disabled: true },
        ],
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("radio", { name: "Freelance" }));
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

export const Disabled: Story = {
    args: { disabled: true },
};

export const ReadOnly: Story = {
    args: { readOnly: true },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("radio", { name: "Part-time" }));
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

/**
 * Without a `Field`, `aria-label` names the group.
 */
export const WithoutLabel: Story = {
    args: { label: undefined, "aria-label": "Employment" },
};

/**
 * **Rules**
 * - Say what is missing and how to fix it.
 */
export const Error: Story = {
    args: { value: null, required: true, state: "error", validationMessage: "Choose the type of employment." },
    play: async ({ canvas }) => {
        const group = canvas.getByRole("radiogroup", { name: "Employment" });
        await expect(group).toHaveAttribute("aria-invalid", "true");
        await expect(group).toHaveAccessibleDescription("Choose the type of employment.");
    },
};

export const Warning: Story = {
    args: { value: "freelance", state: "warning", validationMessage: "Freelance jobs aren't shown on the partner portals." },
};

export const Success: Story = {
    args: { state: "success", validationMessage: "Matches the job description." },
};
