import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, RouterPrompt, useStackApi } from "@dextinity/admin";
import {
    Button,
    ConfirmDialog,
    type DateRange,
    EditLayout,
    type EditLayoutPane,
    EmptyState,
    formatShortcut,
    Icon,
    IconButton,
    isApplePlatform,
    Menu,
    MenuItem,
    MenuSeparator,
    type NewToast,
    PageHeader,
    Panel,
    SegmentedControl,
    Skeleton,
    StatusIndicator,
    Tabs,
    ToastViewport,
    Tooltip,
    useKeyboardShortcut,
    useToasts,
} from "@dextinity/ui";
import { focusOnError, useHasUnsavedChanges } from "@dextinity/ui-react-final-form";
import { format } from "date-fns";
import { deepEqual } from "fast-equals";
import { FORM_ERROR, type FormApi } from "final-form";
import { useMemo, useState } from "react";
import { Form, useForm, useFormState } from "react-final-form";
import { useIntl } from "react-intl";
import { useHistory, useLocation, useRouteMatch } from "react-router";

import { fullCropArea } from "../../common/image/cropArea";
import { RouterTabLink } from "../../common/RouterTabLink";
import { useRouterLinkClick } from "../../common/useRouterLinkClick";
import { useDependenciesConfig } from "../../dependencies/dependenciesConfig";
import { DependentsList } from "../../dependencies/DependentsList";
import type { GQLDamFileAiContentType, GQLFocalPoint, GQLImageCropAreaInput } from "../../graphql.generated";
import { useUserPermissionCheck } from "../../userPermissions/hooks/currentUser";
import { useDamConfig } from "../config/damConfig";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";
import { DamFinderFormSaveState } from "../finder/DamFinderFormState";
import { clearDamItemCache } from "../helpers/clearDamItemCache";
import { MediaAlternativesGrid } from "../mediaAlternatives/MediaAlternativesGrid";
import { Duplicates } from "./Duplicates";
import {
    archiveDamFileMutation,
    damFileDependentsQuery,
    damFileDetailQuery,
    deleteDamFileMutation,
    restoreDamFileMutation,
    updateDamFileMutation,
} from "./EditFile.gql";
import type {
    GQLArchiveFileMutation,
    GQLArchiveFileMutationVariables,
    GQLDamFileDetailFragment,
    GQLDamFileDetailQuery,
    GQLDamFileDetailQueryVariables,
    GQLDeleteDamFileMutation,
    GQLDeleteDamFileMutationVariables,
    GQLRestoreFileMutation,
    GQLRestoreFileMutationVariables,
    GQLUpdateFileMutation,
    GQLUpdateFileMutationVariables,
} from "./EditFile.gql.generated";
import { EditorContent, HeaderActions, HeaderMeta } from "./EditFile.sc";
import { EmbeddedMetadata } from "./FileInfos";
import { FilePreview } from "./FilePreview";
import { FileSettingsFields } from "./FileSettingsFields";
import type { LicenseType } from "./licenseType";

export interface EditImageFormValues {
    focalPoint: GQLFocalPoint;
    crop: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface EditFileFormValues extends EditImageFormValues {
    name: string;
    altText?: string;
    aiContentType: GQLDamFileAiContentType | null;
    title?: string;
    license: {
        type: LicenseType;
        details?: string;
        author?: string;
        duration: DateRange | null;
    };
}

export type DamFileDetails = GQLDamFileDetailFragment;

type EditFileTab = "settings" | "metadata" | "mediaAlternatives" | "duplicates" | "dependents";

const tabPaths: Record<EditFileTab, string> = {
    settings: "",
    metadata: "/infos",
    mediaAlternatives: "/media-alternatives",
    duplicates: "/duplicates",
    dependents: "/dependents",
};

const formDecorators = [focusOnError];

function toDateInputValue(dateTime: string | null | undefined) {
    return dateTime ? format(new Date(dateTime), "yyyy-MM-dd") : null;
}

// React Final Form parses a cleared text field to `undefined`, so empty texts start as `undefined` too; otherwise a field cleared and saved
// would still count as changed once the saved file reinitializes the form.
function toFormValues(file: DamFileDetails): EditFileFormValues {
    const durationFrom = toDateInputValue(file.license?.durationFrom);
    const durationTo = toDateInputValue(file.license?.durationTo);
    return {
        name: file.name,
        focalPoint: file.image?.cropArea.focalPoint ?? "SMART",
        crop: {
            width: file.image?.cropArea.width ?? 100,
            height: file.image?.cropArea.height ?? 100,
            x: file.image?.cropArea.x ?? 0,
            y: file.image?.cropArea.y ?? 0,
        },
        altText: file.altText || undefined,
        aiContentType: file.aiContentType ?? null,
        title: file.title || undefined,
        license: {
            type: file.license?.type ?? "NO_LICENSE",
            details: file.license?.details || undefined,
            author: file.license?.author || undefined,
            duration: durationFrom != null || durationTo != null ? { start: durationFrom, end: durationTo } : null,
        },
    };
}

function toCropArea({ focalPoint, crop }: EditImageFormValues): GQLImageCropAreaInput {
    if (focalPoint === "SMART") {
        return { focalPoint: "SMART", x: null, y: null, width: null, height: null };
    }
    if (crop.width && crop.height) {
        return { focalPoint, x: crop.x, y: crop.y, width: Math.ceil(crop.width), height: Math.ceil(crop.height) };
    }
    return { focalPoint, ...fullCropArea };
}

interface EditFileProps {
    id: string;
}

/**
 * The page of a DAM file, built with `@dextinity/ui`: the preview with the crop area on the left, the settings and the file's relations in
 * tabs on the right.
 */
function EditFile({ id }: EditFileProps) {
    const intl = useIntl();
    const stackApi = useStackApi();
    const match = useRouteMatch();
    const navigateWithRouter = useRouterLinkClick();
    const assetsUrl = stackApi?.breadCrumbs[0]?.url ?? match.url.replace(/\/[^/]+\/edit$/, "");
    const { data, loading, error } = useQuery<GQLDamFileDetailQuery, GQLDamFileDetailQueryVariables>(damFileDetailQuery, {
        variables: { id },
        context: LocalErrorScopeApolloContext,
    });
    const file = data?.damFile;
    const assetsLabel = intl.formatMessage({ id: "dextinity.damFinder.title", defaultMessage: "Assets" });

    if (file == null) {
        return (
            <EditLayout
                variant={loading ? "formWithBlocks" : "form"}
                loading={loading}
                header={
                    loading ? (
                        <Skeleton variant="text" width="40%" />
                    ) : (
                        <PageHeader
                            back={{ label: assetsLabel, href: assetsUrl }}
                            slotProps={{ back: { onClick: navigateWithRouter } }}
                            title={intl.formatMessage({ id: "dextinity.dam.file.loadFailedTitle", defaultMessage: "This file can't be opened" })}
                        />
                    )
                }
            >
                <Panel>
                    <EmptyState
                        icon={<Icon name="warning" />}
                        title={error?.message ?? intl.formatMessage({ id: "dextinity.dam.file.notFound", defaultMessage: "The file doesn't exist" })}
                        actions={
                            <Button variant="outlined" color="secondary" size="small" href={assetsUrl} onClick={navigateWithRouter}>
                                {intl.formatMessage({ id: "dextinity.dam.file.goToAssets", defaultMessage: "Go to Assets" })}
                            </Button>
                        }
                    />
                </Panel>
            </EditLayout>
        );
    }

    return <EditFileForm file={file} assetsUrl={assetsUrl} assetsLabel={assetsLabel} />;
}

interface EditFileFormProps {
    file: DamFileDetails;
    assetsUrl: string;
    assetsLabel: string;
}

function EditFileForm({ file, assetsUrl, assetsLabel }: EditFileFormProps) {
    const intl = useIntl();
    const apolloClient = useApolloClient();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const initialValues = useMemo(() => toFormValues(file), [file]);

    const save = async (values: EditFileFormValues) => {
        const { license } = values;
        try {
            await apolloClient.mutate<GQLUpdateFileMutation, GQLUpdateFileMutationVariables>({
                mutation: updateDamFileMutation,
                variables: {
                    id: file.id,
                    input: {
                        name: values.name,
                        altText: values.altText || null,
                        aiContentType: values.aiContentType,
                        title: values.title || null,
                        image: { cropArea: toCropArea(values) },
                        license:
                            license.type === "NO_LICENSE"
                                ? null
                                : {
                                      type: license.type,
                                      details: license.details || null,
                                      author: license.author || null,
                                      durationFrom: license.duration?.start ?? null,
                                      durationTo: license.duration?.end ?? null,
                                  },
                        folderId: file.folder?.id ?? null,
                    },
                },
                context: LocalErrorScopeApolloContext,
            });
        } catch (error) {
            const message = intl.formatMessage(
                { id: "dextinity.dam.file.saveFailed", defaultMessage: "Saving failed: {reason}" },
                { reason: error instanceof Error ? error.message : String(error) },
            );
            addToast({ tone: "error", message });
            return { [FORM_ERROR]: message };
        }
        addToast({ message: intl.formatMessage({ id: "dextinity.dam.file.saved", defaultMessage: "Saved" }) });
        return undefined;
    };

    return (
        <>
            <Form<EditFileFormValues> onSubmit={save} initialValues={initialValues} initialValuesEqual={deepEqual} decorators={formDecorators}>
                {({ handleSubmit, form }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <EditFileFormContent file={file} assetsUrl={assetsUrl} assetsLabel={assetsLabel} form={form} addToast={addToast} />
                    </form>
                )}
            </Form>
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.dam.file.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}

interface EditFileFormContentProps extends EditFileFormProps {
    form: FormApi<EditFileFormValues>;
    addToast: (toast: NewToast) => void;
}

function EditFileFormContent({ file, assetsUrl, assetsLabel, form, addToast }: EditFileFormContentProps) {
    const intl = useIntl();
    const location = useLocation();
    const match = useRouteMatch();
    const navigateWithRouter = useRouterLinkClick();
    const hasUnsavedChanges = useHasUnsavedChanges();
    const [pane, setPane] = useState<EditLayoutPane>("editor");
    const { submitting } = useFormState({ subscription: { submitting: true } });
    const isAllowed = useUserPermissionCheck();
    const { entityDependencyMap } = useDependenciesConfig();
    const { filteredAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const fileUrl = match.url.replace(/\/$/, "");
    const isVideo = filteredAcceptedMimeTypes.video.includes(file.mimetype);
    const isCaptions = filteredAcceptedMimeTypes.captions.includes(file.mimetype);
    const exif = file.image?.exif;

    const shownTabs: EditFileTab[] = [
        "settings",
        ...(exif != null ? (["metadata"] as const) : []),
        ...(isVideo || isCaptions ? (["mediaAlternatives"] as const) : []),
        "duplicates" as const,
        ...(isAllowed("dependencies") && Object.keys(entityDependencyMap).length > 0 ? (["dependents"] as const) : []),
    ];
    const selectedTab =
        shownTabs.find((tab) => tab !== "settings" && location.pathname.startsWith(`${fileUrl}${tabPaths[tab]}`)) ?? ("settings" as const);
    const tabLabels: Record<EditFileTab, string> = {
        settings: intl.formatMessage({ id: "dextinity.dam.file.settings", defaultMessage: "Settings" }),
        metadata: intl.formatMessage({ id: "dextinity.dam.file.metadata", defaultMessage: "Metadata" }),
        mediaAlternatives: intl.formatMessage({ id: "dextinity.dam.file.mediaAlternatives.tabTitle", defaultMessage: "Media alternatives" }),
        duplicates: intl.formatMessage({ id: "dextinity.dam.file.duplicates.tabTitle", defaultMessage: "Duplicates" }),
        dependents: intl.formatMessage({ id: "dextinity.dam.file.dependents", defaultMessage: "Dependents" }),
    };

    useKeyboardShortcut("mod+s", () => void form.submit(), { allowInEditable: true });
    const saveShortcut = formatShortcut("mod+s").join(isApplePlatform() ? "" : "+");
    const backUrl = file.folder ? `${assetsUrl}?folder=${encodeURIComponent(file.folder.id)}` : assetsUrl;

    const submitAndReportSuccess = async () => {
        await form.submit();
        const { hasValidationErrors, hasSubmitErrors } = form.getState();
        return !hasValidationErrors && !hasSubmitErrors;
    };

    return (
        <RouterPrompt
            message={() =>
                hasUnsavedChanges
                    ? intl.formatMessage({ id: "dextinity.dam.file.unsavedChanges", defaultMessage: "Do you want to save your changes?" })
                    : true
            }
            saveAction={submitAndReportSuccess}
            resetAction={() => form.reset()}
            subRoutePath={fileUrl}
        >
            <EditLayout
                variant="formWithBlocks"
                header={
                    <PageHeader
                        back={{ label: assetsLabel, href: backUrl }}
                        slotProps={{ back: { onClick: navigateWithRouter } }}
                        title={file.name}
                        subtitle={<FileStatus file={file} />}
                        actions={
                            <HeaderActions>
                                <FileActionsMenu file={file} assetsUrl={backUrl} addToast={addToast} />
                                <DamFinderFormSaveState />
                                <Tooltip
                                    content={intl.formatMessage({
                                        id: "dextinity.dam.file.saveTooltip",
                                        defaultMessage: "Saves the file's settings",
                                    })}
                                    shortcut={saveShortcut}
                                >
                                    <Button type="submit" startIcon={<Icon name="check" />} loading={submitting} disabled={!hasUnsavedChanges}>
                                        {intl.formatMessage({ id: "dextinity.generic.save", defaultMessage: "Save" })}
                                    </Button>
                                </Tooltip>
                            </HeaderActions>
                        }
                    />
                }
                pane={pane}
                paneSwitch={
                    <SegmentedControl
                        aria-label={intl.formatMessage({ id: "dextinity.dam.file.pane", defaultMessage: "View" })}
                        value={pane}
                        onChange={setPane}
                        options={[
                            {
                                value: "preview",
                                label: intl.formatMessage({ id: "dextinity.dam.file.pane.preview", defaultMessage: "Preview" }),
                                icon: <Icon name="visible" />,
                            },
                            {
                                value: "editor",
                                label: intl.formatMessage({ id: "dextinity.dam.file.pane.editor", defaultMessage: "Edit" }),
                                icon: <Icon name="edit" />,
                            },
                        ]}
                    />
                }
                preview={<FilePreview file={file} onNotify={addToast} />}
            >
                <Panel>
                    <EditorContent>
                        <Tabs<EditFileTab>
                            aria-label={intl.formatMessage({ id: "dextinity.dam.file.tabs", defaultMessage: "File" })}
                            value={selectedTab}
                            onChange={() => {
                                // The tabs are router links, which navigate themselves; the route decides the selected tab
                            }}
                            items={shownTabs.map((tab) => ({ value: tab, label: tabLabels[tab], href: `${fileUrl}${tabPaths[tab]}` }))}
                            slots={{ tab: RouterTabLink }}
                        />
                        {/* Hidden instead of unmounted, so the form keeps tracking unsaved changes of the fields while another tab is open */}
                        <div hidden={selectedTab !== "settings"}>
                            <FileSettingsFields file={file} onError={(message) => addToast({ tone: "error", message })} />
                        </div>
                        {selectedTab === "metadata" && exif != null && <EmbeddedMetadata exif={exif} />}
                        {selectedTab === "mediaAlternatives" && (
                            <>
                                {isVideo && <MediaAlternativesGrid file={file} type="captions" direction="for" />}
                                {isCaptions && <MediaAlternativesGrid file={file} type="captions" direction="alternative" />}
                            </>
                        )}
                        {selectedTab === "duplicates" && <Duplicates fileId={file.id} getEditUrl={(fileId) => `${assetsUrl}/${fileId}/edit`} />}
                        {selectedTab === "dependents" && <DependentsList query={damFileDependentsQuery} variables={{ id: file.id }} />}
                    </EditorContent>
                </Panel>
            </EditLayout>
        </RouterPrompt>
    );
}

function FileStatus({ file }: { file: DamFileDetails }) {
    const intl = useIntl();
    const damConfig = useDamConfig();
    const license = damConfig.enableLicenseFeature ? file.license : null;

    return (
        <HeaderMeta>
            {file.archived && (
                <StatusIndicator status="archived">
                    {intl.formatMessage({ id: "dextinity.dam.file.archived", defaultMessage: "Archived" })}
                </StatusIndicator>
            )}
            {license?.isNotValidYet && (
                <StatusIndicator status="warning">
                    {intl.formatMessage({ id: "dextinity.pages.dam.tag.licenseNotValidYet", defaultMessage: "License not valid yet" })}
                </StatusIndicator>
            )}
            {license?.hasExpired && (
                <StatusIndicator status="critical">
                    {intl.formatMessage({ id: "dextinity.pages.dam.tag.licenseExpired", defaultMessage: "License expired" })}
                </StatusIndicator>
            )}
            {license?.expiresWithinThirtyDays && license.expirationDate && (
                <StatusIndicator status="warning">
                    {intl.formatMessage(
                        { id: "dextinity.dam.file.licenseExpiresOn", defaultMessage: "License expires on {date}" },
                        { date: intl.formatDate(license.expirationDate, { dateStyle: "medium" }) },
                    )}
                </StatusIndicator>
            )}
            {file.folder != null && <span>{file.damPath}</span>}
        </HeaderMeta>
    );
}

interface FileActionsMenuProps {
    file: DamFileDetails;
    assetsUrl: string;
    addToast: (toast: NewToast) => void;
}

function FileActionsMenu({ file, assetsUrl, addToast }: FileActionsMenuProps) {
    const intl = useIntl();
    const history = useHistory();
    const form = useForm();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [archiveFile] = useMutation<GQLArchiveFileMutation, GQLArchiveFileMutationVariables>(archiveDamFileMutation);
    const [restoreFile] = useMutation<GQLRestoreFileMutation, GQLRestoreFileMutationVariables>(restoreDamFileMutation);
    const [deleteFile, { loading: deleting }] = useMutation<GQLDeleteDamFileMutation, GQLDeleteDamFileMutationVariables>(deleteDamFileMutation);

    const toggleArchived = async () => {
        try {
            if (file.archived) {
                await restoreFile({ variables: { id: file.id }, context: LocalErrorScopeApolloContext });
            } else {
                await archiveFile({ variables: { id: file.id }, context: LocalErrorScopeApolloContext });
            }
            addToast({
                message: file.archived
                    ? intl.formatMessage({ id: "dextinity.dam.file.restored", defaultMessage: "File restored" })
                    : intl.formatMessage({ id: "dextinity.dam.file.archivedToast", defaultMessage: "File archived" }),
            });
        } catch {
            addToast({
                tone: "error",
                message: file.archived
                    ? intl.formatMessage({ id: "dextinity.dam.file.restoreFailed", defaultMessage: "Restoring failed" })
                    : intl.formatMessage({ id: "dextinity.dam.file.archiveFailed", defaultMessage: "Archiving failed" }),
            });
        }
    };

    const deletePermanently = async () => {
        try {
            await deleteFile({
                variables: { id: file.id },
                context: LocalErrorScopeApolloContext,
                update: (cache) => {
                    clearDamItemCache(cache);
                    cache.evict({ id: cache.identify({ __typename: "DamFile", id: file.id }) });
                },
            });
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({ id: "dextinity.dam.file.deleteFailed", defaultMessage: "Deleting failed · the file still exists" }),
            });
            return;
        }
        form.reset();
        setIsDeleteDialogOpen(false);
        history.push(assetsUrl);
    };

    return (
        <>
            <Menu
                open={isMenuOpen}
                onOpenChange={setIsMenuOpen}
                placement="bottom-end"
                trigger={
                    <IconButton
                        variant="text"
                        color="secondary"
                        aria-label={intl.formatMessage({ id: "dextinity.dam.file.moreActions", defaultMessage: "More actions" })}
                    >
                        <Icon name="more-horizontal" />
                    </IconButton>
                }
            >
                <MenuItem
                    label={
                        file.archived
                            ? intl.formatMessage({ id: "dextinity.dam.file.restore", defaultMessage: "Restore" })
                            : intl.formatMessage({ id: "dextinity.dam.file.archive", defaultMessage: "Archive" })
                    }
                    icon={<Icon name={file.archived ? "restore" : "archive"} />}
                    onClick={() => void toggleArchived()}
                />
                <MenuSeparator />
                <MenuItem
                    label={intl.formatMessage({ id: "dextinity.dam.file.delete", defaultMessage: "Delete" })}
                    icon={<Icon name="delete" />}
                    color="error"
                    onClick={() => setIsDeleteDialogOpen(true)}
                />
            </Menu>
            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    if (!deleting) {
                        setIsDeleteDialogOpen(open);
                    }
                }}
                tone="danger"
                title={intl.formatMessage(
                    { id: "dextinity.dam.file.deleteDialog.title", defaultMessage: "Delete “{name}” permanently?" },
                    { name: file.name },
                )}
                description={intl.formatMessage({
                    id: "dextinity.dam.file.deleteDialog.description",
                    defaultMessage: "This can't be undone, and the file disappears wherever it's used. To only hide it, archive it instead.",
                })}
                confirmLabel={intl.formatMessage({ id: "dextinity.dam.file.deleteDialog.confirm", defaultMessage: "Delete permanently" })}
                confirmIcon={<Icon name="delete" />}
                onConfirm={() => void deletePermanently()}
                loading={deleting}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.generic.cancel", defaultMessage: "Cancel" }) }}
            />
        </>
    );
}

export default EditFile;
