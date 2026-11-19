import { type KeyboardEvent, useState } from "react";

import { AssetThumbnail } from "../../../components/assetThumbnail/AssetThumbnail";
import { Breadcrumbs } from "../../../components/breadcrumbs/Breadcrumbs";
import { Button } from "../../../components/button/Button";
import { EmptyState } from "../../../components/emptyState/EmptyState";
import { Field } from "../../../components/field/Field";
import { FinderLayout } from "../../../components/finderLayout/FinderLayout";
import { Icon } from "../../../components/icon/Icon";
import { Input } from "../../../components/input/Input";
import { KeyValueList } from "../../../components/keyValueList/KeyValueList";
import { LinkedContent } from "../../../components/linkedContent/LinkedContent";
import { PageHeader } from "../../../components/pageHeader/PageHeader";
import { QuickLook } from "../../../components/quickLook/QuickLook";
import { Typography } from "../../../components/typography/Typography";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { type Asset, type AssetFolder, assetFolders, assets } from "./cmsData";
import styles from "./cmsPrototype.module.scss";

function getDepth(folder: AssetFolder): number {
    const parent = assetFolders.find((candidate) => candidate.id === folder.parentId);
    return parent == null ? 0 : getDepth(parent) + 1;
}

function getFolderTrail(folderId: string): AssetFolder[] {
    const folder = assetFolders.find((candidate) => candidate.id === folderId);
    if (folder == null) {
        return [];
    }
    return folder.parentId == null ? [folder] : [...getFolderTrail(folder.parentId), folder];
}

function AssetDetail({ asset, onAltChange, onQuickLook }: { asset: Asset; onAltChange: (alt: string) => void; onQuickLook: () => void }) {
    return (
        <aside className={styles.assetDetail} aria-label={asset.name}>
            <AssetThumbnail type={asset.type} src={asset.src} fileType={asset.fileType} duration={asset.duration} badges={asset.badges} />
            <div className={styles.detailHeading}>
                <Typography variant="label">{asset.type}</Typography>
                <h3 className={styles.assetDetailTitle}>{asset.name}</h3>
            </div>
            <div className={styles.detailActions}>
                <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<Icon name="eye" />}
                    onClick={onQuickLook}
                    disabled={asset.type !== "image"}
                >
                    Quick look
                </Button>
                <Button size="small" variant="outlined" color="secondary" startIcon={<Icon name="download" />}>
                    Download
                </Button>
            </div>
            {asset.type === "image" && (
                <Field
                    label="Alt text"
                    description="Describes the image for screen readers and search engines."
                    state={asset.alt ? undefined : "warning"}
                >
                    <Input
                        name="alt"
                        value={asset.alt ?? ""}
                        placeholder="Describe the image"
                        onChange={(event) => onAltChange(event.target.value)}
                    />
                </Field>
            )}
            <KeyValueList
                items={[
                    { key: "Size", value: asset.size },
                    ...(asset.dimensions ? [{ key: "Dimensions", value: asset.dimensions }] : []),
                    { key: "Uploaded", value: asset.uploaded },
                ]}
            />
            <div className={styles.usedOn}>
                <Typography variant="label">Used on</Typography>
                {asset.usedOn.length > 0 ? (
                    asset.usedOn.map((usage) => (
                        <LinkedContent
                            key={usage.href}
                            href={usage.href}
                            icon={<Icon name={usage.href.startsWith("#news") ? "news" : "page"} />}
                            title={usage.label}
                            description={usage.href.startsWith("#news") ? "News" : "Page"}
                        />
                    ))
                ) : (
                    <span className={styles.muted}>Not used anywhere yet.</span>
                )}
            </div>
        </aside>
    );
}

export function CmsAssets() {
    const [folderId, setFolderId] = useState("root");
    const [selectedId, setSelectedId] = useState<string | null>("office");
    const [altTexts, setAltTexts] = useState<Record<string, string>>({});
    const [quickLookOpen, setQuickLookOpen] = useState(false);

    const withAlt = (asset: Asset): Asset => {
        const alt = altTexts[asset.id] ?? asset.alt;
        return { ...asset, alt, badges: asset.type === "image" && !alt ? ["missingAlt"] : undefined };
    };
    const subfolders = assetFolders.filter((folder) => folder.parentId === folderId);
    const folderAssets = assets.filter((asset) => asset.folderId === folderId).map(withAlt);
    const selected = folderAssets.find((asset) => asset.id === selectedId);
    const images = folderAssets.filter((asset) => asset.type === "image" && asset.src != null);
    const quickLookIndex = Math.max(
        0,
        images.findIndex((asset) => asset.id === selectedId),
    );

    function openFolder(id: string) {
        setFolderId(id);
        setSelectedId(null);
    }

    function handleAssetKeyDown(event: KeyboardEvent, asset: Asset) {
        if (event.key === " " && asset.type === "image") {
            event.preventDefault();
            setQuickLookOpen(true);
        }
    }

    return (
        <PageTypeShell currentId="assets">
            <FinderLayout
                header={
                    <PageHeader
                        eyebrow="Content"
                        title="Assets"
                        subtitle={`${assets.length} files · shared by all scopes`}
                        actions={
                            <>
                                <Button variant="outlined" color="secondary" startIcon={<Icon name="folder-add" />}>
                                    New folder
                                </Button>
                                <Button startIcon={<Icon name="cloud-upload" />}>Upload</Button>
                            </>
                        }
                    />
                }
            >
                <div className={styles.finder} data-detail={selected ? "" : undefined}>
                    <nav aria-label="Folders" className={styles.sidebar}>
                        {assetFolders.map((folder) => (
                            <button
                                key={folder.id}
                                type="button"
                                aria-current={folder.id === folderId ? "true" : undefined}
                                onClick={() => openFolder(folder.id)}
                                className={styles.folderButton}
                                style={{ paddingInlineStart: `calc(var(--dextinity-space-2) + ${getDepth(folder)} * var(--dextinity-space-4))` }}
                            >
                                <Icon name="folder" />
                                {folder.name}
                            </button>
                        ))}
                    </nav>
                    <div className={styles.finderMain}>
                        <Breadcrumbs
                            className={styles.finderPath}
                            items={getFolderTrail(folderId).map((folder) => ({ label: folder.name, onClick: () => openFolder(folder.id) }))}
                        />
                        {subfolders.length + folderAssets.length > 0 ? (
                            <ul className={styles.finderContent} aria-label="Files">
                                {subfolders.map((folder) => (
                                    <li key={folder.id}>
                                        <button
                                            type="button"
                                            className={styles.assetChoice}
                                            onDoubleClick={() => openFolder(folder.id)}
                                            onClick={() => setSelectedId(null)}
                                        >
                                            <AssetThumbnail
                                                type="folder"
                                                title={folder.name}
                                                meta={`${assets.filter((asset) => asset.folderId === folder.id).length} files`}
                                            />
                                        </button>
                                    </li>
                                ))}
                                {folderAssets.map((asset) => (
                                    <li key={asset.id}>
                                        <button
                                            type="button"
                                            className={styles.assetChoice}
                                            aria-pressed={asset.id === selectedId}
                                            onClick={() => setSelectedId(asset.id)}
                                            onDoubleClick={() => asset.type === "image" && setQuickLookOpen(true)}
                                            onKeyDown={(event) => handleAssetKeyDown(event, asset)}
                                        >
                                            <AssetThumbnail
                                                type={asset.type}
                                                src={asset.src}
                                                fileType={asset.fileType}
                                                duration={asset.duration}
                                                badges={asset.badges}
                                                title={asset.name}
                                                meta={asset.size}
                                                selected={asset.id === selectedId}
                                            />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState icon={<Icon name="folder" />} title="This folder is empty" description="Drop files here or upload them." />
                        )}
                    </div>
                    {selected && (
                        <AssetDetail
                            asset={selected}
                            onAltChange={(alt) => setAltTexts((current) => ({ ...current, [selected.id]: alt }))}
                            onQuickLook={() => setQuickLookOpen(true)}
                        />
                    )}
                </div>
            </FinderLayout>
            <QuickLook
                open={quickLookOpen && images.length > 0}
                onOpenChange={setQuickLookOpen}
                items={images.map((asset) => ({
                    src: asset.src ?? "",
                    title: asset.name,
                    description: [asset.size, asset.dimensions].filter(Boolean).join(" · "),
                    alt: asset.alt,
                }))}
                index={quickLookIndex}
                onIndexChange={(index) => setSelectedId(images[index].id)}
            />
        </PageTypeShell>
    );
}
