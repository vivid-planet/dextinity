import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";

import { themeDecorator } from "../../../storybook/themeDecorator";
import iconTokens from "../_tokens.scss?raw";
import { Icon } from "../Icon";
import { iconNames } from "../iconNames";
import styles from "./Icon.stories.module.scss";

const meta = {
    component: Icon,
    title: "Foundations/Icons",
    decorators: [themeDecorator],
    parameters: { tokens: iconTokens },
    args: {
        name: "globe",
    },
    argTypes: {
        name: { control: "select", options: iconNames },
        size: { control: "radio", options: ["small", "default", "large"] },
        className: { control: false },
    },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * The whole set: line width 1.5 on a 24px grid. The name is the prop value.
 *
 * **Rules**
 *
 * - Do: give icon buttons a tooltip and an accessible name.
 * - Do: keep one icon per meaning — the globe always means scope or global.
 * - Do: draw new icons on the 24px grid with the same line width.
 * - Don't: use an icon as the only information for a status.
 * - Don't: mix filled and line icons.
 * - Don't: use emoji instead of icons.
 */
export const Set: Story = {
    render: () => (
        <div className={styles.grid}>
            {iconNames.map((name) => (
                <div key={name} className={styles.cell}>
                    <Icon name={name} size="large" />
                    <code>{name}</code>
                </div>
            ))}
        </div>
    ),
};

/**
 * Icons inherit the text color. Next to text they center on the x-height. `small` (16px) in buttons, fields, and tables; `default`
 * (20px) in navigation and icon buttons; `large` (24px) in empty states and card headers.
 */
export const Sizes: Story = {
    render: () => (
        <div className={styles.row}>
            <Icon name="folder" size="small" />
            <Icon name="folder" size="default" />
            <Icon name="folder" size="large" />
        </div>
    ),
};

/**
 * A soft fill (16%) behind the line, only in card headers and empty states. Off in high contrast.
 */
export const Duotone: Story = {
    render: () => (
        <div className={styles.row}>
            {(["recent", "live", "warning", "inbox", "palette", "component"] as const).map((name) => (
                <Icon key={name} name={name} size="large" duotone />
            ))}
        </div>
    ),
};

export const WithLabel: Story = {
    args: {
        name: "warning",
        label: "Warning",
    },
};

/**
 * Every icon is a CSS variable, `--dextinity-icon-<name>`, so a theme swaps icons in CSS alone — no React context. Here a class
 * replaces some icons with square, heavier variants:
 *
 * ```css
 * [data-dextinity-brand="acme"] {
 *     --dextinity-icon-search: url("data:image/svg+xml,…");
 * }
 * ```
 */
export const CustomIcons: Story = {
    render: () => (
        <div className={styles.variants}>
            {(["default", "custom"] as const).map((variant) => (
                <div key={variant} className={clsx(styles.row, variant === "custom" && styles.customIcons)}>
                    <code className={styles.variantName}>{variant}</code>
                    {(["search", "home", "folder", "check", "close", "plus", "arrow-right", "chevron-down"] as const).map((name) => (
                        <Icon key={name} name={name} size="large" />
                    ))}
                </div>
            ))}
        </div>
    ),
};
