import { isApolloError, useMutation } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { AssetThumbnail, Button, EmptyState, Icon, KeyValueList, type KeyValueListItem, Panel } from "@dextinity/ui";
import { focusOnError, InputField, TextareaField, useHasUnsavedChanges } from "@dextinity/ui-react-final-form";
import { FORM_ERROR } from "final-form";
import { type MouseEvent, useMemo } from "react";
import { Form, useForm, useFormState } from "react-final-form";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";

import { updateDamFinderFileMutation, updateDamFinderFolderMutation } from "./DamFinderDetails.gql";
import type {
    GQLUpdateDamFinderFileMutation,
    GQLUpdateDamFinderFileMutationVariables,
    GQLUpdateDamFinderFolderMutation,
    GQLUpdateDamFinderFolderMutationVariables,
} from "./DamFinderDetails.gql.generated";
import { DetailActions, DetailContent, DetailForm, DetailFormFooter } from "./DamFinderDetails.sc";
import { DamFinderFormSaveState, type DamFinderUnsavedChanges, DamFinderUnsavedChangesGuard } from "./DamFinderFormState";
import { formatFileSize, getDamFinderAssetType, getFileExtension, getThumbnailUrl } from "./damFinderItems";
import type { GQLDamFinderFoldersQuery } from "./DamFinderPage.gql.generated";
import type { GQLDamFinderFileFragment } from "./useDamFinderFiles.gql.generated";

type DamFinderFolder = GQLDamFinderFoldersQuery["damFoldersFlat"][number];

interface FileDetailsFormValues {
    name: string;
    title: string;
    altText: string;
}

interface FolderDetailsFormValues {
    name: string;
}

// The API reports a duplicate file name only through the message of a generic error
function isDuplicateFileNameError(error: unknown) {
    return error instanceof Error && isApolloError(error) && error.graphQLErrors.some(({ message }) => message.startsWith("Entity with name"));
}

// Trimming in the form instead of the mutation keeps the submitted values equal to the saved ones the form is reinitialized with
function trimOnBlur(value: string | undefined) {
    return value?.trim() ?? "";
}

function useBlankNameValidator() {
    const intl = useIntl();
    const message = intl.formatMessage({ id: "dextinity.damFinder.details.nameBlank", defaultMessage: "Enter a name" });
    return (value: string | undefined) => (value != null && value !== "" && value.trim() === "" ? message : undefined);
}

function DetailFormFooterActions({ submitLabel }: { submitLabel: string }) {
    const intl = useIntl();
    const form = useForm();
    const hasUnsavedChanges = useHasUnsavedChanges();
    const { submitting } = useFormState({ subscription: { submitting: true } });
    return (
        <DetailFormFooter>
            <DamFinderFormSaveState />
            <DetailActions>
                <Button size="small" variant="text" color="secondary" disabled={!hasUnsavedChanges || submitting} onClick={() => form.reset()}>
                    {intl.formatMessage({ id: "dextinity.damFinder.details.reset", defaultMessage: "Reset" })}
                </Button>
                <Button type="submit" size="small" disabled={!hasUnsavedChanges} loading={submitting}>
                    {submitLabel}
                </Button>
            </DetailActions>
        </DetailFormFooter>
    );
}

interface DamFinderFileDetailsProps {
    file: GQLDamFinderFileFragment;
    editUrl?: string;
    onQuickLook: () => void;
    onChange: () => Promise<unknown>;
    onError: (message: string) => void;
    onUnsavedChangesChange: (unsavedChanges: DamFinderUnsavedChanges | undefined) => void;
}

export function DamFinderFileDetails({ file, editUrl, onQuickLook, onChange, onError, onUnsavedChangesChange }: DamFinderFileDetailsProps) {
    const intl = useIntl();
    const history = useHistory();
    const validateBlankName = useBlankNameValidator();
    const initialValues = useMemo<FileDetailsFormValues>(
        () => ({ name: file.name, title: file.title ?? "", altText: file.altText ?? "" }),
        [file.name, file.title, file.altText],
    );
    const [updateFile] = useMutation<GQLUpdateDamFinderFileMutation, GQLUpdateDamFinderFileMutationVariables>(updateDamFinderFileMutation);

    const type = getDamFinderAssetType(file.mimetype);

    const save = async ({ name, title, altText }: FileDetailsFormValues) => {
        try {
            await updateFile({
                variables: {
                    id: file.id,
                    input: {
                        name: name !== file.name ? name : undefined,
                        title: title || null,
                        altText: altText || null,
                    },
                },
                context: LocalErrorScopeApolloContext,
            });
        } catch (error) {
            if (isDuplicateFileNameError(error)) {
                return {
                    name: intl.formatMessage({
                        id: "dextinity.damFinder.details.nameTaken",
                        defaultMessage: "Another file in this folder already has this name",
                    }),
                };
            }
            const message = intl.formatMessage({ id: "dextinity.damFinder.details.saveFailed", defaultMessage: "The file couldn't be saved" });
            onError(message);
            return { [FORM_ERROR]: message };
        }
        await onChange();
        return undefined;
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
                <Form<FileDetailsFormValues> onSubmit={save} initialValues={initialValues} decorators={[focusOnError]}>
                    {({ handleSubmit }) => (
                        <DetailForm onSubmit={handleSubmit} noValidate>
                            <DamFinderUnsavedChangesGuard onUnsavedChangesChange={onUnsavedChangesChange} />
                            <InputField
                                name="name"
                                label={intl.formatMessage({ id: "dextinity.damFinder.details.name", defaultMessage: "File name" })}
                                required
                                requiredMessage={intl.formatMessage({
                                    id: "dextinity.damFinder.details.nameRequired",
                                    defaultMessage: "Enter a file name",
                                })}
                                validate={validateBlankName}
                                format={trimOnBlur}
                                formatOnBlur
                            />
                            <InputField
                                name="title"
                                label={intl.formatMessage({ id: "dextinity.damFinder.details.title", defaultMessage: "Title" })}
                                format={trimOnBlur}
                                formatOnBlur
                            />
                            {type === "image" && (
                                <TextareaField
                                    name="altText"
                                    label={intl.formatMessage({ id: "dextinity.damFinder.details.altText", defaultMessage: "Alt text" })}
                                    helperText={intl.formatMessage({
                                        id: "dextinity.damFinder.details.altTextHelper",
                                        defaultMessage: "Describes the image for people who can't see it.",
                                    })}
                                    rows={3}
                                    format={trimOnBlur}
                                    formatOnBlur
                                />
                            )}
                            <DetailFormFooterActions
                                submitLabel={intl.formatMessage({ id: "dextinity.damFinder.details.save", defaultMessage: "Save" })}
                            />
                        </DetailForm>
                    )}
                </Form>
            </DetailContent>
        </Panel>
    );
}

interface DamFinderFolderDetailsProps {
    folder: DamFinderFolder;
    onOpen: () => void;
    onChange: () => Promise<unknown>;
    onError: (message: string) => void;
    onUnsavedChangesChange: (unsavedChanges: DamFinderUnsavedChanges | undefined) => void;
}

export function DamFinderFolderDetails({ folder, onOpen, onChange, onError, onUnsavedChangesChange }: DamFinderFolderDetailsProps) {
    const intl = useIntl();
    const validateBlankName = useBlankNameValidator();
    const initialValues = useMemo<FolderDetailsFormValues>(() => ({ name: folder.name }), [folder.name]);
    const [updateFolder] = useMutation<GQLUpdateDamFinderFolderMutation, GQLUpdateDamFinderFolderMutationVariables>(updateDamFinderFolderMutation);

    const rename = async ({ name }: FolderDetailsFormValues) => {
        try {
            await updateFolder({ variables: { id: folder.id, input: { name } }, context: LocalErrorScopeApolloContext });
        } catch {
            const message = intl.formatMessage({ id: "dextinity.damFinder.details.renameFailed", defaultMessage: "The folder couldn't be renamed" });
            onError(message);
            return { [FORM_ERROR]: message };
        }
        await onChange();
        return undefined;
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
                <Form<FolderDetailsFormValues> onSubmit={rename} initialValues={initialValues} decorators={[focusOnError]}>
                    {({ handleSubmit }) => (
                        <DetailForm onSubmit={handleSubmit} noValidate>
                            <DamFinderUnsavedChangesGuard onUnsavedChangesChange={onUnsavedChangesChange} />
                            <InputField
                                name="name"
                                label={intl.formatMessage({ id: "dextinity.damFinder.details.folderName", defaultMessage: "Folder name" })}
                                required
                                requiredMessage={intl.formatMessage({
                                    id: "dextinity.damFinder.details.folderNameRequired",
                                    defaultMessage: "Enter a folder name",
                                })}
                                validate={validateBlankName}
                                format={trimOnBlur}
                                formatOnBlur
                            />
                            <DetailFormFooterActions
                                submitLabel={intl.formatMessage({ id: "dextinity.damFinder.details.rename", defaultMessage: "Rename" })}
                            />
                        </DetailForm>
                    )}
                </Form>
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
