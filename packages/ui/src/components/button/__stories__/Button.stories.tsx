import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Spec, SpecGrid } from "../../../storybook/docs/SpecGrid";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { Button } from "../Button";
import buttonTokens from "../Button.tokens.scss?raw";

const iconOptions = {
    Favorite: <Icon name="favorite" />,
    Check: <Icon name="check" />,
    ArrowRight: <Icon name="arrow-right" />,
    Trash: <Icon name="delete" />,
};

const meta = {
    component: Button,
    title: "Building blocks/Buttons/Button",
    decorators: [themeDecorator],
    parameters: {
        docs: { description: { component: "Trigger actions. One primary action per area, everything else secondary or ghost." } },
        tokens: buttonTokens,
        rules: {
            do: [
                "Label with a verb that names the action: Save, Publish.",
                "One primary button per area; everything else is secondary or ghost.",
                "Show loading for long actions; the button stays in place.",
            ],
            dont: [
                "Two primary buttons next to each other.",
                "A disabled button without saying why; show the failed check instead.",
                '"OK" or "Yes" as the label.',
            ],
        },
    },
    args: {
        children: "Button",
        onClick: fn(),
    },
    argTypes: {
        variant: {
            control: "radio",
            options: ["contained", "outlined", "text"],
        },
        color: {
            control: "select",
            options: ["primary", "secondary", "error", "success"],
        },
        size: {
            control: "radio",
            options: ["default", "small"],
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

export const Variants: Story = {
    render: (args) => (
        <SpecGrid>
            <Spec label="Primary" note="One per area">
                <Button {...args} startIcon={<Icon name="check" />}>
                    Save
                </Button>
            </Spec>
            <Spec label="Secondary" note="More actions">
                <Button {...args} variant="outlined" color="secondary">
                    Preview
                </Button>
            </Spec>
            <Spec label="Ghost" note="Quiet actions">
                <Button {...args} variant="text" color="secondary">
                    Cancel
                </Button>
            </Spec>
            <Spec label="Danger" note="Destructive actions">
                <Button {...args} variant="outlined" color="error" startIcon={<Icon name="delete" />}>
                    Delete
                </Button>
            </Spec>
            <Spec label="Small" note="In rows and panels">
                <Button {...args} variant="outlined" color="secondary" size="small">
                    Change
                </Button>
            </Spec>
        </SpecGrid>
    ),
};

function renderStates(
    args: Story["args"],
    { label, variant, color, idPrefix }: { label: string; variant?: "outlined"; color?: "secondary"; idPrefix: string },
) {
    const props = { ...args, variant, color };
    return (
        <SpecGrid>
            <Spec label="Standard">
                <Button {...props}>{label}</Button>
            </Spec>
            <Spec label="Hover">
                <Button {...props} id={`${idPrefix}-hover`}>
                    {label}
                </Button>
            </Spec>
            <Spec label="Focus">
                <Button {...props} id={`${idPrefix}-focus`}>
                    {label}
                </Button>
            </Spec>
            <Spec label="Pressed">
                <Button {...props} id={`${idPrefix}-pressed`}>
                    {label}
                </Button>
            </Spec>
            <Spec label="Disabled">
                <Button {...props} disabled>
                    {label}
                </Button>
            </Spec>
            <Spec label="Loading">
                <Button {...props} loading startIcon={<Icon name="check" />}>
                    {label}
                </Button>
            </Spec>
        </SpecGrid>
    );
}

function pseudoStates(idPrefix: string) {
    return { hover: [`#${idPrefix}-hover`], focusVisible: [`#${idPrefix}-focus`], active: [`#${idPrefix}-pressed`] };
}

export const StatesPrimary: Story = {
    name: "States · Primary",
    parameters: { pseudo: pseudoStates("primary") },
    render: (args) => renderStates(args, { label: "Save", idPrefix: "primary" }),
};

export const StatesSecondary: Story = {
    name: "States · Secondary",
    parameters: { pseudo: pseudoStates("secondary") },
    render: (args) => renderStates(args, { label: "Preview", variant: "outlined", color: "secondary", idPrefix: "secondary" }),
};

/**
 * With `href`, the button renders as a link.
 */
export const AsLink: Story = {
    name: "As link",
    args: {
        href: "#",
        variant: "outlined",
        color: "secondary",
        endIcon: <Icon name="open-new-tab" />,
    },
};
