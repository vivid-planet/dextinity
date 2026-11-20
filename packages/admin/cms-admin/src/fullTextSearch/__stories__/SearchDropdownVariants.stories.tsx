import { MainContent, MasterLayout } from "@dextinity/admin";
import { Stack, Typography } from "@mui/material";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Header } from "../../common/header/Header";
import { CommandPaletteSearch } from "./variants/CommandPaletteSearch";
import { CompactSearchDropdown } from "./variants/CompactSearchDropdown";
import { GroupedSearchDropdown } from "./variants/GroupedSearchDropdown";

const EmptyMenu = () => null;

const renderInMasterLayout: Decorator = (Story) => (
    <MasterLayout headerComponent={Story} menuComponent={EmptyMenu}>
        <MainContent>
            <Stack spacing={2}>
                <Typography variant="h4">Full-text search prototypes</Typography>
                <Typography>
                    Try “karriere”, “e-bike”, “unternehmen” (many results) or “xyz” (no results). Focus the search with ⌘K / Ctrl+K and navigate with
                    the arrow keys. Opened results and search terms appear under “Recent” when the input is empty.
                </Typography>
            </Stack>
        </MainContent>
    </MasterLayout>
);

const meta: Meta = {
    title: "fullTextSearch/Search Dropdown Variants",
    decorators: [renderInMasterLayout],
    args: { onSelectResult: fn() },
    parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<{ onSelectResult: () => void }>;

/** Results grouped by entity type. Rows show the name and one line of context, the type is in the group heading. */
export const A_Grouped: Story = {
    name: "A · Grouped by type",
    render: ({ onSelectResult }) => (
        <Header>
            <GroupedSearchDropdown onSelectResult={onSelectResult} />
        </Header>
    ),
};

/** One dense line per result in relevance order: icon, name, context, type label. */
export const B_Compact: Story = {
    name: "B · Compact list",
    render: ({ onSelectResult }) => (
        <Header>
            <CompactSearchDropdown onSelectResult={onSelectResult} />
        </Header>
    ),
};

/** A trigger in the header that opens a centered command palette. */
export const C_CommandPalette: Story = {
    name: "C · Command palette",
    render: ({ onSelectResult }) => (
        <Header>
            <CommandPaletteSearch onSelectResult={onSelectResult} />
        </Header>
    ),
};
