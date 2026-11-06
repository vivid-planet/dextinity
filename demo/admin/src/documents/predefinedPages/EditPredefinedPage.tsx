import { useApolloClient, useQuery } from "@apollo/client";
import {
    PageEditorHeader,
    queryUpdatedAt,
    resolveHasSaveConflict,
    UnsavedChangesPrompt,
    useFormSaveConflict,
    usePageEditorHeader,
    useSavePageShortcut,
} from "@dextinity/cms-admin";
import { EditLayout, Icon, MenuItem, Panel } from "@dextinity/ui";
import { focusOnError, SelectField, useFormSaveState, useHasUnsavedChanges } from "@dextinity/ui-react-final-form";
import type { GQLPredefinedPageType } from "@src/graphql.generated";
import { FORM_ERROR, type FormApi, type SubmissionErrors } from "final-form";
import { type MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { Form, useForm, useFormState } from "react-final-form";
import { useIntl } from "react-intl";
import { useRouteMatch } from "react-router";
import { v4 as uuid } from "uuid";

import { predefinedPageQuery, savePredefinedPageMutation } from "./EditPredefinedPage.gql";
import type {
    GQLPredefinedPageQuery,
    GQLPredefinedPageQueryVariables,
    GQLSavePredefinedPageMutation,
    GQLSavePredefinedPageMutationVariables,
} from "./EditPredefinedPage.gql.generated";
import { predefinedPageLabels } from "./predefinedPageLabels";

type FormValues = {
    type: GQLPredefinedPageType | null;
};

const formDecorators = [focusOnError];

interface Props {
    id: string;
}

export const EditPredefinedPage = ({ id: pageTreeNodeId }: Props) => {
    const intl = useIntl();
    const client = useApolloClient();
    const formApiRef = useRef<FormApi<FormValues>>(undefined);
    const [newDocumentId] = useState(() => uuid());

    const { data, error, loading, refetch } = useQuery<GQLPredefinedPageQuery, GQLPredefinedPageQueryVariables>(predefinedPageQuery, {
        variables: { pageTreeNodeId },
    });

    const document = data?.pageTreeNode?.document;
    if (document != null && document.__typename !== "PredefinedPage") {
        throw new Error(`Invalid document type: ${document.__typename}`);
    }

    const initialValues = useMemo<FormValues>(() => ({ type: document?.type ?? null }), [document?.type]);

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "predefinedPage", document?.id);
            return resolveHasSaveConflict(document?.updatedAt, updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    const handleSubmit = async (formValues: FormValues): Promise<SubmissionErrors | undefined> => {
        if (await saveConflict.checkForConflicts()) {
            return { [FORM_ERROR]: intl.formatMessage({ id: "predefinedPages.edit.saveConflict", defaultMessage: "Save conflict" }) };
        }

        try {
            await client.mutate<GQLSavePredefinedPageMutation, GQLSavePredefinedPageMutationVariables>({
                mutation: savePredefinedPageMutation,
                variables: { id: document?.id ?? newDocumentId, input: { type: formValues.type }, attachedPageTreeNodeId: pageTreeNodeId },
            });
        } catch (error) {
            return { [FORM_ERROR]: error instanceof Error ? error.message : String(error) };
        }
        if (document == null) {
            await refetch();
        }
        return undefined;
    };

    if (error) {
        throw error;
    }

    return (
        <Form<FormValues> onSubmit={handleSubmit} initialValues={initialValues} decorators={formDecorators}>
            {({ handleSubmit }) => (
                <form noValidate onSubmit={handleSubmit}>
                    <PredefinedPageEditor
                        pageTreeNodeId={pageTreeNodeId}
                        loading={loading}
                        hasSaveConflict={saveConflict.hasConflict}
                        formApiRef={formApiRef}
                    />
                    {saveConflict.dialogs}
                </form>
            )}
        </Form>
    );
};

interface PredefinedPageEditorProps {
    pageTreeNodeId: string;
    loading: boolean;
    hasSaveConflict: boolean;
    formApiRef: MutableRefObject<FormApi<FormValues> | undefined>;
}

function PredefinedPageEditor({ pageTreeNodeId, loading, hasSaveConflict, formApiRef }: PredefinedPageEditorProps) {
    const intl = useIntl();
    const form = useForm<FormValues>();
    const { submitting } = useFormState({ subscription: { submitting: true } });
    const hasChanges = useHasUnsavedChanges();
    const saveState = useFormSaveState();
    const match = useRouteMatch();
    const { headerProps, openSitePreview } = usePageEditorHeader(pageTreeNodeId);

    useEffect(() => {
        formApiRef.current = form;
    }, [form, formApiRef]);

    const save = async () => {
        await form.submit();
        const { submitSucceeded, hasSubmitErrors, hasValidationErrors } = form.getState();
        return submitSucceeded && !hasSubmitErrors && !hasValidationErrors;
    };

    useSavePageShortcut(save, { hasChanges, saving: submitting });

    return (
        <>
            <UnsavedChangesPrompt hasChanges={hasChanges} onSave={save} onDiscard={() => form.reset()} allowWithin={match.url} />
            <EditLayout
                variant="form"
                loading={loading}
                header={
                    <PageEditorHeader
                        {...headerProps}
                        saveState={saveState.state}
                        savedAt={saveState.savedAt}
                        hasChanges={hasChanges}
                        saving={submitting}
                        saveError={hasSaveConflict ? "conflict" : saveState.state === "error" ? "error" : undefined}
                        onSave={() => void save()}
                        menuItems={
                            openSitePreview && (
                                <MenuItem
                                    label={intl.formatMessage({ id: "predefinedPages.edit.sitePreview", defaultMessage: "Site preview" })}
                                    icon={<Icon name="preview" />}
                                    onClick={openSitePreview}
                                />
                            )
                        }
                    />
                }
            >
                <Panel title={intl.formatMessage({ id: "predefinedPages.edit.panelTitle", defaultMessage: "Predefined page" })}>
                    <SelectField<false, GQLPredefinedPageType>
                        name="type"
                        label={intl.formatMessage({ id: "predefinedPages.type.label", defaultMessage: "Type" })}
                        helperText={intl.formatMessage({
                            id: "predefinedPages.type.helperText",
                            defaultMessage: "The site renders this page with the content of the chosen type.",
                        })}
                        placeholder={intl.formatMessage({ id: "predefinedPages.type.placeholder", defaultMessage: "Choose a type" })}
                        options={Object.entries(predefinedPageLabels).map(([value, label]) => ({
                            value: value as GQLPredefinedPageType,
                            label: intl.formatMessage(label),
                        }))}
                    />
                </Panel>
            </EditLayout>
        </>
    );
}
