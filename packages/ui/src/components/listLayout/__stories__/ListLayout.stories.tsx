import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { PageTypeShell, StructureFrame, StructureRegion } from "../../../storybook/pageTypes/PageTypeShell";
import { PatternLegend, PatternPage, PatternRules, PatternSection, PatternUses } from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { DataGrid, type DataGridColumn, type DataGridSort } from "../../dataGrid/DataGrid";
import { EmptyState } from "../../emptyState/EmptyState";
import { FilterBar } from "../../filterBar/FilterBar";
import { FilterChip } from "../../filterChip/FilterChip";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { Menu } from "../../menu/Menu";
import { MenuItem } from "../../menu/MenuItem";
import { MenuSeparator } from "../../menu/MenuSeparator";
import { PageHeader } from "../../pageHeader/PageHeader";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import listLayoutTokens from "../_tokens.scss?raw";
import { ListLayout } from "../ListLayout";
import styles from "./ListLayout.stories.module.scss";

type JobStatus = "published" | "unpublished" | "archived";

interface Job {
    id: string;
    title: string;
    location: string;
    department: string;
    status: JobStatus;
    updated: string;
}

const titles = ["Senior UX Designer", "Frontend Developer", "Product Owner CMS", "Content Strategist", "DevOps Engineer", "QA Engineer"];
const locations = ["Vienna", "Graz", "Linz", "Salzburg", "Remote"];
const departments = ["Design", "Engineering", "Product", "Marketing"];
const statuses: JobStatus[] = ["published", "published", "unpublished", "published", "archived"];
const updated = ["12 min ago", "1 h ago", "Yesterday", "2 days ago", "Last week"];

const jobs: Job[] = Array.from({ length: 47 }, (_, index) => ({
    id: `job-${index + 1}`,
    title: index < titles.length ? titles[index] : `${titles[index % titles.length]} ${Math.floor(index / titles.length) + 1}`,
    location: locations[index % locations.length],
    department: departments[index % departments.length],
    status: statuses[index % statuses.length],
    updated: updated[index % updated.length],
}));

const statusFilters: { value: JobStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Unpublished" },
    { value: "archived", label: "Archived" },
];

const columns: DataGridColumn<Job>[] = [
    { key: "title", header: "Title", sortable: true, render: (job) => <span className={styles.title}>{job.title}</span> },
    { key: "location", header: "Location", sortable: true, priority: "low", render: (job) => <span className={styles.muted}>{job.location}</span> },
    { key: "department", header: "Department", priority: "low", render: (job) => <span className={styles.muted}>{job.department}</span> },
    { key: "updated", header: "Updated", width: 130, priority: "low", render: (job) => <span className={styles.muted}>{job.updated}</span> },
    { key: "status", header: "Status", width: 150, render: (job) => <StatusIndicator status={job.status} /> },
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
            <MenuItem label="Archive" icon={<Icon name="archive" />} />
        </Menu>
    );
}

function sortJobs(rows: Job[], sort: DataGridSort | undefined) {
    if (sort == null) {
        return rows;
    }
    const key = sort.key as keyof Job;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => a[key].localeCompare(b[key]) * factor);
}

function JobAdsPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<JobStatus | "all">("all");
    const [sort, setSort] = useState<DataGridSort | undefined>({ key: "title", direction: "asc" });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const matches = jobs.filter((job) => `${job.title} ${job.location}`.toLowerCase().includes(search.toLowerCase()));
    const countFor = (value: JobStatus | "all") => matches.filter((job) => value === "all" || job.status === value).length;
    const results = sortJobs(
        matches.filter((job) => status === "all" || job.status === status),
        sort,
    );
    const pageRows = results.slice((page - 1) * pageSize, page * pageSize);

    function resetFilters() {
        setSearch("");
        setStatus("all");
        setPage(1);
    }

    return (
        <ListLayout
            header={
                <PageHeader
                    eyebrow="Content · Careers"
                    title="Job ads"
                    subtitle={`${jobs.length} job ads in Austria · German`}
                    actions={
                        <>
                            <Button variant="outlined" color="secondary" startIcon={<Icon name="download" />}>
                                Export
                            </Button>
                            <Button startIcon={<Icon name="plus" />}>New job ad</Button>
                        </>
                    }
                />
            }
            toolbar={
                <FilterBar
                    searchValue={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    resultCount={results.length}
                >
                    {statusFilters.map((filter) => (
                        <FilterChip
                            key={filter.value}
                            selected={status === filter.value}
                            onClick={() => {
                                setStatus(filter.value);
                                setPage(1);
                            }}
                            count={countFor(filter.value)}
                            status={filter.value === "all" ? undefined : filter.value}
                        >
                            {filter.label}
                        </FilterChip>
                    ))}
                </FilterBar>
            }
        >
            <DataGrid
                aria-label="Job ads"
                columns={columns}
                rows={pageRows}
                getRowId={(job) => job.id}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                sort={sort}
                onSortChange={setSort}
                onRowClick={() => undefined}
                rowActions={(job) => <RowMenu job={job} />}
                bulkActions={[
                    { label: "Publish", icon: <Icon name="check" />, onClick: () => setSelectedIds([]) },
                    { label: "Archive", icon: <Icon name="archive" />, onClick: () => setSelectedIds([]) },
                ]}
                pagination={{
                    page,
                    pageSize,
                    total: results.length,
                    onPageChange: setPage,
                    onPageSizeChange: (nextPageSize) => {
                        setPageSize(nextPageSize);
                        setPage(1);
                    },
                }}
                emptyState={
                    <EmptyState
                        icon={<Icon name="search" />}
                        title={`No matches for “${search}”`}
                        description="Check the spelling or reset the filters."
                        actions={
                            <Button variant="outlined" color="secondary" size="small" onClick={resetFilters}>
                                Reset filters
                            </Button>
                        }
                    />
                }
            />
        </ListLayout>
    );
}

const meta = {
    component: ListLayout,
    title: "Page types/List",
    decorators: [themeDecorator],
    parameters: {
        tokens: listLayoutTokens,
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Structured content of one type as a table: the page header with scope, count, and primary action; a toolbar with search, status filters, and more filters; the `DataGrid` with selection, sorting, row menu, and paging. A row opens the edit page; with a selection, the bulk action bar appears above the paging.",
            },
            story: { inline: false, height: "960px" },
        },
    },
    args: {
        header: null,
        children: null,
    },
    argTypes: {
        header: { control: false },
        toolbar: { control: false },
        children: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof ListLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The job ads of the career portal inside the app frame.
 *
 * **Rules**
 *
 * - Do: one list per content type; remember the paging setting per table.
 * - Don't: edit in the row; show more than seven columns.
 */
export const Default: Story = {
    render: () => (
        <PageTypeShell activeId="job-ads">
            <JobAdsPage />
        </PageTypeShell>
    ),
};

/**
 * Filtering the list and selecting a row: the bulk action bar appears above the paging.
 */
export const FilterAndSelect: Story = {
    render: () => (
        <PageTypeShell activeId="job-ads">
            <JobAdsPage />
        </PageTypeShell>
    ),
    play: async ({ canvas }) => {
        const grid = canvas.getByRole("table", { name: "Job ads" });
        await userEvent.click(canvas.getByRole("button", { name: /^Archived/ }));
        await expect(within(grid).getAllByRole("row")).toHaveLength(10);
        await userEvent.click(within(grid).getByRole("checkbox", { name: "Select DevOps Engineer" }));
        await waitFor(() => expect(canvas.getByRole("button", { name: "Archive" })).toBeVisible());
    },
};

/**
 * The regions of the list page and the draft's rules.
 */
export const Structure: Story = {
    parameters: { layout: "padded", docs: { story: { inline: true } } },
    render: () => (
        <PatternPage>
            <PatternSection title="Structure">
                <div className={styles.structure}>
                    <StructureFrame>
                        <ListLayout
                            className={styles.structureLayout}
                            header={<StructureRegion number={1} label="Page header · New button" variant="dashed" />}
                            toolbar={<StructureRegion number={2} label="Search · filter chips · more filters" />}
                        >
                            <div className={styles.structureContent}>
                                <StructureRegion number={3} label="DataGrid" variant="accent" />
                                <StructureRegion number={4} label="Footer · paging" />
                            </div>
                        </ListLayout>
                    </StructureFrame>
                    <PatternLegend
                        items={[
                            { title: "Page header", description: "Scope, count, primary action." },
                            { title: "Toolbar", description: "Search (/), status filters, more filters, export." },
                            { title: "DataGrid", description: "Selection, sorting, row menu. A row opens the edit page." },
                            { title: "Footer", description: "Sorting, per page, pages. The bulk action bar appears above it with a selection." },
                        ]}
                    />
                </div>
            </PatternSection>
            <PatternUses pages={["Tables & paging", "Selection & toggles", "Form fields"]} />
            <PatternRules
                dos={["One list per content type.", "Remember the paging setting per table."]}
                donts={["Editing in the row.", "More than seven visible columns."]}
            />
        </PatternPage>
    ),
};
