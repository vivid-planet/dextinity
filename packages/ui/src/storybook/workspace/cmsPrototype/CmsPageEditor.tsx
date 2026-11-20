import { type ReactNode, useState } from "react";

import { Block } from "../../../components/blockList/Block";
import { BlockList } from "../../../components/blockList/BlockList";
import { EditLayout, type EditLayoutProps } from "../../../components/editLayout/EditLayout";
import { Field } from "../../../components/field/Field";
import { Icon } from "../../../components/icon/Icon";
import { Input } from "../../../components/input/Input";
import { PageHeader } from "../../../components/pageHeader/PageHeader";
import { Panel } from "../../../components/panel/Panel";
import { SaveState, type SaveStateValue } from "../../../components/saveState/SaveState";
import { SegmentedControl } from "../../../components/segmentedControl/SegmentedControl";
import { Select } from "../../../components/select/Select";
import { StatusIndicator } from "../../../components/statusIndicator/StatusIndicator";
import { Switch } from "../../../components/switch/Switch";
import { Tabs } from "../../../components/tabs/Tabs";
import { Textarea } from "../../../components/textarea/Textarea";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { landscapeImage } from "../../sampleImages";
import { findPageTrail, type SitePage } from "./cmsData";
import styles from "./cmsPrototype.module.scss";
import { SampleSite } from "./SampleSite";

type Pane = NonNullable<EditLayoutProps["pane"]>;

interface PageBlock {
    id: string;
    type: "stage" | "text" | "teasers" | "cta";
    title: string;
    text: string;
}

const blockTypes: Record<PageBlock["type"], { label: string; icon: ReactNode }> = {
    stage: { label: "Stage", icon: <Icon name="image" /> },
    text: { label: "Text", icon: <Icon name="paragraph" /> },
    teasers: { label: "Teaser list", icon: <Icon name="columns-3" /> },
    cta: { label: "Call to action", icon: <Icon name="arrow-right" /> },
};

function initialBlocks(page: SitePage): PageBlock[] {
    return [
        { id: "stage", type: "stage", title: page.label, text: "Software that lasts, made in Austria." },
        {
            id: "text",
            type: "text",
            title: `Welcome to ${page.label}`,
            text: "We build digital products that stay in use for many years. Find out what we offer and how we work.",
        },
        { id: "teasers", type: "teasers", title: "What we do", text: "Content management · Commerce · Analytics" },
        { id: "cta", type: "cta", title: "Get in touch", text: "/contact" },
    ];
}

function BlockFields({ block, onChange }: { block: PageBlock; onChange: (block: PageBlock) => void }) {
    return (
        <div className={styles.blockFields}>
            <Field label={block.type === "cta" ? "Button label" : "Heading"}>
                <Input name={`${block.id}-title`} value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} />
            </Field>
            <Field label={block.type === "cta" ? "Link" : block.type === "teasers" ? "Teasers" : "Text"}>
                {block.type === "cta" ? (
                    <Input name={`${block.id}-text`} value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} />
                ) : (
                    <Textarea
                        name={`${block.id}-text`}
                        rows={3}
                        value={block.text}
                        onChange={(event) => onChange({ ...block, text: event.target.value })}
                    />
                )}
            </Field>
        </div>
    );
}

function PreviewBlock({ block, selected, onSelect }: { block: PageBlock; selected: boolean; onSelect: () => void }) {
    return (
        <button
            type="button"
            className={styles.previewBlock}
            data-selected={selected ? "" : undefined}
            onClick={onSelect}
            aria-label={`Select ${block.title}`}
        >
            {block.type === "stage" && (
                <>
                    <h1>{block.title}</h1>
                    <p>{block.text}</p>
                </>
            )}
            {block.type === "text" && (
                <>
                    <h2>{block.title}</h2>
                    <p>{block.text}</p>
                </>
            )}
            {block.type === "teasers" && (
                <>
                    <h2>{block.title}</h2>
                    <span className={styles.siteTeasers}>
                        {block.text.split("·").map((teaser) => (
                            <span key={teaser} className={styles.siteTeaser}>
                                {teaser.trim()}
                            </span>
                        ))}
                    </span>
                </>
            )}
            {block.type === "cta" && <span className={styles.siteButton}>{block.title}</span>}
        </button>
    );
}

function SeoFields({ page }: { page: SitePage }) {
    const [metaTitle, setMetaTitle] = useState(`${page.label} · Example Inc.`);
    const [metaDescription, setMetaDescription] = useState("Software that lasts: content management, commerce, and analytics from Vienna.");
    return (
        <div className={styles.tabFields}>
            <Field label="Meta title" description="Shown as the title in search results.">
                <Input name="metaTitle" value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} />
            </Field>
            <Field label="Meta description">
                <Textarea
                    name="metaDescription"
                    rows={3}
                    value={metaDescription}
                    onChange={(event) => setMetaDescription(event.target.value)}
                    showCount
                    maxLength={160}
                />
            </Field>
            <div className={styles.searchResult} aria-label="Search result preview">
                <span className={styles.searchResultUrl}>example.com{page.path}</span>
                <span className={styles.searchResultTitle}>{metaTitle}</span>
                <span>{metaDescription}</span>
            </div>
        </div>
    );
}

function SettingsFields({ page }: { page: SitePage }) {
    const [slug, setSlug] = useState(page.path?.split("/").pop() ?? "");
    const [template, setTemplate] = useState<string | null>(page.template ?? "Content page");
    const [hiddenInMenu, setHiddenInMenu] = useState(page.hiddenInMenu ?? false);
    return (
        <div className={styles.tabFields}>
            <Field label="URL path" prefix={`example.com${page.path?.split("/").slice(0, -1).join("/") ?? ""}/`}>
                <Input name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
            </Field>
            <Field label="Template">
                <Select
                    name="template"
                    value={template}
                    onChange={setTemplate}
                    options={["Home", "Overview", "Content page", "News list", "Form"].map((value) => ({ value, label: value }))}
                />
            </Field>
            <Switch checked={hiddenInMenu} onChange={setHiddenInMenu} description="The page stays reachable by its address.">
                Hide in the main navigation
            </Switch>
        </div>
    );
}

export function CmsPageEditor({ page }: { page: SitePage }) {
    const [pane, setPane] = useState<Pane>("editor");
    const [tab, setTab] = useState("blocks");
    const [blocks, setBlocks] = useState(() => initialBlocks(page));
    const [selectedId, setSelectedId] = useState<string | null>(blocks[0].id);
    const [hiddenIds, setHiddenIds] = useState<string[]>([]);
    const [saveState, setSaveState] = useState<SaveStateValue>("saved");
    const trail = findPageTrail(page.id) ?? [];

    function updateBlock(updated: PageBlock) {
        setBlocks((current) => current.map((block) => (block.id === updated.id ? updated : block)));
        setSaveState("dirty");
    }

    function selectBlock(id: string) {
        setSelectedId(id);
        setTab("blocks");
    }

    return (
        <PageTypeShell currentId="page-tree">
            <EditLayout
                variant="page"
                header={
                    <PageHeader
                        variant="compact"
                        back={{ label: "Back to the page tree", href: "#page-tree" }}
                        eyebrow={["Page", ...trail.map((ancestor) => ancestor.label)].join(" · ")}
                        title={page.label}
                        status={<StatusIndicator status={page.status ?? "published"} />}
                        subtitle={
                            <span className={styles.metaLine}>
                                <span>{page.path}</span>
                                <span>Last saved by {page.editor ?? "Anna Klein"}</span>
                            </span>
                        }
                        actionStatus={<SaveState state={saveState} />}
                        secondaryActions={[
                            { label: "Preview on the website", icon: <Icon name="external-link" /> },
                            { label: "Duplicate", icon: <Icon name="copy" /> },
                            { label: "Move …", icon: <Icon name="folder" /> },
                            { label: "Delete …", icon: <Icon name="trash" />, color: "error", separatorBefore: true },
                        ]}
                        primaryAction={{
                            label: "Save",
                            icon: <Icon name="check" />,
                            onClick: () => {
                                setSaveState("saving");
                                window.setTimeout(() => setSaveState("saved"), 800);
                            },
                        }}
                    />
                }
                preview={
                    <SampleSite url={`example.com${page.path ?? ""}`} image={landscapeImage}>
                        {blocks
                            .filter((block) => !hiddenIds.includes(block.id))
                            .map((block) => (
                                <PreviewBlock
                                    key={block.id}
                                    block={block}
                                    selected={selectedId === block.id}
                                    onSelect={() => selectBlock(block.id)}
                                />
                            ))}
                    </SampleSite>
                }
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
                <Panel>
                    <Tabs
                        aria-label="Editor"
                        value={tab}
                        onChange={setTab}
                        items={[
                            {
                                value: "blocks",
                                label: "Blocks",
                                count: blocks.length,
                                panel: (
                                    <BlockList
                                        aria-label="Blocks"
                                        onReorder={(fromIndex, toIndex) => {
                                            setBlocks((current) => {
                                                const next = [...current];
                                                const [moved] = next.splice(fromIndex, 1);
                                                next.splice(toIndex, 0, moved);
                                                return next;
                                            });
                                            setSaveState("dirty");
                                        }}
                                        onAdd={() => undefined}
                                    >
                                        {blocks.map((block) => (
                                            <Block
                                                key={block.id}
                                                title={block.title}
                                                summary={blockTypes[block.type].label}
                                                icon={blockTypes[block.type].icon}
                                                selected={selectedId === block.id}
                                                expanded={selectedId === block.id}
                                                onExpandedChange={(expanded) => setSelectedId(expanded ? block.id : null)}
                                                onSelect={() => setSelectedId(selectedId === block.id ? null : block.id)}
                                                visible={!hiddenIds.includes(block.id)}
                                                onVisibleChange={(visible) => {
                                                    setHiddenIds((ids) => (visible ? ids.filter((id) => id !== block.id) : [...ids, block.id]));
                                                    setSaveState("dirty");
                                                }}
                                            >
                                                <BlockFields block={block} onChange={updateBlock} />
                                            </Block>
                                        ))}
                                    </BlockList>
                                ),
                            },
                            { value: "seo", label: "SEO", panel: <SeoFields page={page} /> },
                            { value: "settings", label: "Settings", panel: <SettingsFields page={page} /> },
                        ]}
                    />
                </Panel>
            </EditLayout>
        </PageTypeShell>
    );
}
