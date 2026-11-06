import { useMutation } from "@apollo/client";
import { AssetThumbnail, Button, EmptyState, Icon, Input, KeyValueList, type KeyValueListItem, Panel, Textarea } from "@dextinity/ui";
import { type FormEvent, type MouseEvent, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";

import { updateDamFinderFileMutation, updateDamFinderFolderMutation } from "./DamFinderDetails.gql";
import type {
    GQLUpdateDamFinderFileMutation,
    GQLUpdateDamFinderFileMutationVariables,
    GQLUpdateDamFinderFolderMutation,
    GQLUpdateDamFinderFolderMutationVariables,
} from "./DamFinderDetails.gql.generated";
import { DetailActions, DetailContent, DetailForm } from "./DamFinderDetails.sc";
import { formatFileSize, getDamFinderAssetType, getFileExtension, getThumbnailUrl } from "./damFinderItems";
import type { GQLDamFinderFoldersQuery } from "./DamFinderPage.gql.generated";
import type { GQLDamFinderFileFragment } from "./useDamFinderFiles.gql.generated";

type DamFinderFolder = GQLDamFinderFoldersQuery["damFoldersFlat"][number];

interface DamFinderFileDetailsProps {
    file: GQLDamFinderFileFragment;
    editUrl?: string;
    onQuickLook: () => void;
    onChange: () => void;
    onError: (message: string) => void;
}

export function DamFinderFileDetails({ file, editUrl, onQuickLook, onChange, onError }: DamFinderFileDetailsProps) {
    const intl = useIntl();
    const history = useHistory();
    const [name, setName] = useState(file.name);
    const [title, setTitle] = useState(file.title ?? "");
    const [altText, setAltText] = useState(file.altText ?? "");
    const [updateFile, { loading }] = useMutation<GQLUpdateDamFinderFileMutation, GQLUpdateDamFinderFileMutationVariables>(
        updateDamFinderFileMutation,
    );

    const type = getDamFinderAssetType(file.mimetype);
    const isDirty = name !== file.name || title !== (file.title ?? "") || altText !== (file.altText ?? "");

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            await updateFile({
                variables: { id: file.id, input: { name: name.trim(), title: title.trim() || null, altText: altText.trim() || null } },
            });
            onChange();
        } catch {
            onError(intl.formatMessage({ id: "dextinity.damFinder.details.saveFailed", defaultMessage: "The file couldn't be saved" }));
        }
    };

    const items: KeyValueListItem[] = [
        {
            key: intl.formatMessage({ id: "dextinity.damFinder.details.type", defaultMessage: "Type" }),
            value: file.mimetype,
        },
        {
            key: intl.formatMessage({ id: "dextinity.damFinder.details.size", defaultMessage: "Size" }),
            value: formatFileSize(intl, file.size),
        },
        ...(file.image != null
            ? [
                  {
                      key: intl.formatMessage({ id: "dextinity.damFinder.details.dimensions", defaultMessage: "Dimensions" }),
                      value: intl.formatMessage(
                          { id: "dextinity.damFinder.details.dimensionsValue", defaultMessage: "{width} × {height} px" },
                          { width: file.image.width, height: file.image.height },
                      ),
                  },
              ]
            : []),
        {
            key: intl.formatMessage({ id: "dextinity.damFinder.details.modified", defaultMessage: "Modified" }),
            value: intl.formatDate(file.updatedAt, { dateStyle: "medium", timeStyle: "short" }),
        },
    ];

    return (
        <Panel title={file.name}>
            <DetailContent>
                <AssetThumbnail
                    type={type}
                    src={getThumbnailUrl(file)}
                    alt={file.altText ?? undefined}
                    fileType={type === "document" ? getFileExtension(file.name) : undefined}
                    ratio={type === "image" ? "original" : "4:3"}
                />
                <DetailActions>
                    <Button size="small" variant="outlined" color="secondary" startIcon={<Icon name="eye" />} onClick={onQuickLook}>
                        {intl.formatMessage({ id: "dextinity.damFinder.details.quickLook", defaultMessage: "Quick look" })}
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<Icon name="download" />}
                        onClick={() => window.open(file.fileUrl, "_blank", "noopener")}
                    >
                        {intl.formatMessage({ id: "dextinity.damFinder.details.original", defaultMessage: "Original" })}
                    </Button>
                    {editUrl != null && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<Icon name="edit" />}
                            href={editUrl}
                            onClick={(event: MouseEvent<HTMLElement>) => {
                                const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
                                if (!isModifiedClick) {
                                    event.preventDefault();
                                    history.push(editUrl);
                                }
                            }}
                        >
                            {intl.formatMessage({ id: "dextinity.damFinder.details.edit", defaultMessage: "All settings" })}
                        </Button>
                    )}
                </DetailActions>
                <KeyValueList items={items} />
                <DetailForm onSubmit={handleSubmit}>
                    <Input
                        name="name"
                        label={intl.formatMessage({ id: "dextinity.damFinder.details.name", defaultMessage: "File name" })}
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <Input
                        name="title"
                        label={intl.formatMessage({ id: "dextinity.damFinder.details.title", defaultMessage: "Title" })}
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                    />
                    {type === "image" && (
                        <Textarea
                            name="altText"
                            label={intl.formatMessage({ id: "dextinity.damFinder.details.altText", defaultMessage: "Alt text" })}
                            helperText={intl.formatMessage({
                                id: "dextinity.damFinder.details.altTextHelper",
                                defaultMessage: "Describes the image for people who can't see it.",
                            })}
                            rows={3}
                            value={altText}
                            onChange={(event) => setAltText(event.target.value)}
                        />
                    )}
                    <DetailActions>
                        <Button type="submit" size="small" disabled={!isDirty || name.trim() === ""} loading={loading}>
                            {intl.formatMessage({ id: "dextinity.damFinder.details.save", defaultMessage: "Save" })}
                        </Button>
                    </DetailActions>
                </DetailForm>
            </DetailContent>
        </Panel>
    );
}

interface DamFinderFolderDetailsProps {
    folder: DamFinderFolder;
    onOpen: () => void;
    onChange: () => void;
    onError: (message: string) => void;
}

export function DamFinderFolderDetails({ folder, onOpen, onChange, onError }: DamFinderFolderDetailsProps) {
    const intl = useIntl();
    const [name, setName] = useState(folder.name);
    const [updateFolder, { loading }] = useMutation<GQLUpdateDamFinderFolderMutation, GQLUpdateDamFinderFolderMutationVariables>(
        updateDamFinderFolderMutation,
    );

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            await updateFolder({ variables: { id: folder.id, input: { name: name.trim() } } });
            onChange();
        } catch {
            onError(intl.formatMessage({ id: "dextinity.damFinder.details.renameFailed", defaultMessage: "The folder couldn't be renamed" }));
        }
    };

    return (
        <Panel title={folder.name}>
            <DetailContent>
                <AssetThumbnail type="folder" />
                <DetailActions>
                    <Button size="small" variant="outlined" color="secondary" startIcon={<Icon name="folder" />} onClick={onOpen}>
                        {intl.formatMessage({ id: "dextinity.damFinder.details.openFolder", defaultMessage: "Open" })}
                    </Button>
                </DetailActions>
                <KeyValueList
                    items={[
                        {
                            key: intl.formatMessage({ id: "dextinity.damFinder.details.files", defaultMessage: "Files" }),
                            value: intl.formatNumber(folder.numberOfFiles),
                        },
                        {
                            key: intl.formatMessage({ id: "dextinity.damFinder.details.subfolders", defaultMessage: "Subfolders" }),
                            value: intl.formatNumber(folder.numberOfChildFolders),
                        },
                    ]}
                />
                <DetailForm onSubmit={handleSubmit}>
                    <Input
                        name="name"
                        label={intl.formatMessage({ id: "dextinity.damFinder.details.folderName", defaultMessage: "Folder name" })}
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <DetailActions>
                        <Button type="submit" size="small" disabled={name === folder.name || name.trim() === ""} loading={loading}>
                            {intl.formatMessage({ id: "dextinity.damFinder.details.rename", defaultMessage: "Rename" })}
                        </Button>
                    </DetailActions>
                </DetailForm>
            </DetailContent>
        </Panel>
    );
}

interface DamFinderSelectionDetailsProps {
    count: number;
}

export function DamFinderSelectionDetails({ count }: DamFinderSelectionDetailsProps) {
    const intl = useIntl();
    return (
        <Panel>
            <EmptyState
                icon={<Icon name={count > 0 ? "check" : "info"} />}
                title={
                    count > 0
                        ? intl.formatMessage(
                              {
                                  id: "dextinity.damFinder.details.selectedCount",
                                  defaultMessage: "{count, plural, one {# item} other {# items}} selected",
                              },
                              { count },
                          )
                        : intl.formatMessage({ id: "dextinity.damFinder.details.noSelection", defaultMessage: "No file selected" })
                }
                description={
                    count > 0
                        ? intl.formatMessage({
                              id: "dextinity.damFinder.details.selectedDescription",
                              defaultMessage: "Drag them onto a folder to move them, or press Delete.",
                          })
                        : intl.formatMessage({
                              id: "dextinity.damFinder.details.noSelectionDescription",
                              defaultMessage: "Select a file to see its details. Space opens a quick look.",
                          })
                }
            />
        </Panel>
    );
}
