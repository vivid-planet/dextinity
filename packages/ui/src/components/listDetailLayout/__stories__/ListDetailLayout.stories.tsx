import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { PageTypeShell, StructureFrame, StructureRegion } from "../../../storybook/pageTypes/PageTypeShell";
import { PatternLegend, PatternPage, PatternRules, PatternSection, PatternUses } from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Chip } from "../../chip/Chip";
import { DataGrid, type DataGridColumn } from "../../dataGrid/DataGrid";
import { FilterBar } from "../../filterBar/FilterBar";
import { FilterChip } from "../../filterChip/FilterChip";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { PageHeader } from "../../pageHeader/PageHeader";
import { Panel } from "../../panel/Panel";
import { SegmentedControl } from "../../segmentedControl/SegmentedControl";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { Switch } from "../../switch/Switch";
import { Textarea } from "../../textarea/Textarea";
import { TextField } from "../../textField/TextField";
import { ListDetailLayout } from "../ListDetailLayout";
import listDetailLayoutTokens from "../ListDetailLayout.tokens.scss?raw";
import styles from "./ListDetailLayout.stories.module.scss";

type RedirectType = "301" | "302";

interface Redirect {
    id: string;
    source: string;
    target: string;
    targetTitle?: string;
    type: RedirectType;
    automatic: boolean;
    active: boolean;
    comment: string;
}

const initialRedirects: Redirect[] = [
    {
        id: "r1",
        source: "/jobs",
        target: "/careers/open-positions",
        targetTitle: "Open positions",
        type: "301",
        automatic: true,
        active: true,
        comment: "Path changed",
    },
    {
        id: "r2",
        source: "/karriere",
        target: "/careers",
        targetTitle: "Careers",
        type: "301",
        automatic: false,
        active: true,
        comment: "Old German path",
    },
    {
        id: "r3",
        source: "/apply",
        target: "/careers/how-to-apply",
        targetTitle: "How to apply",
        type: "301",
        automatic: true,
        active: true,
        comment: "Path changed",
    },
    {
        id: "r4",
        source: "/summer-campaign",
        target: "https://campaign.example.com",
        type: "302",
        automatic: false,
        active: false,
        comment: "Campaign until August",
    },
    { id: "r5", source: "/team", target: "/about-us/team", targetTitle: "Team", type: "301", automatic: true, active: true, comment: "Page moved" },
    { id: "r6", source: "/privacy-policy", target: "/privacy", targetTitle: "Privacy", type: "301", automatic: false, active: true, comment: "" },
    {
        id: "r7",
        source: "/trainees",
        target: "/careers/trainees-2025",
        targetTitle: "Trainee program 2025",
        type: "301",
        automatic: true,
        active: false,
        comment: "Page archived",
    },
];

const columns: DataGridColumn<Redirect>[] = [
    { key: "source", header: "Source", render: (redirect) => <span className={styles.mono}>{redirect.source}</span> },
    {
        key: "target",
        header: "Target",
        render: (redirect) => (
            <span className={styles.target}>
                <Icon name={redirect.targetTitle == null ? "open-new-tab" : "file"} size="small" />
                <span>
                    <b>{redirect.targetTitle ?? "External URL"}</b>
                    <span className={styles.mono}>{redirect.target}</span>
                </span>
            </span>
        ),
    },
    { key: "type", header: "Type", width: 90, priority: "low", render: (redirect) => <span className={styles.muted}>{redirect.type}</span> },
    {
        key: "origin",
        header: "Origin",
        width: 120,
        priority: "low",
        render: (redirect) => (
            <Chip size="small" color={redirect.automatic ? "info" : "secondary"} variant={redirect.automatic ? "contained" : "outlined"}>
                {redirect.automatic ? "Automatic" : "Manual"}
            </Chip>
        ),
    },
    {
        key: "status",
        header: "Status",
        width: 130,
        render: (redirect) => (
            <StatusIndicator status={redirect.active ? "published" : "unpublished"}>{redirect.active ? "Active" : "Inactive"}</StatusIndicator>
        ),
    },
];

function RedirectForm({ redirect, onClose, onSave }: { redirect: Redirect; onClose: () => void; onSave: (redirect: Redirect) => void }) {
    const [draft, setDraft] = useState(redirect);
    return (
        <Panel
            title={redirect.source === "" ? "New redirect" : "Edit redirect"}
            actions={
                <IconButton color="secondary" aria-label="Close" variant="text" size="small" onClick={onClose}>
                    <Icon name="close" />
                </IconButton>
            }
        >
            <div className={styles.form}>
                <TextField
                    name="source"
                    label="Source"
                    required
                    prefix="example.com"
                    value={draft.source}
                    onChange={(event) => setDraft({ ...draft, source: event.target.value })}
                />
                <TextField
                    name="target"
                    label="Target"
                    required
                    value={draft.target}
                    onChange={(event) => setDraft({ ...draft, target: event.target.value })}
                    helperText="A page path or an external URL."
                />
                <div className={styles.group} role="group" aria-labelledby="redirect-type-label">
                    <span id="redirect-type-label" className={styles.groupLabel}>
                        Type
                    </span>
                    <SegmentedControl
                        aria-label="Type"
                        value={draft.type}
                        onChange={(type) => setDraft({ ...draft, type })}
                        options={[
                            { value: "301", label: "Permanent · 301" },
                            { value: "302", label: "Temporary · 302" },
                        ]}
                    />
                </div>
                <Textarea
                    name="comment"
                    label="Comment"
                    rows={2}
                    value={draft.comment}
                    onChange={(event) => setDraft({ ...draft, comment: event.target.value })}
                />
                <Switch checked={draft.active} onChange={(active) => setDraft({ ...draft, active })}>
                    Active
                </Switch>
                <div className={styles.formActions}>
                    <Button variant="text" color="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button startIcon={<Icon name="check" />} onClick={() => onSave(draft)}>
                        Save
                    </Button>
                </div>
            </div>
        </Panel>
    );
}

function RedirectsPage({ initialOpenId }: { initialOpenId?: string }) {
    const [redirects, setRedirects] = useState(initialRedirects);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
    const [openId, setOpenId] = useState<string | undefined>(initialOpenId);

    const matches = redirects.filter((redirect) => `${redirect.source} ${redirect.target}`.toLowerCase().includes(search.toLowerCase()));
    const countFor = (value: typeof status) => matches.filter((redirect) => value === "all" || redirect.active === (value === "active")).length;
    const rows = matches.filter((redirect) => status === "all" || redirect.active === (status === "active"));
    const open = openId != null;
    const editing = openId === "new" ? undefined : redirects.find((redirect) => redirect.id === openId);
    const blank: Redirect = { id: "new", source: "", target: "", type: "301", automatic: false, active: true, comment: "" };

    return (
        <ListDetailLayout
            open={open}
            onOpenChange={(nextOpen) => !nextOpen && setOpenId(undefined)}
            sidePanelLabel={editing == null ? "New redirect" : `Edit redirect ${editing.source}`}
            header={
                <PageHeader
                    eyebrow="Website"
                    title="Redirects"
                    subtitle={`${redirects.length} redirects in Austria · German`}
                    actions={
                        <Button startIcon={<Icon name="plus" />} onClick={() => setOpenId("new")}>
                            New redirect
                        </Button>
                    }
                />
            }
            toolbar={
                <FilterBar searchValue={search} onSearchChange={setSearch} resultCount={rows.length}>
                    {(["all", "active", "inactive"] as const).map((value) => (
                        <FilterChip
                            key={value}
                            selected={status === value}
                            onClick={() => setStatus(value)}
                            count={countFor(value)}
                            status={value === "all" ? undefined : value === "active" ? "published" : "unpublished"}
                        >
                            {value === "all" ? "All" : value === "active" ? "Active" : "Inactive"}
                        </FilterChip>
                    ))}
                </FilterBar>
            }
            sidePanel={
                open && (
                    <RedirectForm
                        key={openId}
                        redirect={editing ?? blank}
                        onClose={() => setOpenId(undefined)}
                        onSave={(saved) => {
                            setRedirects((current) =>
                                saved.id === "new"
                                    ? [{ ...saved, id: `r${current.length + 1}` }, ...current]
                                    : current.map((item) => (item.id === saved.id ? saved : item)),
                            );
                            setOpenId(undefined);
                        }}
                    />
                )
            }
        >
            <DataGrid
                aria-label="Redirects"
                columns={columns}
                rows={rows}
                getRowId={(redirect) => redirect.id}
                onRowClick={(redirect) => setOpenId(redirect.id)}
            />
        </ListDetailLayout>
    );
}

const meta = {
    component: ListDetailLayout,
    title: "Page types/List + side panel",
    decorators: [themeDecorator],
    parameters: {
        tokens: listDetailLayoutTokens,
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Short records edited next to the list. The page header and the toolbar are as on the list; a click on a row opens the side panel and the list stays visible. The side panel is a form with save; Escape closes it. Made for records with few fields, such as redirects — assets additionally have their own detail page with image, focal point, crops, and info.",
            },
            story: { inline: false, height: "960px" },
        },
    },
    args: {
        header: null,
        children: null,
        sidePanel: null,
        sidePanelLabel: "Edit redirect",
        open: true,
        onOpenChange: () => undefined,
    },
    argTypes: {
        header: { control: false },
        toolbar: { control: false },
        children: { control: false },
        sidePanel: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof ListDetailLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The redirects of the career portal inside the app frame, with one redirect open in the side panel.
 *
 * **Rules**
 *
 * - Do: use it for records with few fields; the row being edited stays visible in the list.
 * - Don't: use the side panel for long forms — use an edit page instead.
 */
export const Default: Story = {
    render: () => (
        <PageTypeShell activeId="redirects">
            <RedirectsPage initialOpenId="r2" />
        </PageTypeShell>
    ),
};

/**
 * Escape in the side panel closes it, and the focus returns to the row that opened it, so keyboard users continue in the list.
 */
export const CloseWithEscape: Story = {
    render: () => (
        <PageTypeShell activeId="redirects">
            <RedirectsPage initialOpenId="r2" />
        </PageTypeShell>
    ),
    play: async ({ canvas }) => {
        const panel = canvas.getByRole("complementary", { name: "Edit redirect /karriere" });
        await userEvent.click(within(panel).getByRole("textbox", { name: /Comment/ }));
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(canvas.queryByRole("complementary", { name: /redirect/ })).toBeNull());

        const row = within(canvas.getByRole("table", { name: "Redirects" }))
            .getByText("/karriere")
            .closest("tr");
        await userEvent.click(within(canvas.getByRole("table", { name: "Redirects" })).getByText("/karriere"));
        const reopened = canvas.getByRole("complementary", { name: "Edit redirect /karriere" });
        await expect(reopened).toBeVisible();

        await userEvent.click(within(reopened).getByRole("textbox", { name: /Comment/ }));
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(row).toContainElement(document.activeElement as HTMLElement));
    },
};

/**
 * Without an open record, the list takes the full width.
 */
export const Closed: Story = {
    render: () => (
        <PageTypeShell activeId="redirects">
            <RedirectsPage />
        </PageTypeShell>
    ),
};

/**
 * The regions of the page and the draft's rules.
 */
export const Structure: Story = {
    parameters: { layout: "padded", docs: { story: { inline: true } } },
    render: () => (
        <PatternPage>
            <PatternSection
                title="Structure"
                description="A list with a side panel. Assets additionally have their own detail page (image, focal point, crops, info)."
            >
                <div className={styles.structure}>
                    <StructureFrame>
                        <ListDetailLayout
                            className={styles.structureLayout}
                            open
                            onOpenChange={() => undefined}
                            sidePanelLabel="Side panel"
                            header={<StructureRegion number={1} label="Page header" variant="dashed" />}
                            toolbar={<StructureRegion number={2} label="Search · filter" />}
                            sidePanel={<StructureRegion number={4} label="Side panel: edit" variant="accent" className={styles.structurePanel} />}
                        >
                            <StructureRegion number={3} label="List" className={styles.structureList} />
                        </ListDetailLayout>
                    </StructureFrame>
                    <PatternLegend
                        items={[
                            { title: "Page header", description: "As on the list." },
                            { title: "Toolbar", description: "Search, status, kind." },
                            { title: "List", description: "A click opens the panel; the list stays visible." },
                            { title: "Side panel", description: "Form with save; Escape closes it. For short records such as redirects." },
                        ]}
                    />
                </div>
            </PatternSection>
            <PatternUses pages={["Tables & paging", "Modals & overlays", "Form fields"]} />
            <PatternRules
                dos={["For records with few fields.", "The selection in the list marks the row of the panel."]}
                donts={["A side panel for long forms – use an edit page then."]}
            />
        </PatternPage>
    ),
};
