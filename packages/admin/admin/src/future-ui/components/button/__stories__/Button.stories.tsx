import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ArrowRightIcon } from "../../../icons/ArrowRightIcon";
import { FavoriteIcon } from "../../../icons/FavoriteIcon";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../Button";

const iconOptions = {
    Favorite: <FavoriteIcon />,
    ArrowRight: <ArrowRightIcon />,
};

const meta = {
    component: Button,
    title: "Future UI/Button",
    decorators: [themeDecorator],
    args: {
        children: "Button",
        onClick: fn(),
    },
    argTypes: {
        variant: {
            control: "radio",
            options: ["primary", "secondary"],
        },
        startIcon: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        endIcon: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
    args: {
        variant: "secondary",
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

/**
 * `startIcon` and `endIcon` accept any `ReactNode`.
 */
export const WithIcons: Story = {
    render: () => (
        <div style={{ display: "flex", gap: "1rem" }}>
            <Button startIcon={<FavoriteIcon />}>Start only</Button>
            <Button endIcon={<ArrowRightIcon />}>End only</Button>
            <Button startIcon={<FavoriteIcon />} endIcon={<ArrowRightIcon />}>
                Both
            </Button>
        </div>
    ),
};
