import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { EmptyState } from "../../emptyState/EmptyState";
import { Icon } from "../../icon/Icon";
import type { IconName } from "../../icon/iconRegistry";
import { IconButton } from "../../iconButton/IconButton";
import { Menu } from "../../menu/Menu";
import { MenuItem } from "../../menu/MenuItem";
import { MenuSeparator } from "../../menu/MenuSeparator";
import { Panel } from "../../panel/Panel";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { DataGrid, type DataGridColumn, type DataGridColumnVisibility, type DataGridProps, type DataGridSort } from "../DataGrid";
import dataGridTokens from "../DataGrid.tokens.scss?raw";
import { DataGridColumnsMenu } from "../DataGridColumnsMenu";
import { downloadDataGridCsv } from "../dataGridCsv";
import styles from "./DataGrid.stories.module.scss";

interface Job {
    id: string;
    title: string;
    location: string;
    status: "published" | "unpublished" | "archived";
    applications: number;
    featured: boolean;
    openings?: Job[];
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
    featured: index % 4 === 0,
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
                <IconButton color="secondary" aria-label={`Actions for ${job.title}`} size="small" variant="text">
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            <MenuItem label="Edit" icon={<Icon name="edit" />} />
            <MenuItem label="Duplicate" icon={<Icon name="copy" />} />
            <MenuSeparator />
            <MenuItem label="Delete" icon={<Icon name="delete" />} color="error" />
        </Menu>
    );
}

function sortJobs(jobs: Job[], sort: DataGridSort | undefined) {
    if (sort == null) {
        return jobs;
    }
    const key = sort.key as "title" | "location" | "applications" | "status";
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...jobs].sort((a, b) => (a[key] > b[key] ? factor : a[key] < b[key] ? -factor : 0));
}

function moveItem<Item>(items: Item[], fromIndex: number, toIndex: number) {
    const next = [...items];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
}

/**
 * Keeps the story controlled: sorting, selection, paging, edits, order, expansion, and column visibility update local state; the
 * args set the initial values.
 */
function ControlledDataGrid(props: DataGridProps<Job>) {
    const [allRows, setAllRows] = useState(props.rows);
    const [sort, setSort] = useState(props.sort);
    const [selectedIds, setSelectedIds] = useState(props.selectedIds ?? []);
    const [expandedRowIds, setExpandedRowIds] = useState(props.expandedRowIds ?? []);
    const [columnVisibility, setColumnVisibility] = useState<DataGridColumnVisibility>(props.columnVisibility ?? {});
    const [page, setPage] = useState(props.pagination?.page ?? 1);
    const [pageSize, setPageSize] = useState(props.pagination?.pageSize ?? 10);

    const sortedRows = sortJobs(allRows, sort);
    const pageOffset = props.pagination != null ? (page - 1) * pageSize : 0;
    const rows = props.pagination != null ? sortedRows.slice(pageOffset, pageOffset + pageSize) : sortedRows;
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
            onRowChange={
                props.onRowChange != null
                    ? (row, change) => {
                          props.onRowChange?.(row, change);
                          setAllRows((current) => current.map((job) => (job.id === change.rowId ? row : job)));
                      }
                    : undefined
            }
            onRowReorder={
                props.onRowReorder != null
                    ? (fromIndex, toIndex) => {
                          props.onRowReorder?.(fromIndex, toIndex);
                          setAllRows((current) => moveItem(current, pageOffset + fromIndex, pageOffset + toIndex));
                      }
                    : undefined
            }
            expandedRowIds={expandedRowIds}
            onExpandedRowIdsChange={(ids) => {
                props.onExpandedRowIdsChange?.(ids);
                setExpandedRowIds(ids);
            }}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={
                props.onColumnVisibilityChange != null
                    ? (visibility) => {
                          props.onColumnVisibilityChange?.(visibility);
                          setColumnVisibility(visibility);
                      }
                    : undefined
            }
            footer={props.footer ?? (sortedColumn != null ? `Sorted by ${sortedColumn.header.toLowerCase()}` : undefined)}
            pagination={
                props.pagination != null
                    ? {
                          ...props.pagination,
                          page,
                          pageSize,
                          total: allRows.length,
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
        onExpandedRowIdsChange: fn(),
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
        columnVisibility: { control: false },
        expandedRowIds: { control: false },
        getSubRows: { control: false },
        renderRowDetail: { control: false },
        isRowExpandable: { control: false },
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
            { label: "Delete", icon: <Icon name="delete" />, color: "error", onClick: fn() },
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
 * With `activeRowId`, the row whose details are open next to the grid, e.g. in a side panel, stays marked while the list is used.
 */
export const ActiveRow: Story = {
    args: {
        rows: allJobs.slice(0, 5),
        activeRowId: allJobs[1].id,
    },
    play: async ({ canvas }) => {
        const activeRow = canvas.getByText(allJobs[1].title).closest("tr");
        await expect(activeRow).toHaveAttribute("aria-current", "true");
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

const locationOptions = locations.map((location) => ({ value: location, label: location }));

const editableColumns: DataGridColumn<Job>[] = [
    { key: "title", header: "Title", editable: true, hideable: false },
    { key: "location", header: "Location", editable: true, editor: { type: "select", options: locationOptions }, width: 160 },
    { key: "applications", header: "Applications", align: "end", editable: true, editor: { type: "number", min: 0 }, width: 140 },
    { key: "featured", header: "Featured", editable: true, editor: { type: "checkbox" }, width: 110 },
    { key: "status", header: "Status", width: 160, render: (job) => <StatusIndicator status={job.status} /> },
];

function closestOf(element: HTMLElement, selector: string) {
    const match = element.closest<HTMLElement>(selector);
    if (match == null) {
        throw new Error(`No ${selector} around the element`);
    }
    return match;
}

function cellOf(canvasElement: HTMLElement, text: string) {
    return closestOf(within(canvasElement).getByText(text), "td");
}

/**
 * Editable columns edit right in the cell. Click a cell or move to it with the arrow keys, then press Enter, F2, or just type;
 * Enter saves and moves down, Tab saves and edits the next cell, Escape discards. A double click opens the editor too. `select`
 * opens its options, `checkbox` switches with Space or a click, and `custom` takes any editor, e.g. a rich text field.
 *
 * **Rules**
 *
 * - Save each edit right away (`onRowChange`), and show failures at the cell's row.
 * - Keep columns that open a detail view (`onRowClick`) separate from editable grids: a click on an editable cell selects it.
 */
export const InlineEditing: Story = {
    args: {
        columns: editableColumns,
        rows: allJobs.slice(0, 5),
        onRowClick: undefined,
        onCellChange: fn(),
        onRowChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        await userEvent.click(cellOf(canvasElement, "Senior UX Designer"));
        await expect(cellOf(canvasElement, "Senior UX Designer")).toHaveFocus();

        await userEvent.keyboard("{Enter}");
        const editor = within(canvasElement).getByRole("textbox", { name: "Title" });
        await expect(editor).toHaveFocus();
        await expect(editor).toHaveValue("Senior UX Designer");
        await userEvent.clear(editor);
        await userEvent.type(editor, "Lead Designer{Enter}");
        await waitFor(() =>
            expect(args.onCellChange).toHaveBeenLastCalledWith(
                expect.objectContaining({ rowId: "job-1", columnKey: "title", value: "Lead Designer", previousValue: "Senior UX Designer" }),
            ),
        );
        await expect(args.onRowChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: "job-1", title: "Lead Designer" }), expect.anything());
        await waitFor(() => expect(cellOf(canvasElement, "Frontend Developer")).toHaveFocus());

        await userEvent.keyboard("X");
        await expect(within(canvasElement).getByRole("textbox", { name: "Title" })).toHaveValue("X");
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(cellOf(canvasElement, "Frontend Developer")).toHaveFocus());
        await expect(args.onCellChange).toHaveBeenCalledTimes(1);

        await userEvent.keyboard("{ArrowRight}{ArrowRight}");
        await expect(canvasElement.querySelector("[data-editing]")).toBeNull();
        await userEvent.keyboard("12{Tab}");
        await waitFor(() => expect(args.onCellChange).toHaveBeenLastCalledWith(expect.objectContaining({ columnKey: "applications", value: 12 })));
        await expect(within(canvasElement).queryByRole("textbox")).toBeNull();
        const secondRow = within(closestOf(cellOf(canvasElement, "Frontend Developer"), "tr"));
        await expect(closestOf(secondRow.getByRole("checkbox", { name: "Featured" }), "td")).toHaveFocus();
        await userEvent.keyboard(" ");
        await waitFor(() => expect(args.onCellChange).toHaveBeenLastCalledWith(expect.objectContaining({ columnKey: "featured", value: true })));

        await userEvent.keyboard("{Home}{ArrowRight}{Enter}");
        await userEvent.click(await screen.findByRole("option", { name: "Remote" }));
        await waitFor(() => expect(args.onCellChange).toHaveBeenLastCalledWith(expect.objectContaining({ columnKey: "location", value: "Remote" })));
        await waitFor(() => expect(closestOf(secondRow.getByText("Remote"), "td")).toHaveFocus());

        await userEvent.keyboard("{Enter}");
        // The select moves the focus to the chosen option a frame after opening; until then, Tab would leave the cell instead
        await waitFor(() => expect(screen.getByRole("option", { name: "Remote" })).toHaveFocus());
        await userEvent.keyboard("{Tab}");
        const applicationsEditor = within(canvasElement).getByRole("textbox", { name: "Applications" });
        await waitFor(() => expect(applicationsEditor).toHaveFocus());
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(closestOf(secondRow.getByRole("checkbox", { name: "Featured" }), "tr").querySelector("td:focus")).not.toBeNull());
        await expect(screen.queryByRole("listbox")).toBeNull();
    },
};

/**
 * With `onRowReorder`, each row gets a grip: drag it, or focus it and press ArrowUp, ArrowDown, Home, or End. The line shows where
 * the row lands.
 */
export const RowReorder: Story = {
    args: {
        rows: allJobs.slice(0, 5),
        onRowClick: undefined,
        onRowReorder: fn(),
    },
    play: async ({ args, canvas }) => {
        const grip = canvas.getByRole("button", { name: "Move Senior UX Designer" });
        grip.focus();
        await userEvent.keyboard("{ArrowDown}");
        await waitFor(() => expect(args.onRowReorder).toHaveBeenLastCalledWith(0, 1));
        await waitFor(() => expect(canvas.getByRole("button", { name: "Move Senior UX Designer" })).toHaveFocus());
        await expect(canvas.getAllByRole("row")[2]).toHaveTextContent("Senior UX Designer");

        await userEvent.keyboard("{End}");
        await waitFor(() => expect(args.onRowReorder).toHaveBeenLastCalledWith(1, 4));
        await userEvent.keyboard("{Home}");
        await waitFor(() => expect(args.onRowReorder).toHaveBeenLastCalledWith(4, 0));
        await expect(canvas.getAllByRole("row")[1]).toHaveTextContent("Senior UX Designer");
    },
};

/**
 * With `onColumnVisibilityChange`, the header ends with a columns menu to show and hide columns. Columns with `hideable: false` and
 * the last shown column stay.
 */
export const ColumnVisibility: Story = {
    args: {
        rows: allJobs.slice(0, 5),
        columns: columns.map((column) => (column.key === "title" ? { ...column, hideable: false } : column)),
        columnVisibility: { applications: false },
        onColumnVisibilityChange: fn(),
    },
    play: async ({ args, canvas }) => {
        await expect(canvas.queryByRole("columnheader", { name: /Applications/ })).toBeNull();

        await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
        await expect(await screen.findByRole("menuitemcheckbox", { name: "Title" })).toHaveAttribute("aria-disabled", "true");
        await userEvent.click(screen.getByRole("menuitemcheckbox", { name: "Location" }));
        await waitFor(() => expect(args.onColumnVisibilityChange).toHaveBeenLastCalledWith({ applications: false, location: false }));
        await expect(canvas.queryByRole("columnheader", { name: /Location/ })).toBeNull();

        await userEvent.click(screen.getByRole("menuitemcheckbox", { name: "Applications" }));
        await expect(await canvas.findByRole("columnheader", { name: /Applications/ })).toBeInTheDocument();
        await userEvent.keyboard("{Escape}");
    },
};

function ExportToolbar(args: DataGridProps<Job>) {
    const [columnVisibility, setColumnVisibility] = useState<DataGridColumnVisibility>({});
    return (
        <div className={styles.stack}>
            <div className={styles.toolbar}>
                <DataGridColumnsMenu
                    columns={args.columns}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                    trigger={
                        <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="columns-3" />}>
                            Columns
                        </Button>
                    }
                />
                <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<Icon name="download" />}
                    onClick={() => downloadDataGridCsv("jobs.csv", { columns: args.columns, rows: args.rows, columnVisibility })}
                >
                    Export CSV
                </Button>
            </div>
            <DataGrid {...args} columnVisibility={columnVisibility} />
        </div>
    );
}

/**
 * `downloadDataGridCsv` exports the shown columns as a CSV file on the client; pass all rows, not just the page. A column's
 * `exportValue` sets its text in the file, e.g. the status as a word rather than the indicator. `DataGridColumnsMenu` places the
 * columns menu in a toolbar instead of the header.
 */
export const Export: Story = {
    args: {
        rows: allJobs.slice(0, 8),
        columns: columns.map((column) => (column.key === "status" ? { ...column, exportValue: (job: Job) => job.status } : column)),
    },
    render: (args) => <ExportToolbar {...args} />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
        await userEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Location" }));
        await expect(canvas.queryByRole("columnheader", { name: /Location/ })).toBeNull();
        await userEvent.keyboard("{Escape}");
        await expect(canvas.getByRole("button", { name: "Export CSV" })).toBeEnabled();
    },
};

const departmentRows: Job[] = ["Design", "Engineering", "Content"].map((department, departmentIndex) => {
    const openings = allJobs.filter((_, index) => index % 3 === departmentIndex).slice(0, 3);
    return {
        id: `department-${departmentIndex}`,
        title: department,
        location: "",
        status: "published",
        applications: openings.reduce((sum, job) => sum + job.applications, 0),
        featured: false,
        openings,
    };
});

/**
 * Sub rows (`getSubRows`) show below their parent, indented, while it is expanded (`expandedRowIds`). The chevron toggles a row;
 * on the chevron or a focused row, ArrowRight expands and ArrowLeft collapses it.
 */
export const SubRows: Story = {
    args: {
        rows: departmentRows,
        getSubRows: (job: Job) => job.openings,
        expandedRowIds: ["department-0"],
    },
    play: async ({ args, canvas }) => {
        await expect(canvas.getByText("Senior UX Designer")).toBeInTheDocument();

        const engineering = canvas.getByRole("button", { name: "Expand Engineering" });
        await expect(engineering).toHaveAttribute("aria-expanded", "false");
        await userEvent.click(engineering);
        await waitFor(() => expect(args.onExpandedRowIdsChange).toHaveBeenLastCalledWith(["department-0", "department-1"]));
        await expect(canvas.getByText("Frontend Developer")).toBeInTheDocument();
        await expect(args.onRowClick).not.toHaveBeenCalled();

        closestOf(canvas.getByText("Design"), "tr").focus();
        await userEvent.keyboard("{ArrowLeft}");
        await waitFor(() => expect(args.onExpandedRowIdsChange).toHaveBeenLastCalledWith(["department-1"]));
        await expect(canvas.queryByText("Senior UX Designer")).toBeNull();
        await userEvent.keyboard("{ArrowRight}");
        await waitFor(() => expect(canvas.getByText("Senior UX Designer")).toBeInTheDocument());

        canvas.getByRole("button", { name: "Expand Engineering" }).focus();
        await userEvent.keyboard("{ArrowLeft}");
        await waitFor(() => expect(canvas.queryByText("Frontend Developer")).toBeNull());
        await expect(canvas.getByRole("button", { name: "Expand Engineering" })).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}");
        await waitFor(() => expect(canvas.getByText("Frontend Developer")).toBeInTheDocument());
    },
};

/**
 * `renderRowDetail` shows details of an expanded row across all columns; `isRowExpandable` limits it to the rows that have any.
 */
export const RowDetail: Story = {
    args: {
        rows: allJobs.slice(0, 5),
        isRowExpandable: (job: Job) => job.status !== "archived",
        renderRowDetail: (job: Job) => (
            <div className={styles.detail}>
                <strong>{job.title}</strong>
                <span className={styles.muted}>
                    {job.applications} applications in {job.location}, {job.featured ? "featured on the career page" : "not featured"}.
                </span>
            </div>
        ),
    },
    play: async ({ canvas }) => {
        await expect(canvas.queryByRole("button", { name: "Expand Content Strategist" })).not.toBeNull();
        await userEvent.click(canvas.getByRole("button", { name: "Expand Frontend Developer" }));
        await expect(await canvas.findByText(/applications in Graz/)).toBeVisible();
        await expect(canvas.getByRole("button", { name: "Expand Frontend Developer" })).toHaveAttribute("aria-controls");
    },
};

/**
 * The selection keeps the ids of other pages. The header checkbox reflects the shown page: checked when all its rows are selected,
 * a dash when only some are; the bulk action bar counts all.
 */
export const SelectionAcrossPages: Story = {
    args: {
        selectable: true,
        onRowClick: undefined,
        bulkActions: [{ label: "Archive", icon: <Icon name="archive" />, onClick: fn() }],
        pagination: { page: 1, pageSize: 5, total: 47, onPageChange: fn() },
    },
    play: async ({ canvas }) => {
        const selectAll = canvas.getByRole("checkbox", { name: "Select all" });
        await userEvent.click(selectAll);
        await expect(selectAll).toHaveAttribute("aria-checked", "true");

        await userEvent.click(canvas.getByRole("button", { name: /next/i }));
        await waitFor(() => expect(canvas.getByRole("checkbox", { name: "Select all" })).toHaveAttribute("aria-checked", "false"));
        await expect(canvas.getByText("5 selected")).toBeInTheDocument();

        await userEvent.click(canvas.getAllByRole("checkbox")[1]);
        await expect(canvas.getByRole("checkbox", { name: "Select all" })).toHaveAttribute("aria-checked", "mixed");
        await expect(canvas.getByText("6 selected")).toBeInTheDocument();

        await userEvent.click(canvas.getByRole("button", { name: /previous/i }));
        await waitFor(() => expect(canvas.getByRole("checkbox", { name: "Select all" })).toHaveAttribute("aria-checked", "true"));
    },
};

interface SheetColumn {
    id: string;
    title: string;
}

interface SheetRow {
    id: string;
    cells: Record<string, string>;
}

interface SheetAction {
    label: string;
    icon: IconName;
    onClick: () => void;
    disabled?: boolean;
    color?: "error";
}

function ActionsMenu({ label, actions }: { label: string; actions: SheetAction[] }) {
    const [open, setOpen] = useState(false);
    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            trigger={
                <IconButton color="secondary" aria-label={label} size="small" variant="text">
                    <Icon name="more-horizontal" />
                </IconButton>
            }
        >
            {actions.map((action) => (
                <MenuItem
                    key={action.label}
                    label={action.label}
                    icon={<Icon name={action.icon} />}
                    disabled={action.disabled}
                    color={action.color}
                    onClick={action.onClick}
                />
            ))}
        </Menu>
    );
}

function SpreadsheetExample() {
    const nextId = useRef(4);
    const [sheetColumns, setSheetColumns] = useState<SheetColumn[]>([
        { id: "plan", title: "Plan" },
        { id: "price", title: "Price per month" },
        { id: "storage", title: "Storage" },
    ]);
    const [sheetRows, setSheetRows] = useState<SheetRow[]>([
        { id: "row-1", cells: { plan: "Starter", price: "€ 9", storage: "10 GB" } },
        { id: "row-2", cells: { plan: "Team", price: "€ 29", storage: "100 GB" } },
        { id: "row-3", cells: { plan: "Enterprise", price: "On request", storage: "Unlimited" } },
    ]);

    const createId = (prefix: string) => `${prefix}-${nextId.current++}`;
    const insertColumn = (index: number) =>
        setSheetColumns((current) => [
            ...current.slice(0, index),
            { id: createId("column"), title: `Column ${current.length + 1}` },
            ...current.slice(index),
        ]);
    const insertRow = (index: number) =>
        setSheetRows((current) => [...current.slice(0, index), { id: createId("row"), cells: {} }, ...current.slice(index)]);

    const gridColumns: DataGridColumn<SheetRow>[] = sheetColumns.map((sheetColumn, index) => ({
        key: sheetColumn.id,
        header: sheetColumn.title,
        editable: true,
        getValue: (row) => row.cells[sheetColumn.id] ?? "",
        setValue: (row, value) => ({ ...row, cells: { ...row.cells, [sheetColumn.id]: String(value ?? "") } }),
        headerActions: (
            <ActionsMenu
                label={`Actions for column ${sheetColumn.title}`}
                actions={[
                    { label: "Insert column left", icon: "arrow-left", onClick: () => insertColumn(index) },
                    { label: "Insert column right", icon: "arrow-right", onClick: () => insertColumn(index + 1) },
                    {
                        label: "Move left",
                        icon: "arrow-left",
                        disabled: index === 0,
                        onClick: () => setSheetColumns((current) => moveItem(current, index, index - 1)),
                    },
                    {
                        label: "Move right",
                        icon: "arrow-right",
                        disabled: index === sheetColumns.length - 1,
                        onClick: () => setSheetColumns((current) => moveItem(current, index, index + 1)),
                    },
                    {
                        label: "Delete column",
                        icon: "delete",
                        color: "error",
                        disabled: sheetColumns.length === 1,
                        onClick: () => setSheetColumns((current) => current.filter((candidate) => candidate.id !== sheetColumn.id)),
                    },
                ]}
            />
        ),
    }));

    return (
        <DataGrid
            aria-label="Plans"
            columns={gridColumns}
            rows={sheetRows}
            getRowId={(row) => row.id}
            onRowChange={(row) => setSheetRows((current) => current.map((candidate) => (candidate.id === row.id ? row : candidate)))}
            onRowReorder={(fromIndex, toIndex) => setSheetRows((current) => moveItem(current, fromIndex, toIndex))}
            rowActions={(row) => {
                const index = sheetRows.indexOf(row);
                return (
                    <ActionsMenu
                        label={`Actions for row ${index + 1}`}
                        actions={[
                            { label: "Insert row above", icon: "arrow-up", onClick: () => insertRow(index) },
                            { label: "Insert row below", icon: "arrow-down", onClick: () => insertRow(index + 1) },
                            {
                                label: "Delete row",
                                icon: "delete",
                                color: "error",
                                disabled: sheetRows.length === 1,
                                onClick: () => setSheetRows((current) => current.filter((candidate) => candidate.id !== row.id)),
                            },
                        ]}
                    />
                );
            }}
        />
    );
}

/**
 * A spreadsheet-like table, e.g. the table block: every cell is editable, `headerActions` insert, move, and delete columns, the row
 * actions insert and delete rows, and the grips move rows. The columns and rows are plain state of the consumer.
 */
export const Spreadsheet: Story = {
    render: () => <SpreadsheetExample />,
    play: async ({ canvas, canvasElement }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Actions for column Plan" }));
        await userEvent.click(await screen.findByRole("menuitem", { name: "Insert column right" }));
        const headers = canvas.getAllByRole("columnheader").map((header) => header.textContent);
        await expect(headers.slice(0, 2)).toStrictEqual(["Plan", "Column 4"]);

        const newCell = closestOf(canvas.getByText("Starter"), "tr").querySelectorAll("td")[2];
        await userEvent.click(newCell);
        await userEvent.keyboard("Yes{Enter}");
        await expect(await canvas.findByText("Yes")).toBeInTheDocument();
        await waitFor(() => expect(closestOf(canvas.getByText("Team"), "tr").querySelectorAll("td")[2]).toHaveFocus());

        await userEvent.click(canvas.getByRole("button", { name: "Actions for row 3" }));
        await userEvent.click(await screen.findByRole("menuitem", { name: "Delete row" }));
        await waitFor(() => expect(within(canvasElement).queryByText("Enterprise")).toBeNull());
    },
};
