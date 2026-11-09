import { useApolloClient, useQuery } from "@apollo/client";
import {
    Alert,
    Field,
    FieldSet,
    FillSpace,
    FinalForm,
    FinalFormSaveButton,
    Loading,
    MainContent,
    Toolbar,
    ToolbarActions,
    ToolbarBackButton,
    ToolbarTitleItem,
} from "@dextinity/admin";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { FileField, type GQLDamFileFieldFileFragment } from "../../form/file/FileField";
import { useDamConfig } from "../config/damConfig";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";
import { useDamScope } from "../config/useDamScope";
import { damSettingsQuery, updateDamSettingsMutation } from "./DamSettings.gql";
import type {
    GQLDamSettingsQuery,
    GQLDamSettingsQueryVariables,
    GQLUpdateDamSettingsMutation,
    GQLUpdateDamSettingsMutationVariables,
} from "./DamSettings.gql.generated";

interface FormValues {
    invalidLicenseFallbackImage?: GQLDamFileFieldFileFragment;
}

interface DamSettingsProps {
    contentScopeIndicator?: ReactNode;
}

export const DamSettings = ({ contentScopeIndicator }: DamSettingsProps) => {
    const scope = useDamScope();
    const { blockFilesWithInvalidLicense } = useDamConfig();
    const apolloClient = useApolloClient();
    const { filteredAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const { data, error, loading } = useQuery<GQLDamSettingsQuery, GQLDamSettingsQueryVariables>(damSettingsQuery, { variables: { scope } });

    if (error) {
        throw error;
    }

    if (loading || !data) {
        return <Loading behavior="fillPageHeight" />;
    }

    const handleSubmit = async ({ invalidLicenseFallbackImage }: FormValues) => {
        await apolloClient.mutate<GQLUpdateDamSettingsMutation, GQLUpdateDamSettingsMutationVariables>({
            mutation: updateDamSettingsMutation,
            variables: { scope, input: { invalidLicenseFallbackImageId: invalidLicenseFallbackImage?.id ?? null } },
            refetchQueries: data.damSettings ? [] : [{ query: damSettingsQuery, variables: { scope } }],
        });
    };

    return (
        <FinalForm<FormValues>
            mode="edit"
            onSubmit={handleSubmit}
            initialValues={{ invalidLicenseFallbackImage: data.damSettings?.invalidLicenseFallbackImage ?? undefined }}
        >
            {() => (
                <>
                    <Toolbar scopeIndicator={contentScopeIndicator}>
                        <ToolbarBackButton />
                        <ToolbarTitleItem>
                            <FormattedMessage id="dextinity.dam.settings.title" defaultMessage="Settings" />
                        </ToolbarTitleItem>
                        <FillSpace />
                        <ToolbarActions>
                            <FinalFormSaveButton />
                        </ToolbarActions>
                    </Toolbar>
                    <MainContent>
                        <FieldSet title={<FormattedMessage id="dextinity.dam.settings.licenses" defaultMessage="Licenses" />}>
                            {!blockFilesWithInvalidLicense && (
                                <Alert
                                    severity="info"
                                    title={
                                        <FormattedMessage
                                            id="dextinity.dam.settings.blockingFilesWithInvalidLicenseDisabled.title"
                                            defaultMessage="Blocking files with invalid licenses isn't active yet"
                                        />
                                    }
                                    sx={{ marginBottom: 4 }}
                                >
                                    <FormattedMessage
                                        id="dextinity.dam.settings.blockingFilesWithInvalidLicenseDisabled.text"
                                        defaultMessage="Files with an invalid license are still shown on the site, so the fallback image isn't used yet. You can already choose it now. To activate blocking, contact your website administrator."
                                    />
                                </Alert>
                            )}
                            <Field
                                name="invalidLicenseFallbackImage"
                                component={FileField}
                                fullWidth
                                label={
                                    <FormattedMessage
                                        id="dextinity.dam.settings.invalidLicenseFallbackImage"
                                        defaultMessage="Fallback image for invalid licenses"
                                    />
                                }
                                helperText={
                                    <FormattedMessage
                                        id="dextinity.dam.settings.invalidLicenseFallbackImage.helperText"
                                        defaultMessage="Images whose license has expired or isn't valid yet are replaced with this image on the site. If no fallback image is set, these images aren't shown at all."
                                    />
                                }
                                buttonText={<FormattedMessage id="dextinity.dam.settings.chooseImage" defaultMessage="Choose image" />}
                                allowedMimetypes={filteredAcceptedMimeTypes.pixelImage}
                            />
                        </FieldSet>
                    </MainContent>
                </>
            )}
        </FinalForm>
    );
};
