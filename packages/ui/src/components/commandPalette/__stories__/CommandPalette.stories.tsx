import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { CommandPalette, type CommandPaletteGroup, type CommandPaletteProps } from "../CommandPalette";
import commandPaletteTokens from "../CommandPalette.tokens.scss?raw";
import styles from "./CommandPalette.stories.module.scss";

const openJobAds = fn();

const groups: CommandPaletteGroup[] = [
    {
        label: "Jump to",
        items: [
            { id: "dashboard", label: "Overview", icon: <Icon name="dashboard" />, onSelect: fn() },
            { id: "page-tree", label: "Page tree", icon: <Icon name="file" />, keywords: ["website", "sitemap"], onSelect: fn() },
            { id: "job-ads", label: "Job ads", icon: <Icon name="list" />, keywords: ["careers", "jobs"], onSelect: openJobAds },
            { id: "assets", label: "Assets", icon: <Icon name="image" />, keywords: ["images", "files"], onSelect: fn() },
        ],
    },
    {
        label: "Create",
        items: [
            { id: "new-page", label: "New page under Careers", icon: <Icon name="plus" />, onSelect: fn() },
            { id: "new-job-ad", label: "New job ad", icon: <Icon name="plus" />, shortcut: "⌘N", onSelect: fn() },
        ],
    },
    {
        label: "Commands",
        items: [
            { id: "nav", label: "Collapse navigation", icon: <Icon name="pin-left" />, shortcut: "⌘\\", onSelect: fn() },
            { id: "dark", label: "Switch to dark theme", icon: <Icon name="moon" />, keywords: ["color scheme"], onSelect: fn() },
        ],
    },
];

function ControlledCommandPalette(props: CommandPaletteProps) {
    const [open, setOpen] = useState(props.open);
    const [query, setQuery] = useState(props.query);
    return (
        <>
            <Button variant="outlined" color="secondary" startIcon={<Icon name="search" />} onClick={() => setOpen(true)}>
                Open command palette
            </Button>
            <CommandPalette
                {...props}
                open={open}
                onOpenChange={(nextOpen) => {
                    setOpen(nextOpen);
                    if (!nextOpen) {
                        setQuery("");
                    }
                    props.onOpenChange(nextOpen);
                }}
                query={query}
                onQueryChange={(nextQuery) => {
                    setQuery(nextQuery);
                    props.onQueryChange(nextQuery);
                }}
            />
        </>
    );
}

const meta = {
    component: CommandPalette,
    title: "Shell/Search & commands/CommandPalette",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: commandPaletteTokens, closedOnDocsPage: true },
    render: (args) => <ControlledCommandPalette {...args} />,
    args: {
        open: false,
        onOpenChange: fn(),
        query: "",
        onQueryChange: fn(),
        groups,
    },
    argTypes: {
        filter: { control: "boolean" },
        disableGlobalShortcut: { control: "boolean" },
        groups: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof CommandPalette>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * ⌘K opens the palette with the focus in the search field. Arrow keys choose an entry, Enter runs it, Escape closes.
 *
 * **Rules**
 *
 * - Every feature is reachable through ⌘K.
 * - Create commands name their target: "New page under Careers".
 * - Show a command's keyboard shortcut whenever there is one.
 * - Don't let results jump around after the palette opens.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Open command palette" }));
        const input = await screen.findByRole("combobox", { name: "Search, jump, create …" });
        await waitFor(() => expect(input).toHaveFocus());
        await userEvent.type(input, "jo");
        await waitFor(() => expect(args.onQueryChange).toHaveBeenLastCalledWith("jo"));
        const options = screen.getAllByRole("option");
        await expect(options.map((option) => option.textContent)).toStrictEqual(["Job ads", "New job ad⌘N"]);
        await expect(options[0]).toHaveAttribute("aria-selected", "true");
        await userEvent.keyboard("{ArrowDown}");
        await expect(options[1]).toHaveAttribute("aria-selected", "true");
        await userEvent.keyboard("{ArrowUp}{Enter}");
        await waitFor(() => expect(openJobAds).toHaveBeenCalled());
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
    },
};

/**
 * ⌘K or Ctrl+K toggles the palette from anywhere in the app.
 */
export const GlobalShortcut: Story = {
    play: async ({ args }) => {
        await userEvent.keyboard("{Control>}k{/Control}");
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(true));
        await screen.findByRole("combobox");
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
    },
};

export const Open: Story = {
    args: {
        open: true,
    },
};

export const Filtered: Story = {
    args: {
        open: true,
        query: "new",
    },
};

export const NoResults: Story = {
    args: {
        open: true,
        query: "invoice",
    },
};
