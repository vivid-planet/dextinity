import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Link } from "../../link/Link";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { KeyValueList } from "../KeyValueList";
import keyValueListTokens from "../KeyValueList.tokens.scss?raw";
import styles from "./KeyValueList.stories.module.scss";

const meta = {
    component: KeyValueList,
    title: "Building blocks/Panels, cards & metrics/KeyValueList",
    decorators: [
        (Story) => (
            <div className={styles.frame}>
                <Story />
            </div>
        ),
        themeDecorator,
    ],
    parameters: { tokens: keyValueListTokens },
    args: {
        items: [
            { key: "Status", value: <StatusIndicator status="published" /> },
            { key: "Template", value: "Careers" },
            { key: "Changed", value: "12 min ago" },
        ],
    },
    argTypes: {
        layout: { control: "radio", options: ["columns", "stacked"] },
        items: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof KeyValueList>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Keep keys short nouns; the value carries the information.
 * - Show a status as `StatusIndicator`, never as colored text.
 */
export const Default: Story = {};

/**
 * Each key above its value, for narrow panels.
 */
export const Stacked: Story = {
    args: { layout: "stacked" },
    decorators: [
        (Story) => (
            <div className={styles.narrow}>
                <Story />
            </div>
        ),
    ],
};

/**
 * Values can link to related content.
 */
export const WithLinks: Story = {
    args: {
        items: [
            { key: "Status", value: <StatusIndicator status="unpublished" /> },
            {
                key: "Parent page",
                value: (
                    <Link href="#careers" color="accent">
                        Careers
                    </Link>
                ),
            },
            { key: "Author", value: "Anna Klein" },
        ],
    },
};
