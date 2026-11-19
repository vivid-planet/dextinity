import { useState } from "react";

import { AssetThumbnail } from "../../../components/assetThumbnail/AssetThumbnail";
import { Button } from "../../../components/button/Button";
import { DatePicker } from "../../../components/datePicker/DatePicker";
import { Dialog } from "../../../components/dialog/Dialog";
import { EditLayout, type EditLayoutProps } from "../../../components/editLayout/EditLayout";
import { Field } from "../../../components/field/Field";
import { Icon } from "../../../components/icon/Icon";
import { IconButton } from "../../../components/iconButton/IconButton";
import { Input } from "../../../components/input/Input";
import { KeyValueList } from "../../../components/keyValueList/KeyValueList";
import { PageHeader } from "../../../components/pageHeader/PageHeader";
import { Panel } from "../../../components/panel/Panel";
import { Picker } from "../../../components/picker/Picker";
import { RichTextEditor } from "../../../components/richTextEditor/RichTextEditor";
import { SaveState, type SaveStateValue } from "../../../components/saveState/SaveState";
import { SegmentedControl } from "../../../components/segmentedControl/SegmentedControl";
import { Select } from "../../../components/select/Select";
import { StatusIndicator } from "../../../components/statusIndicator/StatusIndicator";
import { Switch } from "../../../components/switch/Switch";
import { Textarea } from "../../../components/textarea/Textarea";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { type Asset, assets, type NewsArticle, newsCategories } from "./cmsData";
import { formatArticleDate } from "./CmsNews";
import styles from "./cmsPrototype.module.scss";
import { SampleSite } from "./SampleSite";

type Pane = NonNullable<EditLayoutProps["pane"]>;

const imageAssets = assets.filter((asset) => asset.type === "image");

function AssetDialog({
    open,
    onOpenChange,
    value,
    onChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    value: Asset | null;
    onChange: (asset: Asset) => void;
}) {
    const [selectedId, setSelectedId] = useState(value?.id);
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title="Choose an image"
            description="From the assets, shared by all scopes."
            size="large"
            footer={
                <>
                    <Button variant="outlined" color="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={selectedId == null}
                        onClick={() => {
                            const asset = imageAssets.find((candidate) => candidate.id === selectedId);
                            if (asset) {
                                onChange(asset);
                            }
                            onOpenChange(false);
                        }}
                    >
                        Choose
                    </Button>
                </>
            }
        >
            <ul className={styles.assetChoices}>
                {imageAssets.map((asset) => (
                    <li key={asset.id}>
                        <button
                            type="button"
                            className={styles.assetChoice}
                            aria-pressed={selectedId === asset.id}
                            onClick={() => setSelectedId(asset.id)}
                            onDoubleClick={() => {
                                onChange(asset);
                                onOpenChange(false);
                            }}
                        >
                            <AssetThumbnail
                                type="image"
                                src={asset.src}
                                badges={asset.badges}
                                title={asset.name}
                                meta={asset.size}
                                selected={selectedId === asset.id}
                            />
                        </button>
                    </li>
                ))}
            </ul>
        </Dialog>
    );
}

export function CmsNewsEditor({ article }: { article?: NewsArticle }) {
    const isNew = article == null;
    const [pane, setPane] = useState<Pane>("editor");
    const [title, setTitle] = useState(article?.title ?? "");
    const [teaser, setTeaser] = useState(article?.teaser ?? "");
    const [category, setCategory] = useState<string | null>(article?.category ?? null);
    const [date, setDate] = useState<string | null>(article?.date ?? "2026-11-19");
    const [image, setImage] = useState<Asset | null>(() =>
        article ? (assets.find((asset) => asset.src === article.image && asset.type === "image") ?? null) : null,
    );
    const [body, setBody] = useState(
        article
            ? `<p>${article.teaser}</p><h2>What changes</h2><p>Editors see the result while they type, and every change is saved as a draft until it is published.</p><ul><li>Faster editing</li><li>Fewer clicks</li><li>Clear status</li></ul>`
            : "",
    );
    const [published, setPublished] = useState(article?.status === "published");
    const [assetDialogOpen, setAssetDialogOpen] = useState(false);
    const [saveState, setSaveState] = useState<SaveStateValue>(isNew ? "dirty" : "saved");

    function change<Value>(setValue: (value: Value) => void) {
        return (value: Value) => {
            setValue(value);
            setSaveState("dirty");
        };
    }

    const status = article?.status === "archived" ? "archived" : published ? "published" : "unpublished";

    return (
        <PageTypeShell currentId="news">
            <EditLayout
                variant="formWithPreview"
                header={
                    <PageHeader
                        variant="compact"
                        back={{ label: "Back to news", href: "#news" }}
                        eyebrow="News · Austria · German"
                        title={title || "New article"}
                        subtitle={
                            <span className={styles.metaLine}>
                                <StatusIndicator status={status} />
                                {article && <span>Last saved by {article.author}</span>}
                            </span>
                        }
                        actions={
                            <>
                                <SaveState state={saveState} />
                                <IconButton variant="text" color="secondary" aria-label="More actions">
                                    <Icon name="more-horizontal" />
                                </IconButton>
                                <Button
                                    startIcon={<Icon name="check" />}
                                    onClick={() => {
                                        setSaveState("saving");
                                        window.setTimeout(() => setSaveState("saved"), 800);
                                    }}
                                >
                                    Save
                                </Button>
                            </>
                        }
                    />
                }
                preview={
                    <SampleSite url={`example.com/news/${article?.id ?? "new-article"}`} image={image?.src}>
                        <article className={styles.siteArticle}>
                            <span className={styles.siteMeta}>{[category, date && formatArticleDate(date)].filter(Boolean).join(" · ")}</span>
                            <h1>{title || "Untitled article"}</h1>
                            <p className={styles.siteLead}>{teaser}</p>
                            {/* The editor's own HTML, shown as the site would render it */}
                            <div dangerouslySetInnerHTML={{ __html: body }} />
                        </article>
                    </SampleSite>
                }
                pane={pane}
                paneSwitch={
                    <SegmentedControl
                        aria-label="View"
                        value={pane}
                        onChange={setPane}
                        options={[
                            { value: "editor", label: "Edit", icon: <Icon name="edit" /> },
                            { value: "preview", label: "Preview", icon: <Icon name="eye" /> },
                        ]}
                    />
                }
            >
                <Panel>
                    <div className={styles.sections}>
                        <section className={styles.section}>
                            <div className={styles.sectionHead}>
                                <h3>Article</h3>
                                <p>Title, teaser, and image appear in the news list and in teasers.</p>
                            </div>
                            <div className={styles.fields}>
                                <Field className={styles.full} label="Title" required>
                                    <Input name="title" value={title} onChange={(event) => change(setTitle)(event.target.value)} />
                                </Field>
                                <Field label="Category">
                                    <Select
                                        name="category"
                                        value={category}
                                        onChange={change(setCategory)}
                                        options={newsCategories.map((value) => ({ value, label: value }))}
                                    />
                                </Field>
                                <Field label="Date">
                                    <DatePicker name="date" value={date} onChange={change(setDate)} />
                                </Field>
                                <Field className={styles.full} label="Teaser">
                                    <Textarea
                                        name="teaser"
                                        rows={3}
                                        value={teaser}
                                        onChange={(event) => change(setTeaser)(event.target.value)}
                                        showCount
                                        maxLength={200}
                                    />
                                </Field>
                                <Field className={styles.full} label="Image" description="Choose from the assets.">
                                    <Picker<Asset>
                                        value={image}
                                        renderValue={(asset) => asset.name}
                                        icon={<Icon name="image" />}
                                        placeholder="No image"
                                        onOpen={() => setAssetDialogOpen(true)}
                                        onClear={() => change(setImage)(null)}
                                    />
                                </Field>
                            </div>
                        </section>
                        <section className={styles.section}>
                            <div className={styles.sectionHead}>
                                <h3>Text</h3>
                            </div>
                            <Field label="Body" layout="stacked">
                                <RichTextEditor name="body" value={body} onChange={change(setBody)} minRows={8} />
                            </Field>
                        </section>
                        <section className={styles.section}>
                            <div className={styles.sectionHead}>
                                <h3>Publishing</h3>
                            </div>
                            <Switch
                                checked={published}
                                onChange={change(setPublished)}
                                description={published ? "Saving puts the change live right away." : "Only visible in the admin until you publish."}
                            >
                                Published
                            </Switch>
                            <KeyValueList
                                items={[
                                    { key: "Author", value: article?.author ?? "Max Mustermann" },
                                    { key: "Scope", value: "Austria · German" },
                                    { key: "Shown on", value: <a href="#page-tree/newsroom">Newsroom</a> },
                                ]}
                            />
                        </section>
                    </div>
                </Panel>
            </EditLayout>
            {assetDialogOpen && <AssetDialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen} value={image} onChange={change(setImage)} />}
        </PageTypeShell>
    );
}
