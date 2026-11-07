import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, RouterPrompt, useStackApi } from "@dextinity/admin";
import {
    Button,
    EditLayout,
    EmptyState,
    formatShortcut,
    Icon,
    isApplePlatform,
    PageHeader,
    Panel,
    Skeleton,
    ToastViewport,
    Tooltip,
    useKeyboardShortcut,
    useToasts,
} from "@dextinity/ui";
import { focusOnError, useHasUnsavedChanges } from "@dextinity/ui-react-final-form";
import { deepEqual } from "fast-equals";
import { FORM_ERROR, type FormApi } from "final-form";
import { useMemo } from "react";
import { Form, useFormState } from "react-final-form";
import { useIntl } from "react-intl";
import { useRouteMatch } from "react-router";

import { useRouterLinkClick } from "../../common/useRouterLinkClick";
import { DamFileField } from "../../form/file/DamFileField";
import type { GQLDamFileFieldFileFragment } from "../../form/file/FileField";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";
import { useDamScope } from "../config/useDamScope";
import { DamFinderFormSaveState } from "../finder/DamFinderFormState";
import { damSettingsQuery, updateDamSettingsMutation } from "./DamSettings.gql";
import type {
    GQLDamSettingsQuery,
    GQLDamSettingsQueryVariables,
    GQLUpdateDamSettingsMutation,
    GQLUpdateDamSettingsMutationVariables,
} from "./DamSettings.gql.generated";
import { HeaderActions, SettingsSection } from "./DamSettings.sc";

interface DamSettingsFormValues {
    invalidLicenseFallbackImage: GQLDamFileFieldFileFragment | null;
}

const formDecorators = [focusOnError];

/** The DAM settings of the current scope, built with `@dextinity/ui`: the fallback image for files with an invalid license. */
export function DamSettings() {
    const intl = useIntl();
    const scope = useDamScope();
    const apolloClient = useApolloClient();
    const stackApi = useStackApi();
    const match = useRouteMatch();
    const navigateWithRouter = useRouterLinkClick();
    const { filteredAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const { data, error, loading } = useQuery<GQLDamSettingsQuery, GQLDamSettingsQueryVariables>(damSettingsQuery, {
        variables: { scope },
        context: LocalErrorScopeApolloContext,
    });
    const initialValues = useMemo<DamSettingsFormValues>(
        () => ({ invalidLicenseFallbackImage: data?.damSettings?.invalidLicenseFallbackImage ?? null }),
        [data],
    );
    const assetsUrl = stackApi?.breadCrumbs[0]?.url ?? match.url.replace(/\/settings\/settings$/, "");
    const title = intl.formatMessage({ id: "dextinity.dam.settings.title", defaultMessage: "Settings" });
    const back = { label: intl.formatMessage({ id: "dextinity.damFinder.title", defaultMessage: "Assets" }), href: assetsUrl };

    if (loading || error || !data) {
        return (
            <EditLayout
                loading={loading}
                header={
                    loading ? (
                        <Skeleton variant="text" width="40%" />
                    ) : (
                        <PageHeader back={back} slotProps={{ back: { onClick: navigateWithRouter } }} title={title} />
                    )
                }
            >
                <Panel>
                    <EmptyState icon={<Icon name="warning" />} title={error?.message ?? ""} />
                </Panel>
            </EditLayout>
        );
    }

    const save = async ({ invalidLicenseFallbackImage }: DamSettingsFormValues) => {
        try {
            await apolloClient.mutate<GQLUpdateDamSettingsMutation, GQLUpdateDamSettingsMutationVariables>({
                mutation: updateDamSettingsMutation,
                variables: { scope, input: { invalidLicenseFallbackImageId: invalidLicenseFallbackImage?.id ?? null } },
                refetchQueries: data.damSettings ? [] : [{ query: damSettingsQuery, variables: { scope } }],
                context: LocalErrorScopeApolloContext,
            });
        } catch (saveError) {
            const message = intl.formatMessage(
                { id: "dextinity.dam.settings.saveFailed", defaultMessage: "Saving failed: {reason}" },
                { reason: saveError instanceof Error ? saveError.message : String(saveError) },
            );
            addToast({ tone: "error", message });
            return { [FORM_ERROR]: message };
        }
        addToast({ message: intl.formatMessage({ id: "dextinity.dam.settings.saved", defaultMessage: "Saved" }) });
        return undefined;
    };

    return (
        <>
            <Form<DamSettingsFormValues> onSubmit={save} initialValues={initialValues} initialValuesEqual={deepEqual} decorators={formDecorators}>
                {({ handleSubmit, form }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <EditLayout
                            header={
                                <PageHeader
                                    back={back}
                                    slotProps={{ back: { onClick: navigateWithRouter } }}
                                    title={title}
                                    actions={<SaveActions form={form} />}
                                />
                            }
                        >
                            <Panel
                                title={intl.formatMessage({ id: "dextinity.dam.settings.licenses", defaultMessage: "Licenses" })}
                                description={intl.formatMessage({
                                    id: "dextinity.dam.settings.invalidLicenseFallbackImage.helperText",
                                    defaultMessage:
                                        "Images whose license has expired or isn't valid yet are replaced with this image on the site. If no fallback image is set, these images aren't shown at all.",
                                })}
                            >
                                <SettingsSection>
                                    <DamFileField
                                        name="invalidLicenseFallbackImage"
                                        label={intl.formatMessage({
                                            id: "dextinity.dam.settings.invalidLicenseFallbackImage",
                                            defaultMessage: "Fallback image for invalid licenses",
                                        })}
                                        placeholder={intl.formatMessage({ id: "dextinity.dam.settings.chooseImage", defaultMessage: "Choose image" })}
                                        allowedMimetypes={filteredAcceptedMimeTypes.pixelImage}
                                    />
                                </SettingsSection>
                            </Panel>
                        </EditLayout>
                    </form>
                )}
            </Form>
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.dam.settings.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}

function SaveActions({ form }: { form: FormApi<DamSettingsFormValues> }) {
    const intl = useIntl();
    const hasUnsavedChanges = useHasUnsavedChanges();
    const { submitting } = useFormState({ subscription: { submitting: true } });
    useKeyboardShortcut("mod+s", () => void form.submit(), { allowInEditable: true });

    return (
        <HeaderActions>
            <RouterPrompt
                message={() =>
                    hasUnsavedChanges
                        ? intl.formatMessage({ id: "dextinity.dam.settings.unsavedChanges", defaultMessage: "Do you want to save your changes?" })
                        : true
                }
                saveAction={async () => {
                    await form.submit();
                    const { hasValidationErrors, hasSubmitErrors } = form.getState();
                    return !hasValidationErrors && !hasSubmitErrors;
                }}
                resetAction={() => form.reset()}
            />
            <DamFinderFormSaveState />
            <Tooltip
                content={intl.formatMessage({ id: "dextinity.dam.settings.saveTooltip", defaultMessage: "Saves the settings" })}
                shortcut={formatShortcut("mod+s").join(isApplePlatform() ? "" : "+")}
            >
                <Button type="submit" startIcon={<Icon name="check" />} loading={submitting} disabled={!hasUnsavedChanges}>
                    {intl.formatMessage({ id: "dextinity.generic.save", defaultMessage: "Save" })}
                </Button>
            </Tooltip>
        </HeaderActions>
    );
}
