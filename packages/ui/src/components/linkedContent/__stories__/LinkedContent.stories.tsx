import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import linkedContentTokens from "../_tokens.scss?raw";
import { LinkedContent } from "../LinkedContent";
import styles from "./LinkedContent.stories.module.scss";

const iconOptions = {
    Blocks: <Icon name="blocks" />,
    Page: <Icon name="page" />,
    Image: <Icon name="image" />,
    Folder: <Icon name="folder" />,
};

const meta = {
    component: LinkedContent,
    title: "Building blocks/Page header, breadcrumbs & links/LinkedContent",
    decorators: [
        (Story) => (
            <div className={styles.frame}>
                <Story />
            </div>
        ),
        themeDecorator,
    ],
    parameters: { tokens: linkedContentTokens },
    args: {
        title: "Job postings",
        description: "12 entries are shown here",
        href: "#job-postings",
        onClick: fn((event) => event.preventDefault()),
    },
    argTypes: {
        icon: { control: "select", options: Object.keys(iconOptions), mapping: iconOptions },
        className: { control: false },
        slotProps: { control: false },
        render: { control: false },
    },
} satisfies Meta<typeof LinkedContent>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Structured content shown on a page, e.g. the job postings a block lists. Opens the list.
 *
 * **Rules**
 *
 * - The title names the content type, the description says what is shown here.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("link", { name: /Job postings/ }));
        await expect(args.onClick).toHaveBeenCalled();
    },
};

/**
 * Without a description, only the content type.
 */
export const WithoutDescription: Story = {
    args: { description: undefined, title: "Product catalog", icon: <Icon name="folder" /> },
};

/**
 * Several references in a column, e.g. everything a page shows.
 */
export const List: Story = {
    render: (args) => (
        <div className={styles.list}>
            <LinkedContent {...args} />
            <LinkedContent {...args} title="News" description="The 3 latest articles" icon={<Icon name="page" />} />
            <LinkedContent {...args} title="Gallery" description="8 images from the folder Campus" icon={<Icon name="image" />} />
        </div>
    ),
};

/**
 * Tab reaches the reference, Enter opens it.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("link", { name: /Job postings/ })).toHaveFocus();
        await userEvent.keyboard("{Enter}");
        await expect(args.onClick).toHaveBeenCalled();
    },
};
