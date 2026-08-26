import { ArrowRight, Favorite } from "@dextinity/admin-icons";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { figmaDesign } from "../../../storybook/figmaDesign";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../Button";

const iconOptions = {
    Favorite: <Favorite />,
    ArrowRight: <ArrowRight />,
};

const meta = {
    component: Button,
    title: "Future UI/Button",
    decorators: [themeDecorator],
    parameters: {
        design: figmaDesign({ nodeId: "25-2" }),
    },
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
            <Button startIcon={<Favorite />}>Start only</Button>
            <Button endIcon={<ArrowRight />}>End only</Button>
            <Button startIcon={<Favorite />} endIcon={<ArrowRight />}>
                Both
            </Button>
        </div>
    ),
};
