import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Theme } from "../../theme/Theme";
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
 * Icons inherit the text color. Next to text they center on the x-height.
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
 * Every icon is a CSS variable, `--dextinity-icon-<name>`, so a brand swaps icons in CSS alone — no React context. Here the example
 * brand Nordwerk replaces some icons with square, heavier variants:
 *
 * ```css
 * [data-dextinity-brand="nordwerk"] {
 *     --dextinity-icon-search: url("data:image/svg+xml,…");
 * }
 * ```
 */
export const PerBrand: Story = {
    render: () => (
        <div className={styles.brands}>
            {(["dextinity", "nordwerk"] as const).map((brand) => (
                <Theme key={brand} brand={brand}>
                    <div className={styles.row}>
                        <code className={styles.brandName}>{brand}</code>
                        {(["search", "home", "folder", "check", "close", "plus", "arrow-right", "chevron-down"] as const).map((name) => (
                            <Icon key={name} name={name} size="large" />
                        ))}
                    </div>
                </Theme>
            ))}
        </div>
    ),
};
