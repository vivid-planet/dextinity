import { FieldActions, SaveState } from "@dextinity/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { useFormSaveState } from "../../../formState/useFormSaveState";
import { reactHookFormDecorator } from "../../../storybook/ReactHookFormStoryFrame";
import { InputField } from "../InputField";

function FormSaveState() {
    return <SaveState {...useFormSaveState()} />;
}

const meta = {
    title: "Fields/InputField",
    component: InputField,
    decorators: [reactHookFormDecorator],
    parameters: { initialValues: { title: "Benefits" } },
    args: { name: "title", label: "Title" },
} satisfies Meta<typeof InputField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText("Title");
        await expect(input).toHaveValue("Benefits");

        await userEvent.type(input, " at Example Inc.");
        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(await canvas.findByRole("status")).toHaveTextContent('Submitted: {"title":"Benefits at Example Inc."}');
    },
};

export const Required: Story = {
    args: { required: true, requiredMessage: "Enter a title" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText("Title");

        await userEvent.clear(input);
        await expect(canvas.queryByText("Enter a title")).not.toBeInTheDocument();
        await userEvent.tab();
        await expect(canvas.getByText("Enter a title")).toBeVisible();
        await expect(input).toHaveAttribute("aria-invalid", "true");

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await waitFor(() => expect(input).toHaveFocus());
        await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
    },
};

export const Validation: Story = {
    args: {
        name: "slug",
        label: "URL",
        prefix: "example.com/",
        helperText: "Lowercase letters, digits, and dashes",
        rules: { pattern: { value: /^[a-z0-9-]*$/, message: "Use lowercase letters, digits, and dashes only" } },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText("URL");

        await userEvent.type(input, "Our Benefits");
        await expect(canvas.getByText("Lowercase letters, digits, and dashes")).toBeVisible();
        await userEvent.tab();
        await expect(canvas.getByText("Use lowercase letters, digits, and dashes only")).toBeVisible();

        await userEvent.clear(input);
        await userEvent.type(input, "our-benefits");
        await expect(canvas.queryByText("Use lowercase letters, digits, and dashes only")).not.toBeInTheDocument();
    },
};

/**
 * `rules` take React Hook Form's validation rules as in `register`; `required` adds its check in front of them.
 */
export const Rules: Story = {
    args: {
        name: "zip",
        label: "ZIP code",
        required: true,
        requiredMessage: "Enter a ZIP code",
        rules: { minLength: { value: 4, message: "Enter at least 4 digits" }, validate: (value) => /^\d*$/.test(value ?? "") || "Digits only" },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText("ZIP code");

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(canvas.getByText("Enter a ZIP code")).toBeVisible();
        await waitFor(() => expect(input).toHaveFocus());

        await userEvent.type(input, "10");
        await expect(canvas.getByText("Enter at least 4 digits")).toBeVisible();
        await userEvent.type(input, "2a");
        await expect(canvas.getByText("Digits only")).toBeVisible();
    },
};

export const WithFieldActions: Story = {
    args: {
        actions: ({ setValue }) => <FieldActions aiAssist onAiSuggest={async () => "Benefits of working with us"} onAiAccept={setValue} />,
    },
};

export const EmptiedAgain: Story = {
    parameters: { initialValues: { title: null } },
    render: (args) => (
        <>
            <FormSaveState />
            <InputField {...args} />
        </>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText("Title");

        await userEvent.type(input, "Benefits");
        await expect(canvas.getByText("Unsaved changes")).toBeVisible();
        await userEvent.clear(input);
        await expect(canvas.getByText("All changes saved")).toBeVisible();
    },
};
