import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../Icon";
import { defaultIconNames } from "../iconRegistry";
import colorStyles from "./iconColor.module.scss";
import sizeStyles from "./iconSize.module.scss";

const meta = {
    component: Icon,
    title: "Components/Icon",
    decorators: [themeDecorator],
    args: {
        name: "favorite",
    },
    argTypes: {
        name: {
            control: "select",
            options: Object.keys(defaultIconNames),
        },
        "aria-label": { control: "text" },
        className: { control: false },
    },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

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
 * Set `width` and `height` in CSS, through `className`.
 */
export const Size: Story = {
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
