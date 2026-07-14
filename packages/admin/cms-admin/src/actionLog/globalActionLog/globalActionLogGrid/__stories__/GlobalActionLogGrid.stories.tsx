import type { Meta, StoryObj } from "@storybook/react-vite";

import { GlobalActionLogGrid } from "../GlobalActionLogGrid";

type Story = StoryObj<typeof GlobalActionLogGrid>;
const meta: Meta<typeof GlobalActionLogGrid> = {
    component: GlobalActionLogGrid,
    tags: ["!autodocs"],
    title: "actionLog/globalActionLog/globalActionLogGrid/GlobalActionLogGrid",
};
export default meta;

export const Standard: Story = {};
