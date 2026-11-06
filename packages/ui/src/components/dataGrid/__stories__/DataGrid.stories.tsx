import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { EmptyState } from "../../emptyState/EmptyState";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { Menu } from "../../menu/Menu";
import { MenuItem } from "../../menu/MenuItem";
import { MenuSeparator } from "../../menu/MenuSeparator";
import { Panel } from "../../panel/Panel";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import dataGridTokens from "../_tokens.scss?raw";
import { DataGrid, type DataGridColumn, type DataGridProps, type DataGridSort } from "../DataGrid";
import styles from "./DataGrid.stories.module.scss";

interface Job {
    id: string;
    title: string;
    location: string;
    status: "published" | "unpublished" | "archived";
    applications: number;
}

const titles = ["Senior UX Designer", "Frontend Developer", "Product Owner CMS", "Content Strategist", "DevOps Engineer", "QA Engineer"];
const locations = ["Vienna", "Graz", "Linz", "Salzburg", "Remote"];
const statuses: Job["status"][] = ["published", "published", "unpublished", "published", "archived"];

const allJobs: Job[] = Array.from({ length: 47 }, (_, index) => ({
    id: `job-${index + 1}`,
    title: index < titles.length ? titles[index] : `${titles[index % titles.length]} ${Math.floor(index / titles.length) + 1}`,
    location: locations[index % locations.length],
    status: statuses[index % statuses.length],
    applications: (index * 7) % 31,
}));

const columns: DataGridColumn<Job>[] = [
    { key: "title", header: "Title", sortable: true, render: (job) => <span className={styles.title}>{job.title}</span> },
    { key: "location", header: "Location", sortable: true, priority: "low", render: (job) => <span className={styles.muted}>{job.location}</span> },
    { key: "applications", header: "Applications", align: "end", sortable: true, width: 140, priority: "low" },
    { key: "status", header: "Status", width: 160, render: (job) => <StatusIndicator status={job.status} /> },
];

function RowMenu({ job }: { job: Job }) {
    const [open, setOpen] = useState(false);
    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <IconButton aria-label={`Actions for ${job.title}`} size="small" variant="text">
                    <Icon name="more" />
                </IconButton>
            }
        >
            <MenuItem label="Edit" icon={<Icon name="edit" />} />
            <MenuItem label="Duplicate" icon={<Icon name="copy" />} />
            <MenuSeparator />
            <MenuItem label="Delete" icon={<Icon name="trash" />} color="error" />
        </Menu>
    );
}

function sortJobs(jobs: Job[], sort: DataGridSort | undefined) {
    if (sort == null) {
        return jobs;
    }
    const key = sort.key as keyof Job;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...jobs].sort((a, b) => (a[key] > b[key] ? factor : a[key] < b[key] ? -factor : 0));
}

/** Keeps the story controlled: sorting, selection, and paging update local state; the args set the initial values. */
function ControlledDataGrid(props: DataGridProps<Job>) {
    const [sort, setSort] = useState(props.sort);
    const [selectedIds, setSelectedIds] = useState(props.selectedIds ?? []);
    const [page, setPage] = useState(props.pagination?.page ?? 1);
    const [pageSize, setPageSize] = useState(props.pagination?.pageSize ?? 10);

    const sortedRows = sortJobs(props.rows, sort);
    const rows = props.pagination != null ? sortedRows.slice((page - 1) * pageSize, page * pageSize) : sortedRows;
    const sortedColumn = props.columns.find((column) => column.key === sort?.key);

    return (
        <DataGrid
            {...props}
            rows={rows}
            sort={sort}
            onSortChange={(nextSort) => {
                props.onSortChange?.(nextSort);
                setSort(nextSort);
            }}
            selectedIds={selectedIds}
            onSelectionChange={(ids) => {
                props.onSelectionChange?.(ids);
                setSelectedIds(ids);
            }}
            footer={props.footer ?? (sortedColumn != null ? `Sorted by ${sortedColumn.header.toLowerCase()}` : undefined)}
            pagination={
                props.pagination != null
                    ? {
                          ...props.pagination,
                          page,
                          pageSize,
                          total: props.rows.length,
                          onPageChange: setPage,
                          onPageSizeChange: (nextPageSize) => {
                              setPageSize(nextPageSize);
                              setPage(1);
                          },
                      }
                    : undefined
            }
        />
    );
}

const meta = {
    component: DataGrid,
    title: "Building blocks/Tables & paging/DataGrid",
    decorators: [themeDecorator],
    parameters: { tokens: dataGridTokens },
    args: {
        "aria-label": "Jobs",
        columns,
        rows: allJobs,
        getRowId: (job) => job.id,
        onRowClick: fn(),
        onSortChange: fn(),
        onSelectionChange: fn(),
    },
    argTypes: {
        variant: { control: "radio", options: ["surface", "plain"] },
        columns: { control: false },
        rows: { control: false },
        getRowId: { control: false },
        rowActions: { control: false },
        bulkActions: { control: false },
        pagination: { control: false },
        emptyState: { control: false },
        footer: { control: false },
        className: { control: false },
        slotProps: { control: false },
        labels: { control: false },
        bulkActionLabels: { control: false },
    },
    render: (args) => <ControlledDataGrid {...args} />,
} satisfies Meta<DataGridProps<Job>>;

export default meta;

type Story = StoryObj<DataGridProps<Job>>;

/**
 * A click on a row opens it, the checkbox selects it, and the ⋯ menu holds the row actions. Paging with an adjustable number per page
 * sits below; the bulk action bar appears with the selection.
 *
 * **Rules**
 *
 * - Always keep the status column visible.
 * - Hide columns (`priority: "low"`) on narrow widths instead of scrolling horizontally.
 * - Never offer actions only on hover: the row actions are revealed on focus too.
 * - Remember the page size per table.
 */
export const Default: Story = {
    args: {
        selectable: true,
        selectedIds: ["job-10"],
        sort: { key: "title", direction: "asc" },
        rowActions: (job: Job) => <RowMenu job={job} />,
        bulkActions: [
            { label: "Publish", icon: <Icon name="check" />, onClick: fn() },
            { label: "Archive", icon: <Icon name="archive" />, onClick: fn() },
            { label: "Delete", icon: <Icon name="trash" />, color: "error", onClick: fn() },
        ],
        pagination: { page: 1, pageSize: 10, total: 47, onPageChange: fn() },
    },
};

/**
 * Sortable headers toggle between ascending and descending; the active column shows an arrow.
 */
export const Sorting: Story = {
    args: {
        sort: { key: "title", direction: "asc" },
    },
    play: async ({ args, canvas }) => {
        const titleHeader = canvas.getByRole("columnheader", { name: /Title/ });
        await expect(titleHeader).toHaveAttribute("aria-sort", "ascending");

        await userEvent.click(within(titleHeader).getByRole("button"));
        await waitFor(() => expect(args.onSortChange).toHaveBeenLastCalledWith({ key: "title", direction: "desc" }));
        await expect(titleHeader).toHaveAttribute("aria-sort", "descending");

        await userEvent.click(canvas.getByRole("button", { name: /Location/ }));
        await waitFor(() => expect(args.onSortChange).toHaveBeenLastCalledWith({ key: "location", direction: "asc" }));
        await expect(titleHeader).not.toHaveAttribute("aria-sort");
    },
};

/**
 * The header checkbox selects all rows of the page and shows a dash while only some are selected. Escape clears the selection.
 */
export const Selection: Story = {
    args: {
        rows: allJobs.slice(0, 5),
        selectable: true,
        bulkActions: [{ label: "Archive", icon: <Icon name="archive" />, onClick: fn() }],
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("checkbox", { name: "Select Frontend Developer" }));
        await waitFor(() => expect(args.onSelectionChange).toHaveBeenLastCalledWith(["job-2"]));
        await expect(args.onRowClick).not.toHaveBeenCalled();

        const selectAll = canvas.getByRole("checkbox", { name: "Select all" });
        await expect(selectAll).toHaveAttribute("aria-checked", "mixed");
        await expect(canvas.getByRole("toolbar", { name: "Bulk actions" })).toHaveAttribute("data-open");
        await expect(canvas.getByText("1 selected")).toBeInTheDocument();

        await userEvent.click(selectAll);
        await waitFor(() => expect(args.onSelectionChange).toHaveBeenLastCalledWith(["job-1", "job-2", "job-3", "job-4", "job-5"]));
        await expect(selectAll).toHaveAttribute("aria-checked", "true");

        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(args.onSelectionChange).toHaveBeenLastCalledWith([]));
    },
};

/**
 * With `onRowClick`, rows are focusable and open on Enter; the row actions appear on focus.
 */
export const RowClick: Story = {
    args: {
        rows: allJobs.slice(0, 5),
        rowActions: (job: Job) => <RowMenu job={job} />,
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByText("DevOps Engineer"));
        await waitFor(() => expect(args.onRowClick).toHaveBeenLastCalledWith(allJobs[4]));

        await userEvent.tab();
        await expect(canvas.getByRole("button", { name: "Actions for DevOps Engineer" })).toHaveFocus();
        await userEvent.tab({ shift: true });
        await userEvent.tab({ shift: true });
        await userEvent.tab({ shift: true });
        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(args.onRowClick).toHaveBeenLastCalledWith(allJobs[3]));
    },
};

/**
 * Placeholder rows hold the layout while the rows load; the table is marked busy.
 */
export const Loading: Story = {
    args: {
        rows: [],
        selectable: true,
        loading: true,
    },
};

/**
 * Without rows, `emptyState` says why and offers a way back.
 */
export const Empty: Story = {
    args: {
        rows: [],
        emptyState: (
            <EmptyState
                icon={<Icon name="search" />}
                title="No jobs match these filters"
                description="Try other filters or reset them."
                actions={
                    <Button variant="outlined" size="small">
                        Reset filters
                    </Button>
                }
            />
        ),
    },
};

/**
 * With `stickyHeader`, the header stays visible while the rows scroll in a grid with a fixed height.
 */
export const StickyHeader: Story = {
    args: {
        stickyHeader: true,
        className: styles.fixedHeight,
    },
};

/**
 * A grid that already sits inside a `Panel` or `Card` uses `variant="plain"`, so it doesn't stack a second panel on the first.
 */
export const InsidePanel: Story = {
    args: {
        variant: "plain",
        rows: allJobs.slice(0, 5),
    },
    render: (args) => (
        <Panel title="Open jobs" description="The latest jobs of this location.">
            <ControlledDataGrid {...args} />
        </Panel>
    ),
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("table", { name: "Jobs" }).closest("[data-variant]")).toHaveAttribute("data-variant", "plain");
    },
};
