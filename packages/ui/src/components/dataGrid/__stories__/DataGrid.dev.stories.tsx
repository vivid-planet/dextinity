import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { DataGrid, type DataGridColumn, type DataGridProps } from "../DataGrid";
import styles from "./DataGrid.dev.stories.module.scss";

interface Contact {
    id: string;
    name: string;
    email: string;
    company: string;
}

const contacts: Contact[] = Array.from({ length: 3 }, (_, index) => ({
    id: `contact-${index + 1}`,
    name: `Contact ${index + 1}`,
    email: `contact-${index + 1}@example.com`,
    company: "Example Company",
}));

const wideColumns: DataGridColumn<Contact>[] = [
    { key: "name", header: "Name", render: (contact) => <span className={styles.wideCell}>{contact.name}</span> },
    { key: "email", header: "Email", render: (contact) => <span className={styles.wideCell}>{contact.email}</span> },
    { key: "company", header: "Company", render: (contact) => <span className={styles.wideCell}>{contact.company}</span> },
];

const meta = {
    component: DataGrid,
    title: "Building blocks/Tables & paging/DataGrid",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
    args: {
        "aria-label": "Contacts",
        columns: wideColumns,
        rows: contacts,
        getRowId: (contact) => contact.id,
        rowActions: (contact) => (
            <IconButton color="secondary" aria-label={`Actions for ${contact.name}`} size="small" variant="text">
                <Icon name="more-horizontal" />
            </IconButton>
        ),
    },
} satisfies Meta<DataGridProps<Contact>>;

export default meta;

type Story = StoryObj<DataGridProps<Contact>>;

/**
 * A table wider than the grid scrolls inside the grid; the page itself never scrolls sideways.
 */
export const WiderThanViewport: Story = {
    play: async ({ canvasElement }) => {
        const scroller = within(canvasElement).getByRole("table").parentElement;
        expect(scroller?.scrollWidth).toBeGreaterThan(scroller?.clientWidth ?? 0);
        const page = canvasElement.ownerDocument.documentElement;
        expect(page.scrollWidth).toBe(page.clientWidth);
    },
};
