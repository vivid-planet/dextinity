import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { Banner } from "../Banner";
import bannerTokens from "../Banner.tokens.scss?raw";

const retry = fn();

const meta = {
    component: Banner,
    title: "Building blocks/Menus & messages/Banner",
    decorators: [themeDecorator],
    parameters: { tokens: bannerTokens },
    args: {
        children: "No connection. Changes stay here until they are saved.",
        action: (
            <Button variant="outlined" color="secondary" size="small" onClick={retry}>
                Try again
            </Button>
        ),
    },
    argTypes: {
        tone: { control: "radio", options: ["warning", "error", "info"] },
        icon: { control: "select", options: ["Info", "Globe"], mapping: { Info: <Icon name="info" />, Globe: <Icon name="globe" /> } },
        action: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Banner>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Say what is wrong and what happens now; offer the way out.
 * - Don't show technical error codes as the only information.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("status")).toHaveTextContent("No connection.");
        await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
        await waitFor(() => expect(retry).toHaveBeenCalled());
    },
};

/**
 * A problem that blocks work is announced at once.
 */
export const Error: Story = {
    args: { tone: "error", children: "Saving failed. Your changes are still here." },
};

/**
 * A notice about the page.
 */
export const Info: Story = {
    args: { tone: "info", children: "This page is shown in 3 scopes.", action: undefined },
};
