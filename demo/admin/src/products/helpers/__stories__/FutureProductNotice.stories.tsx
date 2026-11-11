import type { Meta, StoryObj } from "@storybook/react-vite";
import { addDays, subDays } from "date-fns";
import { Form } from "react-final-form";
import { expect, within } from "storybook/test";

import { FutureProductNotice } from "../FutureProductNotice";

type StoryArgs = {
    availableSince: Date | null;
};

const meta: Meta<StoryArgs> = {
    title: "Products/FutureProductNotice",
    component: FutureProductNotice,
    argTypes: {
        availableSince: { control: "date" },
    },
    // The notice reads the `availableSince` field of the surrounding product form.
    render: ({ availableSince }) => (
        <Form initialValues={{ availableSince }} onSubmit={() => {}}>
            {() => <FutureProductNotice />}
        </Form>
    ),
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const AvailableInTheFuture: Story = {
    args: {
        availableSince: addDays(new Date(), 7),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText("This product will not be visible to the public until the selected date.")).toBeInTheDocument();
    },
};

export const AlreadyAvailable: Story = {
    args: {
        availableSince: subDays(new Date(), 7),
    },
    play: async ({ canvasElement }) => {
        await expect(canvasElement).toBeEmptyDOMElement();
    },
};
