import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { reactHookFormDecorator } from "../../../storybook/ReactHookFormStoryFrame";
import { RichTextEditorField } from "../RichTextEditorField";

const meta = {
    title: "Forms/React Hook Form/RichTextEditorField",
    component: RichTextEditorField,
    decorators: [reactHookFormDecorator],
    parameters: { initialValues: { body: "<p>We build digital products that <b>stay in use</b> for many years.</p>" } },
    args: { name: "body", label: "Text" },
} satisfies Meta<typeof RichTextEditorField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Markup without visible text counts as empty, so a required editor that was cleared shows the error.
 */
export const Required: Story = {
    args: { required: true, requiredMessage: "Write a text" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const editor = canvas.getByRole("textbox", { name: "Text" });

        await userEvent.click(editor);
        await userEvent.keyboard("{Control>}a{/Control}{Backspace}");
        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(await canvas.findByText("Write a text")).toBeVisible();
        await waitFor(() => expect(editor).toHaveFocus());
    },
};
