import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Avatar } from "../../avatar/Avatar";
import { Icon } from "../../icon/Icon";
import { Menu } from "../../menu/Menu";
import { MenuRadioGroup } from "../../menu/MenuRadioGroup";
import { MenuRadioItem } from "../../menu/MenuRadioItem";
import { StatusIndicator, type StatusIndicatorStatus } from "../../statusIndicator/StatusIndicator";
import { FilterChip, type FilterChipProps } from "../FilterChip";
import filterChipTokens from "../FilterChip.tokens.scss?raw";
import styles from "./FilterChip.stories.module.scss";

/** Keeps the story controlled: clicking toggles the local state; the `selected` arg sets the initial state. */
function ControlledFilterChip(props: FilterChipProps) {
    const [selected, setSelected] = useState(props.selected);
    return (
        <FilterChip
            {...props}
            selected={selected}
            onClick={(event) => {
                props.onClick(event);
                setSelected((current) => !current);
            }}
        />
    );
}

const statusFilters: Array<{ value: "all" | StatusIndicatorStatus; label: string; count: number }> = [
    { value: "all", label: "All", count: 12 },
    { value: "published", label: "Published", count: 8 },
    { value: "unpublished", label: "Unpublished", count: 3 },
    { value: "archived", label: "Archived", count: 1 },
];

/** One active filter at a time: choosing a chip deselects the others. */
function StatusFilterToolbar(props: Pick<FilterChipProps, "onClick">) {
    const [filter, setFilter] = useState<(typeof statusFilters)[number]["value"]>("all");
    return (
        <div className={styles.toolbar}>
            {statusFilters.map(({ value, label, count }) => (
                <FilterChip
                    key={value}
                    selected={filter === value}
                    startAdornment={value === "all" ? undefined : <StatusIndicator status={value} decorative />}
                    count={count}
                    onClick={(event) => {
                        props.onClick(event);
                        setFilter(value);
                    }}
                >
                    {label}
                </FilterChip>
            ))}
        </div>
    );
}

const authors = ["Anna Berger", "Lukas Huber", "Sophie Wagner"];

/** The chip is the menu's trigger; picking an author activates the filter and shows the name on the chip. */
function AuthorFilter(props: Pick<FilterChipProps, "onClick">) {
    const [open, setOpen] = useState(false);
    const [author, setAuthor] = useState("");
    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            trigger={
                <FilterChip selected={author !== ""} hasMenu onClick={props.onClick}>
                    {author === "" ? "Author" : author}
                </FilterChip>
            }
        >
            <MenuRadioGroup
                value={author}
                onChange={(nextAuthor) => {
                    setAuthor(nextAuthor);
                    setOpen(false);
                }}
            >
                {authors.map((name) => (
                    <MenuRadioItem key={name} value={name} label={name} />
                ))}
            </MenuRadioGroup>
        </Menu>
    );
}

const adornmentOptions = {
    none: undefined,
    "Status dot": <StatusIndicator status="published" decorative />,
    "Calendar icon": <Icon name="calendar" />,
    "Globe icon": <Icon name="globe" />,
    Avatar: <Avatar name="Anna Berger" size="small" tooltip={false} aria-hidden />,
};

const meta = {
    component: FilterChip,
    title: "Building blocks/Selection & toggles/FilterChip",
    decorators: [themeDecorator],
    parameters: { tokens: filterChipTokens },
    args: {
        children: "Published",
        selected: false,
        onClick: fn(),
    },
    argTypes: {
        startAdornment: { control: "select", options: Object.keys(adornmentOptions), mapping: adornmentOptions },
        endAdornment: { control: "select", options: Object.keys(adornmentOptions), mapping: adornmentOptions },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledFilterChip {...args} />,
} satisfies Meta<typeof FilterChip>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Always controlled: `selected` + `onClick`.
 * - Show the count of matching items so the effect of a filter is visible before choosing it.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const chip = canvas.getByRole("button", { name: "Published" });
        await userEvent.click(chip);
        await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(1));
        await expect(chip).toHaveAttribute("aria-pressed", "true");
    },
};

export const Selected: Story = {
    args: { selected: true },
};

export const WithCount: Story = {
    args: { count: 8 },
};

/**
 * For filters by status, a decorative status dot precedes the label. The label names the status, so the dot stays hidden from
 * assistive technology.
 */
export const WithStatusDot: Story = {
    args: { startAdornment: "Status dot", count: 8 },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("button", { name: "Published 8" })).toBeVisible();
    },
};

/**
 * An icon before the label hints at the kind of filter.
 */
export const WithIcon: Story = {
    args: { children: "This week", startAdornment: "Calendar icon", count: 5 },
};

/**
 * For filters by person, the person's avatar precedes the name. Hide the avatar from assistive technology and turn off its tooltip,
 * since the label already shows the name.
 */
export const WithAvatar: Story = {
    args: {
        children: "Anna Berger",
        startAdornment: "Avatar",
        count: 4,
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("button", { name: "Anna Berger 4" })).toBeVisible();
    },
};

/**
 * Content after the label, before the count and the chevron.
 */
export const WithEndAdornment: Story = {
    args: { children: "Shared", endAdornment: "Globe icon", count: 2 },
};

/**
 * A chevron marks a chip that opens a menu to pick the filter's value, e.g. an author. Render the chip as the menu's trigger.
 */
export const WithMenu: Story = {
    parameters: { popupRoom: { side: "below", minHeight: "180px" } },
    args: { children: "Author", hasMenu: true },
    render: (args) => <AuthorFilter onClick={args.onClick} />,
    play: async ({ args, canvas }) => {
        const chip = canvas.getByRole("button", { name: "Author" });
        await expect(chip).toHaveAttribute("aria-haspopup", "menu");
        await userEvent.click(chip);
        await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(1));
        await userEvent.click(await screen.findByRole("menuitemradio", { name: "Lukas Huber" }));
        await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
        await expect(canvas.getByRole("button", { name: "Lukas Huber" })).toHaveAttribute("aria-pressed", "true");
    },
};

export const Disabled: Story = {
    args: { disabled: true, count: 0 },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button"));
        await expect(args.onClick).not.toHaveBeenCalled();
    },
};

/**
 * Quick filters above a list, one active at a time.
 */
export const Toolbar: Story = {
    render: (args) => <StatusFilterToolbar onClick={args.onClick} />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Unpublished 3" }));
        await expect(canvas.getByRole("button", { name: "Unpublished 3" })).toHaveAttribute("aria-pressed", "true");
        await expect(canvas.getByRole("button", { name: "All 12" })).toHaveAttribute("aria-pressed", "false");
    },
};
