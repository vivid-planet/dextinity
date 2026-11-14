import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { EmptyState } from "../EmptyState";
import emptyStateTokens from "../EmptyState.tokens.scss?raw";

const onResetFilters = fn();

const iconOptions = {
    Search: <Icon name="search" />,
    Mail: <Icon name="mail" />,
    Lock: <Icon name="lock" />,
};

const actionOptions = {
    ResetFilters: (
        <Button variant="outlined" color="secondary" size="small" onClick={onResetFilters}>
            Reset filters
        </Button>
    ),
    Create: (
        <Button size="small" startIcon={<Icon name="plus" />}>
            New page
        </Button>
    ),
};

const meta = {
    component: EmptyState,
    title: "Building blocks/Menus & messages/EmptyState",
    decorators: [themeDecorator],
    parameters: { tokens: emptyStateTokens },
    args: {
        title: "No results for “Marketing Lead”",
    },
    argTypes: {
        icon: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        actions: {
            control: "select",
            options: Object.keys(actionOptions),
            mapping: actionOptions,
        },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Says what is going on.
 *
 * **Rules**
 *
 * - Say what is going on, then offer one way forward.
 * - Don't leave an area blank: an empty list explains itself.
 */
export const Default: Story = {};

/**
 * No results: says why, and offers to reset the filters, as in the draft.
 */
export const NoResults: Story = {
    args: {
        icon: <Icon name="search" />,
        description: "Check the spelling or reset the filters.",
        actions: actionOptions.ResetFilters,
    },
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Reset filters" }));
        await waitFor(() => expect(onResetFilters).toHaveBeenCalled());
    },
};

/**
 * Nothing created yet: the way forward creates the first item.
 */
export const NothingYet: Story = {
    args: {
        title: "No pages yet",
        icon: <Icon name="file" />,
        description: "Pages you create appear here.",
        actions: actionOptions.Create,
    },
};

/**
 * `slots.title` sets the heading level that fits the page's outline.
 */
export const TitleElement: Story = {
    args: {
        title: "No access",
        icon: <Icon name="lock" />,
        description: "Ask an administrator for the editor role.",
        slots: { title: "h2" },
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("heading", { level: 2, name: "No access" })).toBeInTheDocument();
    },
};
