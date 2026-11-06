import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import chipTokens from "../_tokens.scss?raw";
import { Chip, type ChipProps } from "../Chip";
import styles from "./Chip.stories.module.scss";

const iconOptions = {
    Globe: <Icon name="domain" />,
    Sparkle: <Icon name="artificial-intelligence" />,
    Clock: <Icon name="time" />,
};

const colors = ["default", "primary", "secondary", "error", "info", "success", "warning"] as const;

const meta = {
    component: Chip,
    title: "Building blocks/Status, tags & badges/Chip",
    decorators: [themeDecorator],
    parameters: { tokens: chipTokens },
    args: {
        children: "Flextime",
    },
    argTypes: {
        variant: {
            control: "radio",
            options: ["filled", "outlined"],
        },
        color: {
            control: "select",
            options: colors,
        },
        size: {
            control: "radio",
            options: ["default", "small"],
        },
        icon: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        avatar: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - One line of text; keep labels short.
 * - Use color only where it carries meaning, e.g. `info` for values set automatically.
 */
export const Default: Story = {};

export const Outlined: Story = {
    args: {
        variant: "outlined",
    },
};

/**
 * Every color channel, filled and outlined.
 */
export const Colors: Story = {
    render: (args) => (
        <div className={styles.grid}>
            {colors.map((color) => (
                <Chip key={color} {...args} color={color}>
                    {color}
                </Chip>
            ))}
            {colors.map((color) => (
                <Chip key={color} {...args} variant="outlined" color={color}>
                    {color}
                </Chip>
            ))}
        </div>
    ),
};

/**
 * In rows and cards, e.g. to tell manual from automatic values.
 */
export const Small: Story = {
    render: (args) => (
        <div className={styles.row}>
            <Chip {...args} size="small" variant="outlined">
                Manual
            </Chip>
            <Chip {...args} size="small" color="info">
                Automatic
            </Chip>
        </div>
    ),
};

export const WithIcon: Story = {
    args: {
        icon: <Icon name="domain" />,
        children: "Austria",
    },
};

/**
 * With `onDelete`, a delete button removes the tag; Backspace or Delete on the focused chip works too.
 */
export const Removable: Story = {
    args: {
        onDelete: fn(),
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Remove" }));
        await expect(args.onDelete).toHaveBeenCalledOnce();
    },
};

/**
 * With `onClick`, the whole chip is a button.
 */
export const Clickable: Story = {
    args: {
        onClick: fn(),
        variant: "outlined",
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Flextime" }));
        await expect(args.onClick).toHaveBeenCalledOnce();
    },
};

function FilterChips(args: ChipProps) {
    const [selected, setSelected] = useState<string[]>(["Published"]);
    return (
        <div className={styles.row}>
            {["Published", "Unpublished", "Archived"].map((filter) => (
                <Chip
                    key={filter}
                    {...args}
                    variant="outlined"
                    selected={selected.includes(filter)}
                    onClick={() =>
                        setSelected((current) => (current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]))
                    }
                >
                    {filter}
                </Chip>
            ))}
        </div>
    );
}

/**
 * With `selected`, a clickable chip is a toggle, e.g. a quick filter above a list.
 */
export const Selectable: Story = {
    render: (args) => <FilterChips {...args} />,
    play: async ({ canvas }) => {
        const archived = canvas.getByRole("button", { name: "Archived" });
        await expect(archived).toHaveAttribute("aria-pressed", "false");
        await userEvent.click(archived);
        await expect(archived).toHaveAttribute("aria-pressed", "true");
    },
};

function RemovableTags(args: ChipProps) {
    const [tags, setTags] = useState(["Flextime", "Remote", "Part-time"]);
    return (
        <div className={styles.row}>
            {tags.map((tag) => (
                <Chip key={tag} {...args} onDelete={() => setTags((current) => current.filter((item) => item !== tag))}>
                    {tag}
                </Chip>
            ))}
        </div>
    );
}

/**
 * Clickable and removable at once: Backspace on the focused chip removes it.
 */
export const KeyboardRemove: Story = {
    render: (args) => <RemovableTags {...args} onClick={fn()} />,
    play: async ({ canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("button", { name: "Flextime" })).toHaveFocus();
        await userEvent.keyboard("{Backspace}");
        await expect(canvas.queryByText("Flextime")).toBeNull();
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        onDelete: fn(),
    },
};
