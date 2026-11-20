import { MainContent, MasterLayout } from "@dextinity/admin";
import { Typography } from "@mui/material";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Header } from "../../common/header/Header";
import { CommandPaletteSearch } from "./CommandPaletteSearch";

const EmptyMenu = () => null;

const renderInMasterLayout: Decorator = (Story) => (
    <MasterLayout headerComponent={Story} menuComponent={EmptyMenu}>
        <MainContent>
            <Typography>Open the search with ⌘K / Ctrl+K and try “unternehmen”, “karriere”, “e-bike” or “xyz”.</Typography>
        </MainContent>
    </MasterLayout>
);

const meta: Meta<typeof CommandPaletteSearch> = {
    component: CommandPaletteSearch,
    title: "fullTextSearch/CommandPaletteSearch",
    decorators: [renderInMasterLayout],
    args: { onSelectResult: fn(), onQuickAction: fn() },
    parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof CommandPaletteSearch>;

/**
 * Prototype of the full-text search in the admin header. The gear next to the type tabs chooses which types are
 * searched. The chips on the right use mock data, the API doesn't return this information yet.
 */
export const Default: Story = {
    render: (args) => (
        <Header>
            <CommandPaletteSearch {...args} />
        </Header>
    ),
};
