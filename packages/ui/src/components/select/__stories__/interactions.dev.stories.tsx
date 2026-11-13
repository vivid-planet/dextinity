import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { Select } from "../Select";
import selectMeta, { InDialog, type SelectStoryArgs } from "./Select.stories";

const meta = {
    component: Select,
    title: "Building blocks/Form fields/Select",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: selectMeta.decorators,
    render: selectMeta.render,
    args: selectMeta.args,
} satisfies Meta<SelectStoryArgs<boolean>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InDialogOpensTheOptionsAboveTheDialog: Story = {
    ...InDialog,
    play: async ({ args }) => {
        const dialog = await screen.findByRole("dialog", { name: "Move event" });
        await userEvent.click(within(dialog).getByRole("combobox", { name: /Location/ }));
        const option = await screen.findByRole("option", { name: "Graz" });
        await waitFor(() => {
            const { left, top, width, height } = option.getBoundingClientRect();
            expect(option.contains(document.elementFromPoint(left + width / 2, top + height / 2))).toBe(true);
        });
        await userEvent.click(option);
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith("graz"));
    },
};
