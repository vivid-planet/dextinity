import type { Meta, StoryContext, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";
import { expect } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Theme } from "../../theme/Theme";
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
        name: "star-fill",
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
 * - Do: keep one icon per meaning — `globe` always means scope or global.
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
 * A colored icon keeps its own colors, for example a logo. It ignores the text color. In high contrast and in forced
 * colors, the Dextinity marks switch to their flat forms in the text color.
 *
 * The Dextinity mark comes in both forms: `dextinity` in the text color and `dextinity-color` in the brand colors. So does the
 * filled mark, the app icon like the favicon: `dextinity-filled` in the text color and `dextinity-filled-color` in the brand colors.
 */
export const ColoredIcon: Story = {
    tags: ["forced-colors"],
    parameters: { controls: { disable: true } },
    render: () => <DextinityMarks />,
    play: async ({ canvas }) => {
        await expectDextinityMarks(canvas);
    },
};

export const ColoredIconInHighContrast: Story = {
    tags: ["!dev", "!autodocs", "!manifest"],
    render: () => (
        <Theme colorScheme="high-contrast">
            <DextinityMarks />
        </Theme>
    ),
    play: async ({ canvas }) => {
        await expectDextinityMarks(canvas);
    },
};

function DextinityMarks() {
    return (
        <div className={styles.row}>
            <Icon name="dextinity" size="large" aria-label="Dextinity" />
            <Icon name="dextinity-color" size="large" aria-label="Dextinity in color" />
            <Icon name="dextinity-filled" size="large" aria-label="Dextinity filled" />
            <Icon name="dextinity-filled-color" size="large" aria-label="Dextinity filled in color" />
        </div>
    );
}

async function expectDextinityMarks(canvas: StoryContext["canvas"]) {
    await expectColoredMark(canvas, {
        flatName: "Dextinity",
        flatFile: "dextinity.svg",
        colorName: "Dextinity in color",
        colorFile: "dextinity-color.svg",
    });
    await expectColoredMark(canvas, {
        flatName: "Dextinity filled",
        flatFile: "dextinity-filled.svg",
        colorName: "Dextinity filled in color",
        colorFile: "dextinity-filled-color.svg",
    });
}

async function expectColoredMark(
    canvas: StoryContext["canvas"],
    { flatName, flatFile, colorName, colorFile }: { flatName: string; flatFile: string; colorName: string; colorFile: string },
) {
    const colorMarkElement = canvas.getByRole("img", { name: colorName });
    const flatMark = getComputedStyle(canvas.getByRole("img", { name: flatName }));
    const colorMark = getComputedStyle(colorMarkElement);

    await expect(flatMark.maskImage).toContain(`/${flatFile}`);
    await expect(flatMark.backgroundImage).toBe("none");
    if (window.matchMedia("(forced-colors: active)").matches || colorMarkElement.closest('[data-dextinity-color-scheme="high-contrast"]')) {
        await expect(colorMark.maskImage).toContain(`/${flatFile}`);
        await expect(colorMark.backgroundImage).toBe("none");
        await expect(colorMark.backgroundColor).toBe(colorMark.color);
    } else {
        await expect(colorMark.backgroundImage).toContain(`/${colorFile}`);
        await expect(colorMark.maskImage).toBe("none");
    }
}

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
