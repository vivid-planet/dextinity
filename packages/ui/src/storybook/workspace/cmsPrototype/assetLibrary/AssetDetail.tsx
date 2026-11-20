import { type CSSProperties, Fragment, type ReactNode, useEffect, useState } from "react";

import { Avatar } from "../../../../components/avatar/Avatar";
import { Button } from "../../../../components/button/Button";
import { ConfirmDialog } from "../../../../components/confirmDialog/ConfirmDialog";
import { EmptyState } from "../../../../components/emptyState/EmptyState";
import { Field } from "../../../../components/field/Field";
import { FocalPointPicker } from "../../../../components/focalPointPicker/FocalPointPicker";
import { Icon } from "../../../../components/icon/Icon";
import { IconButton } from "../../../../components/iconButton/IconButton";
import { Input } from "../../../../components/input/Input";
import { KeyValueList } from "../../../../components/keyValueList/KeyValueList";
import { Menu } from "../../../../components/menu/Menu";
import { MenuItem } from "../../../../components/menu/MenuItem";
import { MenuSeparator } from "../../../../components/menu/MenuSeparator";
import { MenuSubmenu } from "../../../../components/menu/MenuSubmenu";
import { Panel } from "../../../../components/panel/Panel";
import { SaveState, type SaveStateValue } from "../../../../components/saveState/SaveState";
import { SegmentedControl } from "../../../../components/segmentedControl/SegmentedControl";
import { Tabs } from "../../../../components/tabs/Tabs";
import { Textarea } from "../../../../components/textarea/Textarea";
import { Tooltip } from "../../../../components/tooltip/Tooltip";
import { PageTypeShell } from "../../../pageTypes/PageTypeShell";
import { usePrototypeNavigation } from "../../../pageTypes/prototypeNavigation";
import styles from "./assetDetail.module.scss";
import { useAssetLibrary } from "./AssetLibraryContext";
import {
    type AssetCrop,
    describeAsset,
    formatBytes,
    formatDuration,
    formatModified,
    getExtension,
    getFolderTrail,
    kindLabels,
    type LibraryAsset,
} from "./assetLibraryData";
import { AssetPreview } from "./LibraryItems";
import { fileItemId } from "./libraryView";
import { MoveToFolderMenu } from "./MoveToFolderMenu";
import { useLibraryActions } from "./useLibraryActions";

type Draft = Pick<LibraryAsset, "name" | "alt" | "title" | "focalPoint" | "focalPointAuto" | "crop" | "aiGenerated" | "copyright">;

function toDraft(asset: LibraryAsset): Draft {
    const { name, alt, title, focalPoint, focalPointAuto, crop, aiGenerated, copyright } = asset;
    return { name, alt, title, focalPoint, focalPointAuto, crop, aiGenerated, copyright };
}

const cropRatios: Record<Exclude<AssetCrop, "free">, number> = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1 };

/** The crop frame on the image, as fractions of its width and height, centered on the focal point as far as the image allows. */
function getCropFrame(asset: LibraryAsset, draft: Draft) {
    if (draft.crop === "free" || asset.width == null || asset.height == null) {
        return undefined;
    }
    const imageRatio = asset.width / asset.height;
    const ratio = cropRatios[draft.crop];
    const width = ratio > imageRatio ? 1 : ratio / imageRatio;
    const height = ratio > imageRatio ? imageRatio / ratio : 1;
    const clamp = (value: number, size: number) => Math.min(1 - size, Math.max(0, value - size / 2));
    return { x: clamp(draft.focalPoint.x, width), y: clamp(draft.focalPoint.y, height), width, height };
}

/** The optional actions at a field's label: translate and improve with AI. Both are still under review, so they stay a slot. */
function TextFieldActions({ onTranslate, onImprove }: { onTranslate: () => void; onImprove: () => void }) {
    return (
        <span className={styles.fieldActions}>
            <Tooltip content="Translate">
                <IconButton variant="text" color="secondary" size="small" aria-label="Translate" onClick={onTranslate}>
                    <Icon name="translate" />
                </IconButton>
            </Tooltip>
            <Tooltip content="Improve with AI">
                <IconButton variant="text" color="secondary" size="small" aria-label="Improve with AI" onClick={onImprove}>
                    <Icon name="spark" />
                </IconButton>
            </Tooltip>
        </span>
    );
}

function DocumentMedia({ asset }: { asset: LibraryAsset }) {
    const [page, setPage] = useState(1);
    const pages = asset.pages ?? 1;
    return (
        <div className={styles.documentMedia}>
            <div className={styles.sheet} data-landscape={asset.landscape ? "" : undefined}>
                <img src={asset.src} alt={`Page ${page} of ${asset.name}`} />
                <span className={styles.pageNumber}>{page}</span>
            </div>
            <div className={styles.pager}>
                <IconButton
                    variant="outlined"
                    color="secondary"
                    size="small"
                    aria-label="Previous page"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    <Icon name="chevron-left" />
                </IconButton>
                <span aria-live="polite">
                    {page} / {pages}
                </span>
                <IconButton
                    variant="outlined"
                    color="secondary"
                    size="small"
                    aria-label="Next page"
                    disabled={page === pages}
                    onClick={() => setPage(page + 1)}
                >
                    <Icon name="chevron-right" />
                </IconButton>
            </div>
        </div>
    );
}

const previewRatios = ["16:9", "4:3", "1:1", "9:16"];

/** How the image is cropped in the common formats, centered on the focal point; follows the point live. */
function CropPreviews({ asset, draft }: { asset: LibraryAsset; draft: Draft }) {
    return (
        <Panel title="How it gets cropped" className={styles.cropCard}>
            <div className={styles.cropPreviews}>
                {previewRatios.map((ratio) => (
                    <figure key={ratio} className={styles.cropPreview} style={{ "--ratio": ratio.replace(":", " / ") } as CSSProperties}>
                        <img src={asset.src} alt="" style={{ objectPosition: `${draft.focalPoint.x * 100}% ${draft.focalPoint.y * 100}%` }} />
                        <figcaption>{ratio}</figcaption>
                    </figure>
                ))}
            </div>
        </Panel>
    );
}

function Media({
    asset,
    draft,
    onFocalPointChange,
}: {
    asset: LibraryAsset;
    draft: Draft;
    onFocalPointChange: (point: Draft["focalPoint"]) => void;
}) {
    if (asset.kind === "document") {
        return <DocumentMedia asset={asset} />;
    }
    if (asset.kind === "video") {
        return (
            <video
                className={styles.video}
                controls
                poster={asset.src}
                style={{ "--image-ratio": `${(asset.width ?? 16) / (asset.height ?? 9)}` } as CSSProperties}
            >
                <track kind="captions" />
            </video>
        );
    }
    if (asset.kind === "audio") {
        return (
            <div className={styles.audioCard}>
                <img className={styles.waveform} src={asset.src} alt="" />
                <div>
                    <div className={styles.strong}>{asset.name}</div>
                    <div className={styles.muted}>
                        {getExtension(asset.name)} audio, {formatDuration(asset.duration ?? 0)}
                    </div>
                </div>
                <audio className={styles.audio} controls aria-label={asset.name}>
                    <track kind="captions" />
                </audio>
            </div>
        );
    }
    const frame = getCropFrame(asset, draft);
    return (
        <div className={styles.imageMedia}>
            <FocalPointPicker
                className={styles.focalPointPicker}
                src={asset.src}
                alt={draft.alt}
                value={draft.focalPoint}
                onChange={onFocalPointChange}
                auto={draft.focalPointAuto}
                ratios={[]}
                slotProps={{
                    stage: {
                        className: frame ? `${styles.stage} ${styles.croppedStage}` : styles.stage,
                        style: {
                            "--image-ratio": `${(asset.width ?? 1) / (asset.height ?? 1)}`,
                            "--image-width": `${asset.width ?? 2000}px`,
                            ...(frame && {
                                "--crop-x": `${frame.x * 100}%`,
                                "--crop-y": `${frame.y * 100}%`,
                                "--crop-width": `${frame.width * 100}%`,
                                "--crop-height": `${frame.height * 100}%`,
                            }),
                        } as CSSProperties,
                    },
                }}
            />
        </div>
    );
}

function SettingsTab({
    asset,
    draft,
    change,
    onFieldAction,
}: {
    asset: LibraryAsset;
    draft: Draft;
    change: (changes: Partial<Draft>) => void;
    onFieldAction: (field: "alt" | "title", action: "translate" | "improve") => void;
}) {
    const isImage = asset.kind === "image";
    const altMissing = draft.alt.trim() === "";
    return (
        <div className={styles.fields}>
            {isImage && (
                <Field
                    label="Alt text"
                    state={altMissing ? "warning" : undefined}
                    description={
                        altMissing
                            ? "Still missing. Without alt text, screen readers only read out the file name."
                            : "Describes the image for screen readers and search engines. Per language."
                    }
                    actions={
                        <TextFieldActions onTranslate={() => onFieldAction("alt", "translate")} onImprove={() => onFieldAction("alt", "improve")} />
                    }
                >
                    <Textarea name="alt" rows={3} value={draft.alt} onChange={(event) => change({ alt: event.target.value })} />
                </Field>
            )}
            <Field
                label="Title"
                actions={
                    <TextFieldActions onTranslate={() => onFieldAction("title", "translate")} onImprove={() => onFieldAction("title", "improve")} />
                }
            >
                <Input name="title" placeholder="Optional" value={draft.title} onChange={(event) => change({ title: event.target.value })} />
            </Field>
            {isImage && (
                <Field
                    label="Focal point"
                    layout="group"
                    description={
                        draft.focalPointAuto
                            ? "Detects the subject. Click into the image to choose yourself."
                            : "Clicking or dragging in the image sets the point."
                    }
                >
                    <SegmentedControl
                        value={draft.focalPointAuto ? "auto" : "manual"}
                        onChange={(value) =>
                            change({ focalPointAuto: value === "auto", focalPoint: value === "auto" ? { x: 0.5, y: 0.45 } : draft.focalPoint })
                        }
                        options={[
                            { value: "auto", label: "Automatic" },
                            { value: "manual", label: "Manual" },
                        ]}
                    />
                </Field>
            )}
            {isImage && (
                <Field label="Crop" layout="group" description="Applies when the image is used without a fixed format.">
                    <SegmentedControl<AssetCrop>
                        value={draft.crop}
                        onChange={(crop) => change({ crop })}
                        options={[
                            { value: "free", label: "Free" },
                            { value: "16:9", label: "16:9" },
                            { value: "4:3", label: "4:3" },
                            { value: "1:1", label: "1:1" },
                        ]}
                    />
                </Field>
            )}
            <Field label="AI-generated" layout="group" description="Labeled under the EU AI Act, Art. 50. Shown on the website.">
                <SegmentedControl
                    value={draft.aiGenerated ? "yes" : "no"}
                    onChange={(value) => change({ aiGenerated: value === "yes" })}
                    options={[
                        { value: "no", label: "No" },
                        { value: "yes", label: "Yes" },
                    ]}
                />
            </Field>
            <Field label="Copyright">
                <Input name="copyright" value={draft.copyright} onChange={(event) => change({ copyright: event.target.value })} />
            </Field>
        </div>
    );
}

function InfoTab({ asset }: { asset: LibraryAsset }) {
    const { folders } = useAssetLibrary();
    const measure: { key: string; value: ReactNode } =
        asset.kind === "document"
            ? { key: "Pages", value: asset.pages }
            : asset.kind === "audio"
              ? { key: "Duration", value: formatDuration(asset.duration ?? 0) }
              : {
                    key: "Dimensions",
                    value: `${asset.width} × ${asset.height}${asset.kind === "video" ? `, ${formatDuration(asset.duration ?? 0)}` : ""}`,
                };
    return (
        <KeyValueList
            className={styles.info}
            items={[
                { key: "File name", value: <span className={styles.mono}>{asset.name}</span> },
                { key: "Type", value: `${kindLabels[asset.kind]} (${getExtension(asset.name)})` },
                measure,
                { key: "Size", value: formatBytes(asset.bytes) },
                {
                    key: "Folder",
                    value: getFolderTrail(folders, asset.folderId)
                        .map((folder) => folder.name)
                        .join(" / "),
                },
                { key: "Valid for", value: "All scopes" },
                {
                    key: "Uploaded",
                    value: (
                        <span className={styles.uploaded}>
                            {formatModified(asset.modified)}
                            <Avatar name={asset.uploadedBy} size="small" tooltip />
                        </span>
                    ),
                },
            ]}
        />
    );
}

function UsagesTab({ asset }: { asset: LibraryAsset }) {
    if (asset.usages.length === 0) {
        return <EmptyState icon={<Icon name="unlink" />} title="Not used anywhere" description="Can be archived without changing any page." />;
    }
    return (
        <div className={styles.cardList}>
            {asset.usages.map((usage) => (
                <a key={`${usage.href}-${usage.block}`} className={styles.usage} href={usage.href}>
                    <span className={styles.usageIcon} aria-hidden>
                        <Icon name="page" />
                    </span>
                    <span className={styles.usageText}>
                        <span className={styles.strong}>{usage.page}</span>
                        <span className={styles.mono}>{usage.path}</span>
                    </span>
                    <span className={styles.muted}>{usage.block}</span>
                    <Icon name="arrow-right" size="small" />
                </a>
            ))}
            <p className={styles.note}>
                <Icon name="globe" size="small" />
                Counted across all scopes.
            </p>
        </div>
    );
}

function DuplicatesTab({ duplicates }: { duplicates: LibraryAsset[] }) {
    if (duplicates.length === 0) {
        return <EmptyState icon={<Icon name="copy" />} title="No duplicates" description="There is no other file with identical content." />;
    }
    return (
        <div className={styles.cardList}>
            {duplicates.map((duplicate) => (
                <div key={duplicate.id} className={styles.duplicate}>
                    <span className={styles.duplicatePreview}>
                        <AssetPreview asset={duplicate} />
                    </span>
                    <span className={styles.usageText}>
                        <span className={styles.strong}>{duplicate.name}</span>
                        <span className={styles.muted}>Identical content · {describeAsset(duplicate)}</span>
                    </span>
                    <Button variant="outlined" color="secondary" size="small" href={`#assets/${duplicate.id}`}>
                        Open
                    </Button>
                </div>
            ))}
        </div>
    );
}

/**
 * The detail page of an asset: the preview by type on the left, its settings, infos, usages, and duplicates on the right. Changes
 * apply to all scopes once saved; leaving with unsaved changes asks first.
 */
export function AssetDetail({ assetId }: { assetId: string }) {
    const { assets, folders, updateAsset, addToast, undoToast, setLocation } = useAssetLibrary();
    const actions = useLibraryActions();

    // The path leads to that folder in the library; leaving with unsaved changes still asks first
    function openInLibrary(folderId: string | null) {
        setLocation((current) => ({ ...current, folderId, flat: false, smartFilter: null, search: "", page: 1 }));
    }
    const prototype = usePrototypeNavigation();
    const asset = assets.find((candidate) => candidate.id === assetId);
    const [saved, setSaved] = useState<Draft | undefined>(asset && toDraft(asset));
    const [draft, setDraft] = useState<Draft | undefined>(saved);
    const [saveState, setSaveState] = useState<SaveStateValue>("saved");
    const [tab, setTab] = useState("settings");
    const [moreOpen, setMoreOpen] = useState(false);
    const [moveOpen, setMoveOpen] = useState(false);
    const [leave, setLeave] = useState<(() => void) | null>(null);
    const dirty = draft != null && JSON.stringify(draft) !== JSON.stringify(saved);

    function save() {
        if (asset == null || draft == null) {
            return;
        }
        updateAsset(asset.id, draft);
        setSaved(draft);
        setSaveState("saved");
        addToast({ message: "Saved, applies to all scopes" });
    }

    useEffect(() => {
        prototype?.setLeaveGuard?.(dirty ? (leavePage) => setLeave(() => leavePage) : null);
    }, [dirty, prototype]);

    useEffect(() => {
        const handleKeyDown = (event: globalThis.KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                if (dirty) {
                    save();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    if (asset == null || draft == null) {
        return (
            <PageTypeShell currentId="assets">
                <EmptyState
                    icon={<Icon name="file-cross" />}
                    title="This asset doesn't exist anymore"
                    actions={
                        <Button variant="outlined" color="secondary" href="#assets">
                            Back to the assets
                        </Button>
                    }
                />
            </PageTypeShell>
        );
    }

    const item = { type: "file" as const, id: fileItemId(asset.id), asset };
    const duplicates = assets.filter((candidate) => candidate.contentHash === asset.contentHash && candidate.id !== asset.id);
    const change = (changes: Partial<Draft>) => {
        setDraft({ ...draft, ...changes });
        setSaveState("dirty");
    };

    function fieldAction(field: "alt" | "title", action: "translate" | "improve") {
        const before = draft;
        const suggestion =
            action === "translate"
                ? `${draft?.[field] || asset?.name.replace(/[-_]/g, " ").replace(/\.[a-z0-9]+$/i, "")} (DE)`
                : `${asset?.kind === "image" ? "Photo: " : ""}${asset?.name.replace(/[-_]/g, " ").replace(/\.[a-z0-9]+$/i, "")}`;
        undoToast.perform({
            run: () => change({ [field]: suggestion }),
            undo: () => setDraft(before),
            message: `${action === "translate" ? "Translated" : "Improved with AI"} · please review`,
        });
    }

    const meta = [
        asset.kind === "image"
            ? `${asset.width} × ${asset.height}, ${formatBytes(asset.bytes)}`
            : `${describeAsset(asset)}, ${formatBytes(asset.bytes)}`,
        asset.usages.length > 0 ? `${asset.usages.length} ${asset.usages.length === 1 ? "usage" : "usages"}` : "not used",
    ];

    return (
        <PageTypeShell currentId="assets">
            <div className={styles.page}>
                <header className={styles.header}>
                    <div className={styles.heading}>
                        <nav aria-label="Location" className={styles.context}>
                            <Icon name="arrow-left" size="small" />
                            {[{ id: null, name: "Assets" }, ...getFolderTrail(folders, asset.folderId)].map((segment, index) => (
                                <Fragment key={segment.id ?? "root"}>
                                    {index > 0 && <span aria-hidden>/</span>}
                                    <a href="#assets" className={styles.back} onClick={() => openInLibrary(segment.id)}>
                                        {segment.name}
                                    </a>
                                </Fragment>
                            ))}
                            <span aria-hidden>·</span>
                            <span>Global</span>
                        </nav>
                        <h1 className={styles.titleHeading}>
                            <input
                                className={styles.titleInput}
                                aria-label="File name"
                                value={draft.name}
                                onChange={(event) => change({ name: event.target.value })}
                            />
                        </h1>
                        <div className={styles.meta}>
                            {meta.map((part) => (
                                <span key={part}>{part}</span>
                            ))}
                            {draft.aiGenerated && <span className={styles.aiBadge}>AI-generated</span>}
                            {asset.archived && <span className={styles.archivedBadge}>Archived</span>}
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <SaveState state={dirty ? "dirty" : saveState} />
                        <Tooltip content="Download">
                            <IconButton variant="outlined" color="secondary" aria-label="Download" onClick={() => actions.download([item])}>
                                <Icon name="download" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            open={moreOpen}
                            onOpenChange={setMoreOpen}
                            placement="bottom-end"
                            trigger={
                                <IconButton variant="outlined" color="secondary" aria-label="More actions">
                                    <Icon name="more-horizontal" />
                                </IconButton>
                            }
                        >
                            <MenuItem label="Download" icon={<Icon name="download" />} onClick={() => actions.download([item])} />
                            <MenuItem
                                label="Replace file …"
                                icon={<Icon name="swap" />}
                                onClick={() => addToast({ message: "Replacing keeps the usages and the focal point", color: "info" })}
                            />
                            <MenuSubmenu label="Move …" icon={<Icon name="folder" />} open={moveOpen} onOpenChange={setMoveOpen}>
                                <MoveToFolderMenu
                                    folders={folders}
                                    isDisabled={(folderId) => folderId == null || folderId === asset.folderId}
                                    onMove={(folderId, folderName) => actions.move([item], folderId, folderName)}
                                />
                            </MenuSubmenu>
                            <MenuSeparator />
                            {asset.archived ? (
                                <MenuItem label="Restore" icon={<Icon name="restore" />} onClick={() => actions.setArchived([item], false)} />
                            ) : (
                                <MenuItem label="Archive" icon={<Icon name="archive" />} onClick={() => actions.setArchived([item], true)} />
                            )}
                            <MenuItem
                                label="Delete …"
                                icon={<Icon name="trash" />}
                                color="error"
                                onClick={() =>
                                    actions.remove([item], () => {
                                        prototype?.setLeaveGuard?.(null);
                                        prototype?.navigate("assets");
                                    })
                                }
                            />
                        </Menu>
                        <Tooltip content="Save, applies to all scopes" keyboardShortcut="mod+s">
                            <Button startIcon={<Icon name="check" />} disabled={!dirty} onClick={save}>
                                Save
                            </Button>
                        </Tooltip>
                    </div>
                </header>
                <div className={styles.body}>
                    <div className={styles.mediaColumn}>
                        <Panel className={styles.mediaCard}>
                            <Media asset={asset} draft={draft} onFocalPointChange={(focalPoint) => change({ focalPoint, focalPointAuto: false })} />
                        </Panel>
                        {asset.kind === "image" && <CropPreviews asset={asset} draft={draft} />}
                    </div>
                    <Panel className={styles.sideCard}>
                        <Tabs
                            aria-label="Asset"
                            value={tab}
                            onChange={setTab}
                            items={[
                                {
                                    value: "settings",
                                    label: "Settings",
                                    panel: <SettingsTab asset={asset} draft={draft} change={change} onFieldAction={fieldAction} />,
                                },
                                { value: "info", label: "Info", panel: <InfoTab asset={asset} /> },
                                { value: "usages", label: "Usages", count: asset.usages.length || undefined, panel: <UsagesTab asset={asset} /> },
                                {
                                    value: "duplicates",
                                    label: "Duplicates",
                                    count: duplicates.length || undefined,
                                    panel: <DuplicatesTab duplicates={duplicates} />,
                                },
                            ]}
                        />
                    </Panel>
                </div>
            </div>
            <ConfirmDialog
                open={leave != null}
                onOpenChange={(open) => {
                    if (!open) {
                        setLeave(null);
                    }
                }}
                title="Unsaved changes"
                description="Saving applies to all scopes."
                confirmLabel="Save and continue"
                onConfirm={() => {
                    save();
                    leave?.();
                    setLeave(null);
                }}
                secondaryLabel="Discard"
                onSecondary={() => {
                    addToast({ message: "Changes discarded", color: "info" });
                    leave?.();
                    setLeave(null);
                }}
            />
        </PageTypeShell>
    );
}
