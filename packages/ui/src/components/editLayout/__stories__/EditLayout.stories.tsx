import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";

import { PageTypeShell } from "../../../storybook/pageTypes/PageTypeShell";
import { PatternLegend, PatternPage, PatternRules, PatternSection, PatternUses } from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Block } from "../../blockList/Block";
import { BlockList } from "../../blockList/BlockList";
import { Button } from "../../button/Button";
import { DevicePreview, type DevicePreviewDevice } from "../../devicePreview/DevicePreview";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { Input } from "../../input/Input";
import { KeyValueList } from "../../keyValueList/KeyValueList";
import { PageHeader } from "../../pageHeader/PageHeader";
import { Panel } from "../../panel/Panel";
import { SaveState } from "../../saveState/SaveState";
import { SegmentedControl } from "../../segmentedControl/SegmentedControl";
import { Select } from "../../select/Select";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { Switch } from "../../switch/Switch";
import { Tabs } from "../../tabs/Tabs";
import { Textarea } from "../../textarea/Textarea";
import editLayoutTokens from "../_tokens.scss?raw";
import { EditLayout, type EditLayoutProps } from "../EditLayout";
import styles from "./EditLayout.stories.module.scss";

type Variant = NonNullable<EditLayoutProps["variant"]>;
type Pane = NonNullable<EditLayoutProps["pane"]>;

function SampleSite({ kind }: { kind: "page" | "jobAd" }) {
    return (
        <div className={styles.site}>
            <header className={styles.siteHeader}>
                <span className={styles.siteLogo}>Example Inc.</span>
                <nav className={styles.siteNav}>
                    <span>Jobs</span>
                    <span>Company</span>
                    <span>Contact</span>
                </nav>
            </header>
            <div className={styles.siteStage} />
            <main className={styles.siteMain}>
                {kind === "page" ? (
                    <>
                        <h1>Work on software that lasts.</h1>
                        <p>We build digital products that stay in use for many years. We're looking for people who think things through.</p>
                        {["Senior UX Designer", "Frontend Developer", "Product Owner CMS"].map((job) => (
                            <div key={job} className={styles.siteJob}>
                                <span>{job}</span>
                                <span>Vienna · Full-time</span>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <h1>Senior UX Designer</h1>
                        <p>Vienna · Full-time · from € 58,000 gross per year</p>
                        <p>You shape the interfaces of our products, from the first sketch to the finished component in the design system.</p>
                    </>
                )}
            </main>
        </div>
    );
}

function Preview({ kind }: { kind: "page" | "jobAd" }) {
    const [device, setDevice] = useState<DevicePreviewDevice>("desktop");
    return (
        <DevicePreview
            url={kind === "page" ? "example.com/careers" : "example.com/careers/senior-ux-designer"}
            device={device}
            onDeviceChange={setDevice}
        >
            <SampleSite kind={kind} />
        </DevicePreview>
    );
}

const pageBlocks = [
    { id: "stage", title: "Stage", summary: "Image + heading", icon: <Icon name="image" /> },
    { id: "text", title: "Text", summary: "Body text", icon: <Icon name="heading" /> },
    { id: "jobs", title: "Job list", summary: "Linked content · 12 entries", icon: <Icon name="blocks" /> },
    { id: "cta", title: "Call to action", summary: "Button", icon: <Icon name="arrow-right" /> },
];

const jobAdBlocks = [
    { id: "tasks", title: "Tasks", summary: "List · 4 items", icon: <Icon name="list" /> },
    { id: "benefits", title: "Benefits", summary: "Tags · 5", icon: <Icon name="sparkle" /> },
    { id: "contact", title: "Contact", summary: "Contact person", icon: <Icon name="user" /> },
];

function Blocks({ blocks, label }: { blocks: typeof pageBlocks; label: string }) {
    const [order, setOrder] = useState(blocks);
    const [selectedId, setSelectedId] = useState(blocks[0].id);
    const [hiddenIds, setHiddenIds] = useState<string[]>([]);
    return (
        <BlockList
            aria-label={label}
            onReorder={(fromIndex, toIndex) =>
                setOrder((current) => {
                    const next = [...current];
                    const [moved] = next.splice(fromIndex, 1);
                    next.splice(toIndex, 0, moved);
                    return next;
                })
            }
            onAdd={() => undefined}
        >
            {order.map((block) => (
                <Block
                    key={block.id}
                    title={block.title}
                    summary={block.summary}
                    icon={block.icon}
                    selected={selectedId === block.id}
                    onSelect={() => setSelectedId(block.id)}
                    visible={!hiddenIds.includes(block.id)}
                    onVisibleChange={(visible) => setHiddenIds((ids) => (visible ? ids.filter((id) => id !== block.id) : [...ids, block.id]))}
                />
            ))}
        </BlockList>
    );
}

function JobAdFields() {
    const [title, setTitle] = useState("Senior UX Designer");
    const [location, setLocation] = useState<string | null>("vienna");
    const [salary, setSalary] = useState("58,000");
    const [teaser, setTeaser] = useState("You shape the interfaces of our products, from the first sketch to the finished component.");
    return (
        <div className={styles.sections}>
            <section className={styles.section}>
                <div className={styles.sectionHead}>
                    <h3>Basics</h3>
                    <p>These details appear in the list and on job boards.</p>
                </div>
                <div className={styles.fields}>
                    <Input
                        className={styles.full}
                        name="title"
                        label="Title"
                        required
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        helperText="Use gender-inclusive wording."
                    />
                    <Select
                        name="location"
                        label="Location"
                        value={location}
                        onChange={setLocation}
                        options={[
                            { value: "vienna", label: "Vienna" },
                            { value: "graz", label: "Graz" },
                            { value: "remote", label: "Remote" },
                        ]}
                    />
                    <Input
                        name="salary"
                        label="Salary from"
                        value={salary}
                        onChange={(event) => setSalary(event.target.value)}
                        suffix="€ gross / year"
                        helperText="Required in Austria."
                    />
                </div>
            </section>
            <section className={styles.section}>
                <div className={styles.sectionHead}>
                    <h3>Description</h3>
                </div>
                <Textarea
                    name="teaser"
                    label="Teaser"
                    rows={3}
                    value={teaser}
                    onChange={(event) => setTeaser(event.target.value)}
                    showCount
                    maxLength={200}
                />
            </section>
        </div>
    );
}

function PageEditor() {
    const [tab, setTab] = useState("blocks");
    return (
        <Panel>
            <div className={styles.editorStatus}>
                <StatusIndicator status="published" />
                <span className={styles.muted}>Last saved by Anna Klein</span>
            </div>
            <Tabs
                aria-label="Editor"
                value={tab}
                onChange={setTab}
                items={[
                    { value: "blocks", label: "Blocks", panel: <Blocks blocks={pageBlocks} label="Blocks" /> },
                    {
                        value: "seo",
                        label: "SEO",
                        count: 1,
                        panel: <p className={styles.muted}>Meta title, description, and the search result preview.</p>,
                    },
                    { value: "settings", label: "Settings", panel: <p className={styles.muted}>Template, visibility, and the URL path.</p> },
                ]}
            />
        </Panel>
    );
}

function FormEditor({ withBlocks }: { withBlocks: boolean }) {
    const [tab, setTab] = useState("content");
    const content = (
        <div className={styles.sections}>
            <JobAdFields />
            {withBlocks && (
                <section className={styles.section}>
                    <div className={styles.sectionHead}>
                        <h3>Blocks</h3>
                        <p>Drag to reorder. Each block collapses.</p>
                    </div>
                    <Blocks blocks={jobAdBlocks} label="Job ad blocks" />
                </section>
            )}
        </div>
    );
    return (
        <Panel>
            <Tabs
                aria-label="Editor"
                value={tab}
                onChange={setTab}
                items={[
                    { value: "content", label: "Content", panel: content },
                    { value: "seo", label: "SEO", panel: <p className={styles.muted}>Meta title, description, and the search result preview.</p> },
                    { value: "settings", label: "Settings", panel: <p className={styles.muted}>Job boards, application form, highlight.</p> },
                ]}
            />
        </Panel>
    );
}

function StatusAside() {
    const [published, setPublished] = useState(true);
    return (
        <div className={styles.aside}>
            <Panel title="Status">
                <div className={styles.asideBody}>
                    <Switch
                        checked={published}
                        onChange={setPublished}
                        description={published ? "Saving puts the change live right away." : "Only visible in the admin until you publish."}
                    >
                        Published
                    </Switch>
                    <KeyValueList
                        items={[
                            { key: "Current", value: <StatusIndicator status={published ? "published" : "unpublished"} /> },
                            { key: "Scope", value: "Austria · German" },
                            { key: "Created", value: "02.10.2026" },
                            { key: "Saved", value: "12 min ago" },
                        ]}
                    />
                </div>
            </Panel>
            <Panel title="Archive or delete" description="Archived, it stays in the admin.">
                <div className={styles.dangerActions}>
                    <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="archive" />}>
                        Archive
                    </Button>
                    <Button variant="outlined" color="error" size="small" startIcon={<Icon name="trash" />}>
                        Delete
                    </Button>
                </div>
            </Panel>
        </div>
    );
}

function EditHeader({ kind, compact }: { kind: "page" | "jobAd"; compact: boolean }) {
    const isPage = kind === "page";
    return (
        <PageHeader
            back={isPage ? { label: "Page tree", href: "#page-tree" } : { label: "Job ads", href: "#job-ads" }}
            eyebrow={isPage ? "Page · Austria · German" : "Job ad · Austria · German"}
            title={isPage ? "Careers" : "Senior UX Designer"}
            subtitle={
                <span className={styles.metaLine}>
                    <StatusIndicator status="published" />
                    <span>{isPage ? "/careers" : "JOB-041"}</span>
                    <span>Last saved by Anna Klein</span>
                </span>
            }
            slotProps={compact ? { title: { className: styles.compactTitle } } : undefined}
        />
    );
}

const editActions = (
    <>
        <SaveState state="dirty" />
        <IconButton aria-label="More actions">
            <Icon name="more" />
        </IconButton>
        <Button startIcon={<Icon name="check" />}>Save</Button>
    </>
);

function EditPage({ variant, pane: initialPane, inShell = true }: { variant: Variant; pane?: Pane; inShell?: boolean }) {
    const [pane, setPane] = useState<Pane>(initialPane ?? "editor");
    const kind = variant === "page" ? "page" : "jobAd";
    const layout = (
        <EditLayout
            variant={variant}
            header={<EditHeader kind={kind} compact={variant !== "form"} />}
            preview={<Preview kind={kind} />}
            aside={<StatusAside />}
            asideLabel="Status"
            pane={pane}
            paneSwitch={
                <SegmentedControl
                    aria-label="View"
                    value={pane}
                    onChange={setPane}
                    options={[
                        { value: "preview", label: "Preview", icon: <Icon name="eye" /> },
                        { value: "editor", label: "Edit", icon: <Icon name="edit" /> },
                    ]}
                />
            }
        >
            {variant === "page" ? <PageEditor /> : <FormEditor withBlocks={variant === "formWithBlocks"} />}
        </EditLayout>
    );
    if (!inShell) {
        return layout;
    }
    return (
        <PageTypeShell
            activeId={kind === "page" ? "page-tree" : "job-ads"}
            topBar={{
                mode: "edit",
                back: { label: kind === "page" ? "Back to the page tree" : "Back to job ads", onClick: () => undefined },
                actions: editActions,
            }}
        >
            {layout}
        </PageTypeShell>
    );
}

function Wireframe({ label, variant, regions }: { label: string; variant: Variant; regions: [string, string, string][] }) {
    return (
        <figure className={styles.wireframe}>
            <div className={styles.wireframeFrame} data-variant={variant}>
                {regions.map(([area, number, text]) => (
                    <div key={area} className={styles.wireframeRegion} data-area={area}>
                        <span className={styles.wireframeNumber}>{number}</span>
                        {text}
                    </div>
                ))}
            </div>
            <figcaption>{label}</figcaption>
        </figure>
    );
}

const meta = {
    component: EditLayout,
    title: "Page types/Edit",
    decorators: [themeDecorator],
    parameters: {
        tokens: editLayoutTokens,
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "A page with preview and blocks, and structured content in three form variants. Pages always have the preview on the left and the blocks on the right; each content type picks one of the form variants. The top bar switches to its edit mode with the save state and “Save”.",
            },
            story: { inline: false, height: "960px" },
        },
    },
    args: {
        header: null,
        children: null,
    },
    argTypes: {
        variant: { control: "select", options: ["page", "form", "formWithPreview", "formWithBlocks"] },
        pane: { control: "radio", options: ["editor", "preview"] },
        asideLabel: { control: "text" },
        header: { control: false },
        children: { control: false },
        preview: { control: false },
        aside: { control: false },
        paneSwitch: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <EditPage variant={args.variant ?? "form"} pane={args.pane} />,
} satisfies Meta<typeof EditLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A page: the preview on the left, the panel with the tabs Blocks, SEO, and Settings on the right. A click in the preview selects the
 * block.
 *
 * **Rules**
 *
 * - Do: saving is the only primary action; panel and preview stay in sync.
 * - Don't: put the preview on the right of a page; show more than eight fields without sections.
 */
export const Default: Story = {
    args: { variant: "page" },
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("tab", { name: /SEO/ }));
        await expect(canvas.getByRole("tab", { name: /SEO/ })).toHaveAttribute("aria-selected", "true");
        await userEvent.click(canvas.getByRole("tab", { name: /Blocks/ }));
        await expect(canvas.getByRole("list", { name: "Blocks" })).toBeVisible();
    },
};

/**
 * Structured content as a form: the fields in sections, with status and the danger zone in a side column.
 */
export const Form: Story = {
    args: { variant: "form" },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("complementary", { name: "Status" })).toBeVisible();
    },
};

/**
 * The fields on the left, the preview of the result on the right.
 */
export const FormWithPreview: Story = {
    args: { variant: "formWithPreview" },
};

/**
 * The preview on the left, the fields and the blocks on the right.
 */
export const FormWithBlocks: Story = {
    args: { variant: "formWithBlocks" },
};

/**
 * In narrow layouts only one pane fits: the pane switch chooses between the preview and the editor.
 */
export const NarrowPaneSwitch: Story = {
    args: { variant: "page" },
    parameters: { layout: "padded", docs: { story: { inline: true } } },
    render: () => (
        <div className={styles.narrow}>
            <EditPage variant="page" inShell={false} />
        </div>
    ),
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("tab", { name: /Blocks/ })).toBeVisible();
        await userEvent.click(canvas.getByRole("button", { name: "Preview" }));
        await expect(canvas.queryByRole("tab", { name: /Blocks/ })).toBeNull();
        await expect(canvas.getByText("example.com/careers")).toBeVisible();
    },
};

/**
 * The four variants, the regions of the edit page, and the draft's rules.
 */
export const Structure: Story = {
    parameters: { layout: "padded", docs: { story: { inline: true } } },
    render: () => (
        <PatternPage>
            <PatternSection
                title="Variants"
                description="Pages always with the preview on the left and the blocks on the right. Structured content uses one of the three form variants per content type."
            >
                <div className={styles.wireframes}>
                    <Wireframe
                        label="Page"
                        variant="page"
                        regions={[
                            ["header", "1", "Header · title · status"],
                            ["preview", "2", "Preview"],
                            ["panel", "3", "Blocks · SEO · settings"],
                        ]}
                    />
                    <Wireframe
                        label="Form"
                        variant="form"
                        regions={[
                            ["header", "1", "Header"],
                            ["panel", "4", "Fields in sections"],
                        ]}
                    />
                    <Wireframe
                        label="Form + preview"
                        variant="formWithPreview"
                        regions={[
                            ["header", "1", "Header"],
                            ["panel", "4", "Fields"],
                            ["preview", "2", "Preview"],
                        ]}
                    />
                    <Wireframe
                        label="Form + blocks"
                        variant="formWithBlocks"
                        regions={[
                            ["header", "1", "Header"],
                            ["preview", "2", "Preview"],
                            ["panel", "3", "Fields + blocks"],
                        ]}
                    />
                </div>
            </PatternSection>
            <PatternSection title="Structure">
                <PatternLegend
                    items={[
                        { title: "Header", description: "Back, kind · scope, title, status. The top bar is in its edit mode." },
                        { title: "Preview", description: "Device switch; a click selects the block." },
                        { title: "Panel", description: "Tabs Blocks, SEO, Settings. Breadcrumbs when blocks are nested." },
                        { title: "Form", description: "Fields in sections, with translate and AI at the label." },
                    ]}
                />
            </PatternSection>
            <PatternUses pages={["Blocks & preview", "Form fields", "Loading & save state"]} />
            <PatternRules
                dos={["Saving is the only primary action.", "Panel and preview stay in sync."]}
                donts={["Preview on the right of a page.", "More than eight fields without sections."]}
            />
        </PatternPage>
    ),
};
