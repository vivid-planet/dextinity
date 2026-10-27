import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { defaultIcons } from "../defaultIcons";
import { Icon } from "../Icon";

const meta = {
    component: Icon,
    title: "Components/Icon",
    decorators: [themeDecorator],
    args: {
        icon: "favorite",
    },
    argTypes: {
        icon: {
            control: "select",
            options: Object.keys(defaultIcons),
        },
        "aria-label": { control: "text" },
        className: { control: false },
    },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Set `width` and `height` in CSS, through `className`.
 */
export const Size: Story = {
    render: (args) => (
        <>
            <style>{`
                .largeIcon {
                    width: 32px;
                    height: 32px;
                }
            `}</style>
            <Icon {...args} className="largeIcon" />
        </>
    ),
};

/**
 * Set `color` in CSS, on the icon or on its parent.
 */
export const Color: Story = {
    render: (args) => (
        <>
            <style>{`
                .blueText {
                    color: royalblue;
                }
            `}</style>
            <span className="blueText">
                <Icon {...args} />
            </span>
        </>
    ),
};
