import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../Icon";
import iconTokens from "../Icon.tokens.scss?raw";
import { defaultIconNames } from "../iconRegistry";
import styles from "./Icon.stories.module.scss";
import colorStyles from "./iconColor.module.scss";
import sizeStyles from "./iconSize.module.scss";

const meta = {
    component: Icon,
    title: "Foundations/Icons/Icon",
    decorators: [themeDecorator],
    parameters: { tokens: iconTokens },
    args: {
        name: "favorite",
    },
    argTypes: {
        name: {
            control: "select",
            options: Object.keys(defaultIconNames),
        },
        size: { control: "radio", options: ["small", "default", "large"] },
        "aria-label": { control: "text" },
        className: { control: false },
    },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Do: give icon buttons a tooltip and an accessible name.
 * - Do: keep one icon per meaning — `domain` always means scope or global.
 * - Don't: use an icon as the only information for a status.
 * - Don't: use emoji instead of icons.
 */
export const Default: Story = {};

/**
 * Give an icon an `aria-label` when nothing else, such as a text or the label of its button, gives its meaning.
 */
export const Label: Story = {
    args: {
        "aria-label": "Favorite",
    },
};

/**
 * A colored icon keeps its own colors, for example a logo.
 */
export const ColoredIcon: Story = {
    args: {
        name: "youtube-filled-color",
    },
};

/**
 * Icons inherit the text color. `small` (18px) in buttons, fields, and tables; `default` (20px) in navigation; `large` (24px) in empty
 * states and card headers. Without a size, an icon follows the surrounding component's `--dextinity-icon-size`.
 */
export const Sizes: Story = {
    render: (args) => (
        <div className={styles.row}>
            <Icon {...args} size="small" />
            <Icon {...args} size="default" />
            <Icon {...args} size="large" />
        </div>
    ),
};

/**
 * For any other size, set `width` and `height` in CSS, through `className`.
 */
export const CustomSize: Story = {
    render: (args) => <Icon {...args} className={sizeStyles.largeIcon} />,
};

/**
 * Set `color` in CSS, on the icon or on its parent.
 */
export const Color: Story = {
    render: (args) => (
        <span className={colorStyles.blueText}>
            <Icon {...args} />
        </span>
    ),
};

/**
 * A soft fill (16%) behind the line, only in card headers and empty states. Off in high contrast. The fill is the variable
 * `--dextinity-duotone-icon-<name>`; an icon without one shows only its line.
 */
export const Duotone: Story = {
    render: () => (
        <div className={styles.row}>
            {(["time", "online", "warning", "inbox", "palette", "blocks", "layout", "history"] as const).map((name) => (
                <Icon key={name} name={name} size="large" duotone />
            ))}
        </div>
    ),
};

/**
 * Every icon is a CSS variable, `--dextinity-icon-<name>`, so a theme swaps icons in CSS alone — no React context. Here a class
 * replaces some icons with square, heavier variants:
 *
 * ```css
 * .acme {
 *     --dextinity-icon-search: url("./icons/search.svg#icon");
 * }
 * ```
 *
 * See [Customize icons](?path=/docs/foundations-icons-customize-icons--docs).
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
