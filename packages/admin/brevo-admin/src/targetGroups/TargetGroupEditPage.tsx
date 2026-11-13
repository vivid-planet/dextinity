import { type DocumentNode, useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, RouterPrompt } from "@dextinity/admin";
import { type ContentScope, queryUpdatedAt, resolveHasSaveConflict, useFormSaveConflict, useRouterLinkClick } from "@dextinity/cms-admin";
import {
    Banner,
    Button,
    EditLayout,
    EmptyState,
    formatShortcut,
    Icon,
    isApplePlatform,
    PageHeader,
    Panel,
    Tooltip,
    useKeyboardShortcut,
} from "@dextinity/ui";
import { focusOnError, InputField, useHasUnsavedChanges } from "@dextinity/ui-react-final-form";
import { FORM_ERROR, type FormApi, type SubmissionErrors } from "final-form";
import { type JSX, type ReactNode, useId, useMemo, useRef } from "react";
import { Form, useForm, useFormState } from "react-final-form";
import { useIntl } from "react-intl";

import { BrevoFormSaveState } from "../common/form/BrevoFormSaveState";
import { FormSection } from "../common/form/FormSection";
import { TargetGroupContactsTabs } from "./contacts/TargetGroupContactsTabs";
import { createTargetGroupFormFragment } from "./createTargetGroupFormFragment";
import { targetGroupFormQuery, updateTargetGroupMutation } from "./TargetGroupEditPage.gql";
import type {
    GQLTargetGroupFormQuery,
    GQLTargetGroupFormQueryVariables,
    GQLUpdateTargetGroupMutation,
    GQLUpdateTargetGroupMutationVariables,
} from "./TargetGroupEditPage.gql.generated";
import { EditorContent, FormContent, HeaderActions } from "./TargetGroupEditPage.sc";

export interface EditTargetGroupFinalFormValues {
    title: string;
    [key: string]: unknown;
}

type TargetGroup = GQLTargetGroupFormQuery["brevoTargetGroup"];

interface TargetGroupEditPageProps {
    id: string;
    scope: ContentScope;
    scopeLabel: string;
    listUrl: string;
    additionalFormFields?: ReactNode;
    nodeFragment?: { name: string; fragment: DocumentNode };
    input2State?: (values?: EditTargetGroupFinalFormValues) => EditTargetGroupFinalFormValues;
    valuesToOutput?: (values: EditTargetGroupFinalFormValues) => EditTargetGroupFinalFormValues;
}

const formDecorators = [focusOnError];

/**
 * A target group: its title and the filters that assign contacts by their attributes, and the contacts added by hand or assigned.
 */
export function TargetGroupEditPage({
    id,
    scope,
    scopeLabel,
    listUrl,
    additionalFormFields,
    nodeFragment,
    input2State,
    valuesToOutput,
}: TargetGroupEditPageProps): JSX.Element {
    const intl = useIntl();
    const client = useApolloClient();
    const formApiRef = useRef<FormApi<EditTargetGroupFinalFormValues>>(undefined);

    const targetGroupFormFragment = useMemo(
        () => (additionalFormFields && nodeFragment ? createTargetGroupFormFragment(nodeFragment) : undefined),
        [additionalFormFields, nodeFragment],
    );
    const formQuery = useMemo(() => targetGroupFormQuery(targetGroupFormFragment), [targetGroupFormFragment]);

    const { data, error, loading, refetch } = useQuery<GQLTargetGroupFormQuery, GQLTargetGroupFormQueryVariables>(formQuery, {
        variables: { id },
        context: LocalErrorScopeApolloContext,
    });
    const targetGroup = data?.brevoTargetGroup;

    const initialValues = useMemo<EditTargetGroupFinalFormValues>(
        () => ({ title: targetGroup?.title ?? "", ...input2State?.(targetGroup as EditTargetGroupFinalFormValues | undefined) }),
        [targetGroup, input2State],
    );

    const saveConflict = useFormSaveConflict({
        checkConflict: async () => {
            const updatedAt = await queryUpdatedAt(client, "brevoTargetGroup", id);
            return resolveHasSaveConflict(targetGroup?.updatedAt, updatedAt);
        },
        formApiRef,
        loadLatestVersion: async () => {
            await refetch();
        },
    });

    const backLabel = intl.formatMessage({ id: "dextinity.targetGroups.targetGroups", defaultMessage: "Target groups" });

    if (!targetGroup) {
        return (
            <EditLayout
                header={
                    <TargetGroupHeader
                        scopeLabel={scopeLabel}
                        listUrl={listUrl}
                        backLabel={backLabel}
                        title={intl.formatMessage({ id: "dextinity.targetGroups.TargetGroup", defaultMessage: "Target group" })}
                    />
                }
                loading={loading}
            >
                <EmptyState
                    icon={<Icon name="warning-triangle" />}
                    title={intl.formatMessage({ id: "dextinity.targetGroup.loadFailed", defaultMessage: "The target group couldn't be loaded" })}
                    description={error?.message}
                />
            </EditLayout>
        );
    }

    const save = async (values: EditTargetGroupFinalFormValues): Promise<SubmissionErrors | undefined> => {
        if (await saveConflict.checkForConflicts()) {
            return {
                [FORM_ERROR]: intl.formatMessage({
                    id: "dextinity.targetGroup.saveConflict",
                    defaultMessage: "Someone else changed the target group in the meantime",
                }),
            };
        }
        try {
            await client.mutate<GQLUpdateTargetGroupMutation, GQLUpdateTargetGroupMutationVariables>({
                mutation: updateTargetGroupMutation(targetGroupFormFragment),
                variables: { id, input: valuesToOutput ? valuesToOutput(values) : values, lastUpdatedAt: targetGroup.updatedAt },
                context: LocalErrorScopeApolloContext,
                refetchQueries: ["TargetGroupForm"],
                awaitRefetchQueries: true,
            });
            return undefined;
        } catch (saveError) {
            return {
                [FORM_ERROR]: intl.formatMessage(
                    { id: "dextinity.targetGroup.saveFailed", defaultMessage: "Saving failed: {reason}" },
                    { reason: saveError instanceof Error ? saveError.message : String(saveError) },
                ),
            };
        }
    };

    return (
        <Form<EditTargetGroupFinalFormValues> onSubmit={save} initialValues={initialValues} decorators={formDecorators}>
            {({ form }) => {
                formApiRef.current = form;
                return (
                    <>
                        {saveConflict.dialogs}
                        <TargetGroupEditContent
                            targetGroup={targetGroup}
                            scope={scope}
                            scopeLabel={scopeLabel}
                            listUrl={listUrl}
                            backLabel={backLabel}
                            additionalFormFields={additionalFormFields}
                            hasConflict={saveConflict.hasConflict}
                        />
                    </>
                );
            }}
        </Form>
    );
}

interface TargetGroupHeaderProps {
    scopeLabel: string;
    listUrl: string;
    backLabel: string;
    title: string;
    subtitle?: ReactNode;
    actions?: ReactNode;
}

function TargetGroupHeader({ scopeLabel, listUrl, backLabel, title, subtitle, actions }: TargetGroupHeaderProps) {
    const navigateWithRouter = useRouterLinkClick();
    return (
        <PageHeader
            back={{ label: backLabel, href: listUrl }}
            slotProps={{ back: { onClick: navigateWithRouter } }}
            eyebrow={scopeLabel}
            title={title}
            subtitle={subtitle}
            actions={actions}
        />
    );
}

interface TargetGroupEditContentProps {
    targetGroup: TargetGroup;
    scope: ContentScope;
    scopeLabel: string;
    listUrl: string;
    backLabel: string;
    additionalFormFields?: ReactNode;
    hasConflict: boolean;
}

function TargetGroupEditContent({
    targetGroup,
    scope,
    scopeLabel,
    listUrl,
    backLabel,
    additionalFormFields,
    hasConflict,
}: TargetGroupEditContentProps) {
    const intl = useIntl();
    const form = useForm<EditTargetGroupFinalFormValues>();
    const formId = useId();
    const hasUnsavedChanges = useHasUnsavedChanges();
    const { submitting, submitError } = useFormState({ subscription: { submitting: true, submitError: true } });

    useKeyboardShortcut("mod+s", () => void form.submit(), { allowInEditable: true });
    const saveShortcut = formatShortcut("mod+s").join(isApplePlatform() ? "" : "+");

    const submitAndReportSuccess = async () => {
        await form.submit();
        const { hasValidationErrors, hasSubmitErrors } = form.getState();
        return !hasValidationErrors && !hasSubmitErrors;
    };

    return (
        <RouterPrompt
            message={() =>
                hasUnsavedChanges
                    ? intl.formatMessage({ id: "dextinity.targetGroup.unsavedChanges", defaultMessage: "Do you want to save your changes?" })
                    : true
            }
            saveAction={submitAndReportSuccess}
            resetAction={() => form.reset()}
        >
            <EditLayout
                header={
                    <TargetGroupHeader
                        scopeLabel={scopeLabel}
                        listUrl={listUrl}
                        backLabel={backLabel}
                        title={targetGroup.title}
                        subtitle={intl.formatMessage(
                            {
                                id: "dextinity.targetGroup.contactCount",
                                defaultMessage: "{count, plural, one {# contact} other {# contacts}}",
                            },
                            { count: targetGroup.totalSubscribers },
                        )}
                        actions={
                            <HeaderActions>
                                <BrevoFormSaveState />
                                <Tooltip
                                    content={intl.formatMessage({
                                        id: "dextinity.targetGroup.saveTooltip",
                                        defaultMessage: "Saves the title and the filters",
                                    })}
                                    shortcut={saveShortcut}
                                >
                                    <Button
                                        type="submit"
                                        form={formId}
                                        startIcon={<Icon name="check" />}
                                        loading={submitting}
                                        disabled={!hasUnsavedChanges || hasConflict}
                                    >
                                        {intl.formatMessage({ id: "dextinity.targetGroup.save", defaultMessage: "Save" })}
                                    </Button>
                                </Tooltip>
                            </HeaderActions>
                        }
                    />
                }
            >
                <EditorContent>
                    <Panel>
                        <form
                            id={formId}
                            onSubmit={(event) => {
                                event.preventDefault();
                                void form.submit();
                            }}
                            noValidate
                            aria-label={intl.formatMessage({ id: "dextinity.targetGroups.TargetGroup", defaultMessage: "Target group" })}
                        >
                            <FormContent>
                                {submitError ? <Banner tone="error">{submitError}</Banner> : null}
                                <InputField
                                    name="title"
                                    label={intl.formatMessage({ id: "dextinity.targetGroup.title", defaultMessage: "Title" })}
                                    required
                                    requiredMessage={intl.formatMessage({
                                        id: "dextinity.targetGroup.titleRequired",
                                        defaultMessage: "Enter a title",
                                    })}
                                />
                                {additionalFormFields ? (
                                    <FormSection
                                        title={intl.formatMessage({ id: "dextinity.targetGroup.filters", defaultMessage: "Filters" })}
                                        description={intl.formatMessage({
                                            id: "dextinity.targetGroup.filters.explainText",
                                            defaultMessage:
                                                "Contacts will get assigned automatically to this target group depending on their attributes",
                                        })}
                                        columns
                                    >
                                        {additionalFormFields}
                                    </FormSection>
                                ) : null}
                            </FormContent>
                        </form>
                    </Panel>
                    <TargetGroupContactsTabs
                        targetGroupId={targetGroup.id}
                        scope={scope}
                        hasManuallyAddedContacts={targetGroup.assignedContactsTargetGroupBrevoId != null}
                        hasAssignedContacts={targetGroup.brevoId != null}
                    />
                </EditorContent>
            </EditLayout>
        </RouterPrompt>
    );
}
