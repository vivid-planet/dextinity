import type { Meta, StoryObj } from "@storybook/react-vite";

import { GlobalActionLogPage } from "../GlobalActionLogPage";

type Story = StoryObj<typeof GlobalActionLogPage>;
const meta: Meta<typeof GlobalActionLogPage> = {
    component: GlobalActionLogPage,
    tags: ["!autodocs"],
    title: "actionLog/globalActionLog/globalActionLogPage/GlobalActionLogPage",
};
export default meta;

export const Standard: Story = {};
