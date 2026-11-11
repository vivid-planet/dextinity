import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { finalFormDecorator } from "../../../storybook/FinalFormStoryFrame";
import { type Category, createCategory, searchCategories } from "../../../storybook/sampleCategories";
import { ComboboxField } from "../ComboboxField";

const getOptionLabel = (category: Category) => category.title;

const meta = {
    title: "Fields/ComboboxField",
    component: ComboboxField<Category>,
    decorators: [finalFormDecorator],
    args: { name: "category", label: "Category", placeholder: "Search categories", loadOptions: searchCategories, getOptionLabel },
} satisfies Meta<typeof ComboboxField<Category>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole("combobox", { name: "Category" });

        await userEvent.click(input);
        await userEvent.type(input, "ten");
        await userEvent.click(await screen.findByRole("option", { name: "Tents" }));
        await waitFor(() => expect(canvas.getByText('Values: {"category":{"id":"10","title":"Tents"}}')).toBeInTheDocument());
    },
};

export const Required: Story = {
    args: { required: true, requiredMessage: "Choose the category the product belongs to" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(await canvas.findByText("Choose the category the product belongs to")).toBeVisible();
        await waitFor(() => expect(canvas.getByRole("combobox", { name: "Category" })).toHaveFocus());
    },
};

/**
 * Several options, and creating a missing one with `onCreate`.
 */
export const MultipleWithCreate: Story = {
    render: () => (
        <ComboboxField<Category, true>
            name="tags"
            label="Tags"
            placeholder="Add tags"
            loadOptions={searchCategories}
            getOptionLabel={getOptionLabel}
            multiple
            onCreate={createCategory}
        />
    ),
    parameters: { initialValues: { tags: [{ id: "1", title: "Backpacks" }] } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole("combobox", { name: "Tags" });

        await userEvent.click(input);
        await userEvent.type(input, "Kayaks");
        await userEvent.click(await screen.findByRole("option", { name: "Create “Kayaks”" }));
        await waitFor(() =>
            expect(canvas.getByText('Values: {"tags":[{"id":"1","title":"Backpacks"},{"id":"new-kayaks","title":"Kayaks"}]}')).toBeInTheDocument(),
        );
    },
};
