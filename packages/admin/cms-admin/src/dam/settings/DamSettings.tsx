import { useApolloClient, useQuery } from "@apollo/client";
import {
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
