import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { finalFormDecorator } from "../../storybook/FinalFormStoryFrame";
import { SelectField } from "../SelectField";

const categories = [
    { value: "news", label: "News" },
    { value: "blog", label: "Blog" },
    { value: "jobs", label: "Jobs" },
    { value: "events", label: "Events" },
];

const meta = {
    title: "Forms/Final Form/SelectField",
    component: SelectField,
    decorators: [finalFormDecorator],
    args: { name: "category", label: "Category", options: categories, placeholder: "Choose a category" },
} satisfies Meta<typeof SelectField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("combobox", { name: /Category/ }));
        await userEvent.click(await screen.findByRole("option", { name: "Blog" }));
        await waitFor(() => expect(canvas.getByText('Values: {"category":"blog"}')).toBeInTheDocument());
    },
};

export const Required: Story = {
    args: { required: true, requiredMessage: "Select the category the page belongs to" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(await canvas.findByText("Select the category the page belongs to")).toBeVisible();
        await waitFor(() => expect(canvas.getByRole("combobox", { name: /Category/ })).toHaveFocus());
    },
};

export const Multiple: Story = {
    args: { name: "tags", label: "Tags", multiple: true, searchable: true, placeholder: "Add tags" },
    parameters: { initialValues: { tags: ["news", "jobs"] } },
};
