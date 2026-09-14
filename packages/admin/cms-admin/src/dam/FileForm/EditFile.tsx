import { useApolloClient, useQuery } from "@apollo/client";
import {
    FieldSet,
    FillSpace,
    FinalForm,
    FinalFormSaveButton,
    Loading,
    LocalErrorScopeApolloContext,
    MainContent,
    RouterTab,
    RouterTabs,
    Toolbar,
    ToolbarActions,
    ToolbarBackButton,
    ToolbarItem,
    ToolbarTitleItem,
} from "@dextinity/admin";
import { Card, CardContent, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import isEqual from "lodash.isequal";
import { type ReactNode, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Link as RouterLink } from "react-router-dom";
import ReactSplit from "react-split";

import { useContentScope } from "../../contentScope/Provider";
import { useDependenciesConfig } from "../../dependencies/dependenciesConfig";
import { DependentsList } from "../../dependencies/DependentsList";
import type { GQLDamFileAiContentType, GQLFocalPoint, GQLImageCropAreaInput, GQLLicenseInput } from "../../graphql.generated";
import { useUserPermissionCheck } from "../../userPermissions/hooks/currentUser";
import { useDamConfig, useVideoPerformanceWarning } from "../config/damConfig";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";
import { ArchivedTag } from "../DataGrid/tags/ArchivedTag";
import { LicenseValidityTags } from "../DataGrid/tags/LicenseValidityTags";
import { MediaAlternativesGrid } from "../mediaAlternatives/MediaAlternativesGrid";
import { VideoPerformanceWarningAlert } from "../VideoPerformanceWarningAlert";
import Duplicates from "./Duplicates";
import { damFileDependentsQuery, damFileDetailQuery, updateDamFileMutation } from "./EditFile.gql";
import type { GQLDamFileDetailFragment, GQLDamFileDetailQuery, GQLDamFileDetailQueryVariables } from "./EditFile.gql.generated";
import { FilePreview } from "./FilePreview";
import { FileSettingsFields } from "./FileSettingsFields";
import { ImageInfos } from "./ImageInfos";
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
    altText?: string | null;
    aiContentType?: GQLDamFileAiContentType | null;
    title?: string | null;
    license?: Omit<GQLLicenseInput, "type"> & {
        type: LicenseType;
    };
}

interface EditFormProps {
    id: string;
    contentScopeIndicator?: ReactNode;
}

const useInitialValues = (id: string) => {
    const { loading, data, error } = useQuery<GQLDamFileDetailQuery, GQLDamFileDetailQueryVariables>(damFileDetailQuery, {
        variables: { id: id },
        skip: !id,
        context: LocalErrorScopeApolloContext,
    });
    return { loading, data, error };
};

const EditFile = ({ id, contentScopeIndicator }: EditFormProps) => {
    const { match: scopeMatch } = useContentScope();
    const initialValues = useInitialValues(id);
    const file = initialValues.data?.damFile;

    if (initialValues.loading) {
        return <Loading behavior="fillPageHeight" />;
    } else if (initialValues.error || file === undefined) {
        return (
            <Card>
                <CardContent>
                    <Typography color="error">
                        <FormattedMessage
                            id="dextinity.dam.file.failedToLoad"
                            defaultMessage="Failed to load file. <link>Go to Assets</link>"
                            values={{
                                link: (chunks) => <RouterLink to={`${scopeMatch.url}/assets`}>{chunks}</RouterLink>,
                            }}
                        />
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return <EditFileInner file={file} id={id} contentScopeIndicator={contentScopeIndicator} />;
};

export type DamFileDetails = GQLDamFileDetailFragment;

interface EditFileInnerProps {
    file: DamFileDetails;
    id: string;
    contentScopeIndicator?: ReactNode;
}

const EditFileInner = ({ file, id, contentScopeIndicator }: EditFileInnerProps) => {
    const { entityDependencyMap } = useDependenciesConfig();
    const acceptedMimeTypes = useDamAcceptedMimeTypes();
    const intl = useIntl();
    const damConfig = useDamConfig();
    const { isVideoTooLarge } = useVideoPerformanceWarning();
    const apolloClient = useApolloClient();
    const isAllowed = useUserPermissionCheck();

    const onSubmit = useCallback(
        async (values: EditFileFormValues) => {
            let cropArea: GQLImageCropAreaInput;

            if (values.focalPoint === "SMART") {
                cropArea = {
                    focalPoint: "SMART",
                    x: null,
                    y: null,
                    width: null,
                    height: null,
                };
            } else {
                cropArea = {
                    focalPoint: values.focalPoint,
                    x: values.crop.x,
                    y: values.crop.y,
                    width: values.crop.width ? Math.ceil(values.crop.width) : undefined,
                    height: values.crop.height ? Math.ceil(values.crop.height) : undefined,
                };
            }

            await apolloClient.mutate({
                mutation: updateDamFileMutation,
                variables: {
                    id,
                    input: {
                        name: values.name,
                        altText: values.altText ?? null,
                        aiContentType: values.aiContentType ?? null,
                        title: values.title ?? null,
                        image: {
                            cropArea,
                        },
                        license: values.license?.type === "NO_LICENSE" ? null : { ...values.license, type: values.license?.type },
                        folderId: file.folder?.id ?? null,
                    },
                },
            });
        },
        [apolloClient, file.folder?.id, id],
    );

    const initialBlockListWidth = 100 / 3;
    const initialPreviewWidth = 100 - initialBlockListWidth;

    return (
        <FinalForm<EditFileFormValues>
            mode="edit"
            onSubmit={onSubmit}
            initialValues={{
                name: file.name,
                focalPoint: file.image?.cropArea.focalPoint ?? "SMART",
                crop: {
                    width: file.image?.cropArea.width ?? 100,
                    height: file.image?.cropArea.height ?? 100,
                    x: file.image?.cropArea.x ?? 0,
                    y: file.image?.cropArea.y ?? 0,
                },
                altText: file.altText,
                aiContentType: file.aiContentType,
                title: file.title,
                license: {
                    type: file.license?.type ?? "NO_LICENSE",
                    details: file.license?.details,
                    author: file.license?.author,
                    durationFrom: file.license?.durationFrom ? Date.parse(file.license?.durationFrom) : undefined,
                    durationTo: file.license?.durationTo ? Date.parse(file.license?.durationTo) : undefined,
                },
            }}
            initialValuesEqual={(prevValues, newValues) => isEqual(prevValues, newValues)}
        >
            {() => (
                <>
                    <Toolbar scopeIndicator={contentScopeIndicator}>
                        <ToolbarBackButton />
                        <ToolbarTitleItem>{file.name}</ToolbarTitleItem>
                        {file.archived && (
                            <ToolbarItem>
                                <ArchivedTag />
                            </ToolbarItem>
                        )}
                        {damConfig.enableLicenseFeature &&
                            (file.license?.isNotValidYet || file.license?.expiresWithinThirtyDays || file.license?.hasExpired) && (
                                <ToolbarItem>
                                    <LicenseValidityTags
                                        expirationDate={file.license?.expirationDate ? new Date(file.license.expirationDate) : undefined}
                                        isNotValidYet={file.license?.isNotValidYet}
                                        expiresWithinThirtyDays={file.license?.expiresWithinThirtyDays}
                                        hasExpired={file.license?.hasExpired}
                                    />
                                </ToolbarItem>
                            )}
                        <FillSpace />
                        <ToolbarActions>
                            <FinalFormSaveButton />
                        </ToolbarActions>
                    </Toolbar>
                    <MainContent>
                        {isVideoTooLarge(file) && <VideoPerformanceWarningAlert sx={{ marginBottom: 4 }} />}
                        <ReactSplit sizes={[initialPreviewWidth, initialBlockListWidth]} minSize={360} gutterSize={40} style={{ display: "flex" }}>
                            <StickyScrollWrapper>
                                <FilePreview file={file} />
                            </StickyScrollWrapper>
                            <RouterTabs>
                                <RouterTab
                                    key="settings"
                                    label={intl.formatMessage({ id: "dextinity.dam.file.settings", defaultMessage: "Settings" })}
                                    path=""
                                >
                                    <FileSettingsFields file={file} />
                                </RouterTab>
                                {file.image !== null && (
                                    <RouterTab
                                        key="infos"
                                        label={intl.formatMessage({ id: "dextinity.dam.file.infos", defaultMessage: "Infos" })}
                                        path="/infos"
                                    >
                                        <ImageInfos
                                            imageInfos={{
                                                width: file.image.width,
                                                height: file.image.height,
                                                fileSize: file.size,
                                                fileFormat: file.name.split(".").pop() as string,
                                                exif: file.image.exif,
                                            }}
                                        />
                                    </RouterTab>
                                )}
                                {showMediaAlternativesTab(file, acceptedMimeTypes) && (
                                    <RouterTab
                                        key="media-alternatives"
                                        label={intl.formatMessage({
                                            id: "dextinity.dam.file.mediaAlternatives.tabTitle",
                                            defaultMessage: "Media alternatives",
                                        })}
                                        path="/media-alternatives"
                                    >
                                        {acceptedMimeTypes.filteredAcceptedMimeTypes.video.includes(file.mimetype) && (
                                            <FieldSet
                                                title={<FormattedMessage id="dextinity.dam.file.captions" defaultMessage="Captions" />}
                                                disablePadding
                                            >
                                                <MediaAlternativesGrid file={file} type="captions" direction="for" />
                                            </FieldSet>
                                        )}
                                        {acceptedMimeTypes.filteredAcceptedMimeTypes.captions.includes(file.mimetype) && (
                                            <FieldSet
                                                title={
                                                    <FormattedMessage
                                                        id="dextinity.dam.file.videosUsingCaptions"
                                                        defaultMessage="Videos using these captions"
                                                    />
                                                }
                                                disablePadding
                                            >
                                                <MediaAlternativesGrid file={file} type="captions" direction="alternative" />
                                            </FieldSet>
                                        )}
                                    </RouterTab>
                                )}
                                <RouterTab
                                    key="duplicates"
                                    label={intl.formatMessage({ id: "dextinity.dam.file.duplicates.tabTitle", defaultMessage: "Duplicates" })}
                                    path="/duplicates"
                                >
                                    <Duplicates fileId={file.id} />
                                </RouterTab>
                                {isAllowed("dependencies") && Object.keys(entityDependencyMap).length > 0 && (
                                    <RouterTab
                                        key="dependents"
                                        label={intl.formatMessage({ id: "dextinity.dam.file.dependents", defaultMessage: "Dependents" })}
                                        path="/dependents"
                                    >
                                        <DependentsList
                                            query={damFileDependentsQuery}
                                            variables={{
                                                id: id,
                                            }}
                                        />
                                    </RouterTab>
                                )}
                            </RouterTabs>
                        </ReactSplit>
                    </MainContent>
                </>
            )}
        </FinalForm>
    );
};

const FullHeightWrapper = styled("div")`
    height: 100%;
`;

const StickyWrapper = styled("div")`
    position: sticky;
    top: 140px;
`;

const StickyScrollWrapper = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            <FullHeightWrapper>
                <StickyWrapper>{children}</StickyWrapper>
            </FullHeightWrapper>
        </div>
    );
};

function showMediaAlternativesTab(file: DamFileDetails, acceptedMimeTypes: ReturnType<typeof useDamAcceptedMimeTypes>) {
    return (
        acceptedMimeTypes.filteredAcceptedMimeTypes.video.includes(file.mimetype) ||
        acceptedMimeTypes.filteredAcceptedMimeTypes.captions.includes(file.mimetype)
    );
}

export default EditFile;
