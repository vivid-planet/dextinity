import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import avatarTokens from "../_tokens.scss?raw";
import { Avatar } from "../Avatar";
import styles from "./Avatar.stories.module.scss";

const pictureUrl = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4b08a"/><stop offset="1" stop-color="#7a6ad8"/></linearGradient></defs><rect width="40" height="40" fill="url(#g)"/><circle cx="20" cy="16" r="7" fill="#fff" fill-opacity=".85"/><ellipse cx="20" cy="38" rx="13" ry="10" fill="#fff" fill-opacity=".85"/></svg>`,
)}`;

const meta = {
    component: Avatar,
    title: "Building blocks/Status, tags & badges/Avatar",
    decorators: [themeDecorator],
    parameters: { tokens: avatarTokens },
    args: {
        name: "Anna König",
    },
    argTypes: {
        size: {
            control: "radio",
            options: ["default", "small", "large"],
        },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Initials from the first and the last word of the name; the full name is the tooltip and the accessible name.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await userEvent.hover(canvas.getByRole("img", { name: "Anna König" }));
        await expect(await screen.findByRole("tooltip")).toHaveTextContent("Anna König");
    },
};

export const WithPicture: Story = {
    args: {
        src: pictureUrl,
    },
};

/**
 * `small` in dense rows and chips, `large` in person cards.
 */
export const Sizes: Story = {
    render: (args) => (
        <div className={styles.row}>
            <Avatar {...args} size="small" />
            <Avatar {...args} />
            <Avatar {...args} size="large" />
            <Avatar {...args} size="small" src={pictureUrl} />
            <Avatar {...args} src={pictureUrl} />
            <Avatar {...args} size="large" src={pictureUrl} />
        </div>
    ),
};

/**
 * Without a tooltip where the name is already shown next to the avatar.
 */
export const WithoutTooltip: Story = {
    args: {
        tooltip: false,
    },
};
