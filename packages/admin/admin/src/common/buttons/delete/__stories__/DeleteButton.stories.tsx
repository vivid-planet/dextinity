import type { Meta, StoryObj } from "@storybook/react-vite";

import { DeleteButton } from "../DeleteButton";

type Story = StoryObj<typeof DeleteButton>;

const config: Meta<typeof DeleteButton> = {
    component: DeleteButton,
    title: "components/common/buttons/delete/DeleteButton",
};

export default config;
export const DeleteButtonStory: Story = {};
DeleteButtonStory.storyName = "DeleteButton";
