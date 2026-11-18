import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { Button } from "../../components/button/Button";
import { Menu } from "../../components/menu/Menu";
import { MenuItem } from "../../components/menu/MenuItem";
import { Theme } from "../../components/theme/Theme";
import { DocsPopupRoom } from "../docsPopups";

const levels = ["Page", "Teaser grid", "Teaser 2", "Columns", "Text", "Image", "Gallery", "Video", "Quote", "Accordion", "Table", "Map"];

function MenuInDocsFrame() {
    const [open, setOpen] = useState(false);
    return (
        // Clips like the frame of a story on a docs page
        <div data-testid="frame" style={{ overflowY: "auto", padding: 16 }}>
            <DocsPopupRoom>
                {/* Inside the room, as on a docs page, where the story's own decorators render the theme the popup portals into */}
                <Theme>
                    <Menu open={open} onOpenChange={setOpen} trigger={<Button>Show hidden levels</Button>}>
                        {levels.map((level) => (
                            <MenuItem key={level} label={level} />
                        ))}
                    </Menu>
                </Theme>
            </DocsPopupRoom>
        </div>
    );
}

const meta = {
    component: DocsPopupRoom,
    title: "Storybook/Docs popup room",
    tags: ["development", "!autodocs", "!manifest"],
} satisfies Meta<typeof DocsPopupRoom>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A menu that opens in a frame without room for it: the room grows until the whole menu shows inside the frame, without
 * scrolling.
 */
export const GrowsToFitTheOpenPopup: Story = {
    render: () => <MenuInDocsFrame />,
    play: async ({ canvas }) => {
        const frame = canvas.getByTestId("frame");
        await userEvent.click(canvas.getByRole("button", { name: "Show hidden levels" }));
        const menu = await screen.findByRole("menu");
        await waitFor(() => {
            expect(menu.getBoundingClientRect().bottom).toBeLessThanOrEqual(frame.getBoundingClientRect().bottom);
            expect(menu.getBoundingClientRect().top).toBeGreaterThanOrEqual(frame.getBoundingClientRect().top);
            expect(menu.scrollHeight).toBeLessThanOrEqual(menu.clientHeight + 1);
        });
        await expect(screen.getByRole("menuitem", { name: "Map" })).toBeVisible();
    },
};

/**
 * The room keeps its size once the menu closes, so the page below doesn't jump.
 */
export const KeepsTheRoomAfterThePopupCloses: Story = {
    render: () => <MenuInDocsFrame />,
    play: async ({ canvas }) => {
        const frame = canvas.getByTestId("frame");
        const closedHeight = frame.getBoundingClientRect().height;
        await userEvent.click(canvas.getByRole("button", { name: "Show hidden levels" }));
        const menu = await screen.findByRole("menu");
        await waitFor(() => expect(menu.getBoundingClientRect().bottom).toBeLessThanOrEqual(frame.getBoundingClientRect().bottom));
        const openHeight = frame.getBoundingClientRect().height;
        await expect(openHeight).toBeGreaterThan(closedHeight);
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
        await expect(frame.getBoundingClientRect().height).toBe(openHeight);
    },
};
