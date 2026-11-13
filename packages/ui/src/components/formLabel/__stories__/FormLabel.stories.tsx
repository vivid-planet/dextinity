import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { FormLabel } from "../FormLabel";
import formLabelTokens from "../FormLabel.tokens.scss?raw";
import styles from "./formLabel.module.scss";

const meta = {
    component: FormLabel,
    title: "Building blocks/Form fields/FormLabel",
    parameters: { tokens: formLabelTokens },
    decorators: [themeDecorator],
    args: {
        children: "Label",
    },
    argTypes: {
        helpText: { control: "text" },
        labels: { control: false },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
        ref: { control: false },
    },
} satisfies Meta<typeof FormLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
    args: {
        required: true,
    },
};

export const Error: Story = {
    args: {
        error: true,
        required: true,
    },
};

/**
 * `helpText` adds an info button after the label. Hover, keyboard focus, or a tap shows the text in a tooltip; the button is named "More
 * information" (`labels.helpText`) and described by the text. Add `helpTextId` to the control's `aria-describedby` so the text describes
 * the control too.
 *
 * **helpText or helperText?**
 * - `helpText` is background most users don't need, e.g. where a value is used. It stays hidden until asked for.
 * - `helperText` (on `Field`, or a `FormHelperText`) is what everyone needs to fill in the field, e.g. the expected format. It is always
 *   visible below the field.
 */
export const WithHelpText: Story = {
    args: {
        helpText: "Shown in search results and when the page is shared.",
        helpTextId: "title-help",
    },
    play: async ({ canvas }) => {
        const button = canvas.getByRole("button", { name: "More information" });
        await expect(button).toHaveAccessibleDescription("Shown in search results and when the page is shared.");
        await userEvent.tab();
        await expect(button).toHaveFocus();
        await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("Shown in search results and when the page is shared."));
        await expect(document.getElementById("title-help")).toHaveTextContent("Shown in search results and when the page is shared.");
    },
};

export const LongLabel: Story = {
    args: {
        required: true,
        helpText: "Shown in search results and when the page is shared.",
        children: "The label of a field whose description is long enough to wrap onto a second line",
    },
    decorators: [(Story) => <div className={styles.longLabel}>{Story()}</div>],
};
