import { FieldActions } from "@dextinity/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { finalFormDecorator } from "../../../storybook/FinalFormStoryFrame";
import { InputField } from "../InputField";

const meta = {
    title: "Forms/Final Form/InputField",
    component: InputField,
    decorators: [finalFormDecorator],
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
        validate: (value) =>
            typeof value === "string" && !/^[a-z0-9-]*$/.test(value) ? "Use lowercase letters, digits, and dashes only" : undefined,
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

export const ParseAndFormat: Story = {
    args: { name: "salary", label: "Salary" },
    parameters: { initialValues: { salary: 58000 } },
    render: ({ name, label }) => (
        <InputField<number | undefined>
            name={name}
            label={label}
            type="number"
            suffix="€ gross / year"
            parse={(value) => (value === "" ? undefined : Number(value))}
            format={(value) => (value == null ? "" : String(value))}
        />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText("Salary");

        await userEvent.clear(input);
        await userEvent.type(input, "62000");
        await expect(canvas.getByText(/^Values:/)).toHaveTextContent('"salary":62000');
    },
};

export const WithFieldActions: Story = {
    args: {
        actions: ({ setValue }) => <FieldActions aiAssist onAiSuggest={async () => "Benefits of working with us"} onAiAccept={setValue} />,
    },
};
