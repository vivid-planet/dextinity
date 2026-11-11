import { useApolloClient, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import {
    BlockAdminComponentRoot,
    BlockContentEditor,
    type BlockInterface,
    type BlockState,
    type ContentScope,
    createFinalFormBlock,
    queryUpdatedAt,
    resolveHasSaveConflict,
    useBlockContext,
    useBlockPreview,
    useRouterLinkClick,
} from "@dextinity/cms-admin";
import { Button, EmptyState, formatShortcut, Icon, isApplePlatform, type NewToast, PageHeader, Panel, Tooltip } from "@dextinity/ui";
import { focusOnError, useHasUnsavedChanges } from "@dextinity/ui-react-final-form";
import { deepEqual } from "fast-equals";
import { FORM_ERROR, type FormApi, type SubmissionErrors } from "final-form";
import { type ComponentType, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Field, type FieldRenderProps, Form, useFormState } from "react-final-form";
import { FormattedDate, useIntl } from "react-intl";
import { Redirect, useHistory, useRouteMatch } from "react-router";

import { useBrevoConfig } from "../../common/BrevoConfigProvider";
import { BrevoFormSaveState } from "../../common/form/BrevoFormSaveState";
import { isEmailCampaignEditable } from "../common/emailCampaignActions";
import { EmailCampaignSendingState } from "../common/EmailCampaignSendingState";
import { createEmailCampaignMutation, emailCampaignEditorQuery, updateEmailCampaignMutation } from "./EmailCampaignEditor.gql";
import type {
    GQLCreateEmailCampaignMutation,
    GQLCreateEmailCampaignMutationVariables,
    GQLEmailCampaignEditorFragment,
    GQLEmailCampaignEditorQuery,
    GQLEmailCampaignEditorQueryVariables,
    GQLUpdateEmailCampaignMutation,
    GQLUpdateEmailCampaignMutationVariables,
} from "./EmailCampaignEditor.gql.generated";
import { MetaLine } from "./EmailCampaignEditor.sc";
import { type EmailCampaignFormValues, useRegisterEmailCampaignFields } from "./emailCampaignFormValues";
import { EmailCampaignSendingTab } from "./EmailCampaignSendingTab";
import { EmailCampaignSettingsTab } from "./EmailCampaignSettingsTab";

interface EmailCampaignEditorProps {
    baseUrl: string;
    id?: string;
    scope: ContentScope;
    scopeLabel: string;
    addToast: (toast: NewToast) => void;
    EmailCampaignContentBlock: BlockInterface;
}

/** Edits an email campaign: its blocks next to the live preview, the subject, and when and to whom it is sent. */
export function EmailCampaignEditor({ baseUrl, id, scope, scopeLabel, addToast, EmailCampaignContentBlock }: EmailCampaignEditorProps) {
    const intl = useIntl();
    const { previewUrl } = useBrevoConfig();
    const { data, error, loading } = useQuery<GQLEmailCampaignEditorQuery, GQLEmailCampaignEditorQueryVariables>(
        emailCampaignEditorQuery,
        id ? { variables: { id }, context: LocalErrorScopeApolloContext } : { skip: true },
    );
    const campaign = data?.brevoEmailCampaign;
    const eyebrow = [intl.formatMessage({ id: "dextinity.emailCampaigns.emailCampaign", defaultMessage: "Email campaign" }), scopeLabel]
        .filter(Boolean)
        .join(" · ");

    if (error) {
        return <EmailCampaignLoadError baseUrl={baseUrl} eyebrow={eyebrow} reason={error.message} />;
    }

    if (id != null && campaign == null) {
        return (
            <BlockContentEditor
                header={<EditorHeader baseUrl={baseUrl} eyebrow={eyebrow} />}
                tabs={[]}
                preview={{ url: previewUrl, siteUrl: null, state: undefined }}
                loading={loading}
            />
        );
    }

    if (campaign != null && !isEmailCampaignEditable(campaign)) {
        return <Redirect to={`${baseUrl}/${campaign.id}/view`} />;
    }

    return (
        <EmailCampaignForm
            baseUrl={baseUrl}
            campaign={campaign}
            scope={scope}
            eyebrow={eyebrow}
            addToast={addToast}
            EmailCampaignContentBlock={EmailCampaignContentBlock}
        />
    );
}

interface EditorHeaderProps {
    baseUrl: string;
    eyebrow: string;
    title?: string;
    subtitle?: ReactNode;
    actions?: ReactNode;
}

function EditorHeader({ baseUrl, eyebrow, title, subtitle, actions }: EditorHeaderProps) {
    const intl = useIntl();
    const navigateWithRouter = useRouterLinkClick();
    return (
        <PageHeader
            variant="compact"
            back={{ label: intl.formatMessage({ id: "dextinity.emailCampaigns.emailCampaigns", defaultMessage: "Email campaigns" }), href: baseUrl }}
            slotProps={{ back: { onClick: navigateWithRouter } }}
            eyebrow={eyebrow}
            title={title ?? intl.formatMessage({ id: "dextinity.emailCampaigns.loading", defaultMessage: "Loading campaign …" })}
            subtitle={subtitle}
            actions={actions}
        />
    );
}

interface EmailCampaignLoadErrorProps {
    baseUrl: string;
    eyebrow: string;
    reason: string;
}

function EmailCampaignLoadError({ baseUrl, eyebrow, reason }: EmailCampaignLoadErrorProps) {
    const intl = useIntl();
    const navigateWithRouter = useRouterLinkClick();
    return (
        <BlockContentEditor
            header={
                <EditorHeader
                    baseUrl={baseUrl}
                    eyebrow={eyebrow}
                    title={intl.formatMessage({ id: "dextinity.emailCampaigns.loadFailed", defaultMessage: "This campaign can't be opened" })}
                />
            }
            tabs={[
                {
                    key: "error",
                    label: "",
                    content: (
                        <Panel>
                            <EmptyState
                                icon={<Icon name="warning" />}
                                title={reason}
                                actions={
                                    <Button variant="outlined" color="secondary" size="small" href={baseUrl} onClick={navigateWithRouter}>
                                        {intl.formatMessage({ id: "dextinity.emailCampaigns.backToList", defaultMessage: "Back to the campaigns" })}
                                    </Button>
                                }
                            />
                        </Panel>
                    ),
                },
            ]}
        />
    );
}

function toFormValues(EmailCampaignContentBlock: BlockInterface, campaign?: GQLEmailCampaignEditorFragment): EmailCampaignFormValues {
    if (campaign == null) {
        return { title: "", subject: "", targetGroups: [], scheduledAt: null, content: EmailCampaignContentBlock.defaultValues() };
    }
    return {
        title: campaign.title,
        subject: campaign.subject,
        targetGroups: campaign.brevoTargetGroups,
        // The schedule of a failed sending is in the past, so it must be chosen again
        scheduledAt: campaign.sendingState === "FAILED" ? null : (campaign.scheduledAt ?? null),
        content: EmailCampaignContentBlock.input2State(campaign.content),
    };
}

const formDecorators = [focusOnError];

interface EmailCampaignFormProps {
    baseUrl: string;
    campaign?: GQLEmailCampaignEditorFragment;
    scope: ContentScope;
    eyebrow: string;
    addToast: (toast: NewToast) => void;
    EmailCampaignContentBlock: BlockInterface;
}

function EmailCampaignForm({ baseUrl, campaign, scope, eyebrow, addToast, EmailCampaignContentBlock }: EmailCampaignFormProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const [savedCampaign, setSavedCampaign] = useState(campaign);
    const [savedValues, setSavedValues] = useState(() => toFormValues(EmailCampaignContentBlock, campaign));
    const [isContentInvalid, setIsContentInvalid] = useState(false);
    const shouldOverwriteNewerVersion = useRef(false);

    const save = async (values: EmailCampaignFormValues, form: FormApi<EmailCampaignFormValues>): Promise<SubmissionErrors | undefined> => {
        const overwriteNewerVersion = shouldOverwriteNewerVersion.current;
        shouldOverwriteNewerVersion.current = false;

        const isContentValid = await EmailCampaignContentBlock.isValid(values.content);
        setIsContentInvalid(!isContentValid);
        if (!isContentValid) {
            const invalidMessage = intl.formatMessage({
                id: "dextinity.emailCampaigns.contentInvalid",
                defaultMessage: "Not saved: some blocks contain errors",
            });
            addToast({ tone: "error", message: invalidMessage });
            return { [FORM_ERROR]: invalidMessage };
        }

        const input = {
            title: values.title,
            subject: values.subject,
            content: EmailCampaignContentBlock.state2Output(values.content),
            brevoTargetGroups: values.targetGroups.map((targetGroup) => targetGroup.id),
            scheduledAt: values.targetGroups.length > 0 ? values.scheduledAt : null,
        };

        try {
            if (savedCampaign && !overwriteNewerVersion) {
                const currentUpdatedAt = await queryUpdatedAt(client, "brevoEmailCampaign", savedCampaign.id);
                if (resolveHasSaveConflict(savedCampaign.updatedAt, currentUpdatedAt)) {
                    const conflictMessage = intl.formatMessage({
                        id: "dextinity.emailCampaigns.saveConflict",
                        defaultMessage: "Not saved: someone else saved this campaign in the meantime",
                    });
                    addToast({
                        tone: "error",
                        message: conflictMessage,
                        action: {
                            label: intl.formatMessage({ id: "dextinity.emailCampaigns.overwrite", defaultMessage: "Overwrite" }),
                            onClick: () => {
                                shouldOverwriteNewerVersion.current = true;
                                void form.submit();
                            },
                        },
                    });
                    return { [FORM_ERROR]: conflictMessage };
                }
            }

            let result: GQLEmailCampaignEditorFragment | undefined;
            if (savedCampaign) {
                const { data } = await client.mutate<GQLUpdateEmailCampaignMutation, GQLUpdateEmailCampaignMutationVariables>({
                    mutation: updateEmailCampaignMutation,
                    variables: { id: savedCampaign.id, input, lastUpdatedAt: overwriteNewerVersion ? undefined : savedCampaign.updatedAt },
                    context: LocalErrorScopeApolloContext,
                });
                result = data?.updateBrevoEmailCampaign;
            } else {
                const { data } = await client.mutate<GQLCreateEmailCampaignMutation, GQLCreateEmailCampaignMutationVariables>({
                    mutation: createEmailCampaignMutation,
                    variables: { scope, input },
                    context: LocalErrorScopeApolloContext,
                });
                result = data?.createBrevoEmailCampaign;
            }
            setSavedCampaign(result);
            setSavedValues(values);
            addToast({
                tone: "success",
                message:
                    result?.sendingState === "SCHEDULED"
                        ? intl.formatMessage({ id: "dextinity.emailCampaigns.savedScheduled", defaultMessage: "Saved – the campaign is scheduled" })
                        : intl.formatMessage({ id: "dextinity.emailCampaigns.saved", defaultMessage: "Saved" }),
            });
            return undefined;
        } catch (error) {
            const failureMessage = intl.formatMessage(
                { id: "dextinity.emailCampaigns.saveFailed", defaultMessage: "Saving failed: {reason}" },
                { reason: error instanceof Error ? error.message : String(error) },
            );
            addToast({ tone: "error", message: failureMessage });
            return { [FORM_ERROR]: failureMessage };
        }
    };

    const requiredMessage = intl.formatMessage({ id: "dextinity.emailCampaigns.required", defaultMessage: "Required" });
    const validate = (values: EmailCampaignFormValues) => {
        const errors: Partial<Record<keyof EmailCampaignFormValues, string>> = {};
        if (values.title.trim() === "") {
            errors.title = requiredMessage;
        }
        if (values.subject.trim() === "") {
            errors.subject = requiredMessage;
        }
        if (values.targetGroups.length > 0 && values.scheduledAt != null && new Date(values.scheduledAt) < new Date()) {
            errors.scheduledAt = intl.formatMessage({
                id: "dextinity.emailCampaigns.scheduledAt.pastDate",
                defaultMessage: "Choose a date and time in the future",
            });
        }
        return errors;
    };

    return (
        <Form<EmailCampaignFormValues>
            onSubmit={save}
            initialValues={savedValues}
            validate={validate}
            keepDirtyOnReinitialize
            decorators={formDecorators}
        >
            {({ form }) => (
                <EmailCampaignFormContent
                    baseUrl={baseUrl}
                    savedCampaign={savedCampaign}
                    scope={scope}
                    eyebrow={eyebrow}
                    form={form}
                    isContentInvalid={isContentInvalid}
                    addToast={addToast}
                    EmailCampaignContentBlock={EmailCampaignContentBlock}
                />
            )}
        </Form>
    );
}

interface EmailCampaignFormContentProps {
    baseUrl: string;
    savedCampaign?: GQLEmailCampaignEditorFragment;
    scope: ContentScope;
    eyebrow: string;
    form: FormApi<EmailCampaignFormValues>;
    isContentInvalid: boolean;
    addToast: (toast: NewToast) => void;
    EmailCampaignContentBlock: BlockInterface;
}

const formStateSubscription = { values: true, errors: true, submitFailed: true, submitting: true } as const;

function EmailCampaignFormContent({
    baseUrl,
    savedCampaign,
    scope,
    eyebrow,
    form,
    isContentInvalid,
    addToast,
    EmailCampaignContentBlock,
}: EmailCampaignFormContentProps) {
    const intl = useIntl();
    const history = useHistory();
    const match = useRouteMatch();
    const { previewUrl } = useBrevoConfig();
    const previewApi = useBlockPreview();
    const blockContext = useBlockContext();
    useRegisterEmailCampaignFields();
    const hasUnsavedChanges = useHasUnsavedChanges();
    const { values, errors, submitFailed, submitting } = useFormState<EmailCampaignFormValues>({ subscription: formStateSubscription });
    const FinalFormContentBlock = useMemo(
        () => createFinalFormBlock(EmailCampaignContentBlock) as ComponentType<FieldRenderProps<BlockState<BlockInterface>>>,
        [EmailCampaignContentBlock],
    );

    const createdId = match.url === `${baseUrl}/add` ? savedCampaign?.id : undefined;
    useEffect(() => {
        if (createdId != null && !hasUnsavedChanges) {
            const { pathname, search } = history.location;
            history.replace(`${pathname.replace(`${baseUrl}/add`, `${baseUrl}/${createdId}/edit`)}${search}`);
        }
    }, [baseUrl, history, createdId, hasUnsavedChanges]);

    const submit = async () => {
        await form.submit();
        const { hasValidationErrors, hasSubmitErrors } = form.getState();
        if (hasValidationErrors) {
            addToast({
                tone: "error",
                message: intl.formatMessage({
                    id: "dextinity.emailCampaigns.invalid",
                    defaultMessage: "Not saved: check the marked fields",
                }),
            });
        }
        return !hasValidationErrors && !hasSubmitErrors;
    };

    const previewState = {
        emailCampaignId: savedCampaign?.id,
        scope,
        content: EmailCampaignContentBlock.createPreviewState(values.content, {
            ...blockContext,
            parentUrl: match.url,
            showVisibleOnly: previewApi.showOnlyVisible,
        }),
    };

    const saveShortcut = formatShortcut("mod+s").join(isApplePlatform() ? "" : "+");
    const title = savedCampaign?.title ?? intl.formatMessage({ id: "dextinity.emailCampaigns.newTitle", defaultMessage: "New email campaign" });

    return (
        <BlockContentEditor
            header={
                <EditorHeader
                    baseUrl={baseUrl}
                    eyebrow={eyebrow}
                    title={title}
                    subtitle={
                        savedCampaign ? (
                            <MetaLine>
                                <EmailCampaignSendingState sendingState={savedCampaign.sendingState} />
                                {savedCampaign.sendingState === "SCHEDULED" && savedCampaign.scheduledAt != null && (
                                    <span>
                                        <FormattedDate value={savedCampaign.scheduledAt} dateStyle="medium" timeStyle="short" />
                                    </span>
                                )}
                            </MetaLine>
                        ) : undefined
                    }
                    actions={
                        <>
                            {(savedCampaign != null || hasUnsavedChanges) && <BrevoFormSaveState />}
                            <Tooltip
                                content={intl.formatMessage({ id: "dextinity.emailCampaigns.saveTooltip", defaultMessage: "Saves the campaign" })}
                                shortcut={saveShortcut}
                            >
                                <Button
                                    startIcon={<Icon name="check" />}
                                    loading={submitting}
                                    disabled={!hasUnsavedChanges && savedCampaign != null}
                                    onClick={() => void submit()}
                                >
                                    {intl.formatMessage({ id: "dextinity.emailCampaigns.save", defaultMessage: "Save" })}
                                </Button>
                            </Tooltip>
                        </>
                    }
                />
            }
            preview={{ url: previewUrl, siteUrl: null, state: previewState }}
            previewApi={previewApi}
            save={{
                hasChanges: hasUnsavedChanges,
                saving: submitting,
                onSave: submit,
                onDiscard: () => form.reset(),
            }}
            tabs={[
                {
                    key: "content",
                    label: intl.formatMessage({ id: "dextinity.emailCampaigns.content", defaultMessage: "Content" }),
                    invalid: isContentInvalid,
                    content: (
                        <BlockAdminComponentRoot contentKind="email">
                            <Field name="content" component={FinalFormContentBlock} isEqual={deepEqual} />
                        </BlockAdminComponentRoot>
                    ),
                },
                {
                    key: "settings",
                    label: intl.formatMessage({ id: "dextinity.emailCampaigns.settings", defaultMessage: "Settings" }),
                    invalid: submitFailed && (errors?.title != null || errors?.subject != null),
                    content: <EmailCampaignSettingsTab />,
                },
                {
                    key: "sending",
                    label: intl.formatMessage({ id: "dextinity.emailCampaigns.sending", defaultMessage: "Sending" }),
                    invalid: submitFailed && errors?.scheduledAt != null,
                    content: (
                        <EmailCampaignSendingTab
                            baseUrl={baseUrl}
                            scope={scope}
                            savedCampaign={savedCampaign}
                            hasUnsavedChanges={hasUnsavedChanges}
                            addToast={addToast}
                        />
                    ),
                },
            ]}
        />
    );
}
