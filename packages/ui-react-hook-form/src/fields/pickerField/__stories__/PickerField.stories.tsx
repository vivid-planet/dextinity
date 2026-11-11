import { Icon } from "@dextinity/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { type Page, PagePickerDialog } from "../../../storybook/PagePickerDialog";
import { reactHookFormDecorator } from "../../../storybook/ReactHookFormStoryFrame";
import { PickerField } from "../PickerField";

const meta = {
    title: "Forms/React Hook Form/PickerField",
    component: PickerField<Page>,
    decorators: [reactHookFormDecorator],
    args: {
        name: "target",
        label: "Link target",
        placeholder: "Choose a page",
        icon: <Icon name="file" />,
        renderValue: (page: Page) => `${page.name} (${page.path})`,
        renderPicker: (context) => <PagePickerDialog {...context} />,
    },
} satisfies Meta<typeof PickerField<Page>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Link target Choose a page" }));
        await userEvent.click(await screen.findByText("Contact"));
        await userEvent.click(screen.getByRole("button", { name: "Choose" }));
        await waitFor(() => expect(canvas.getByText('Values: {"target":{"id":"contact","name":"Contact","path":"/contact"}}')).toBeInTheDocument());
        await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
        await waitFor(() => expect(canvas.getByText('Values: {"target":null}')).toBeInTheDocument());
    },
};

export const Required: Story = {
    args: { required: true, requiredMessage: "Choose the page the link opens" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(await canvas.findByText("Choose the page the link opens")).toBeVisible();
        await waitFor(() => expect(canvas.getByRole("button", { name: "Link target Choose a page" })).toHaveFocus());
    },
};
