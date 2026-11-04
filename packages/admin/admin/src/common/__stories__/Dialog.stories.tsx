import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../buttons/Button";
import { Dialog } from "../Dialog";

type Story = StoryObj<typeof Dialog>;

const config: Meta<typeof Dialog> = {
    component: Dialog,
    title: "components/common/Dialog",
};

export default config;
export const DialogStory: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <div>
                <Button
                    onClick={() => {
                        setOpen(true);
                    }}
                >
                    Open Dialog
                </Button>
                <Dialog
                    open={open}
                    onClose={() => {
                        setOpen(!open);
                    }}
                    title="Dialog"
                >
                    <Box padding={4}>Content</Box>
                </Dialog>
            </div>
        );
    },
};
DialogStory.storyName = "Dialog";
