import { useApolloClient, useMutation } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { type ContentScope, useDateTimePickerLabels } from "@dextinity/cms-admin";
import { Button, ConfirmDialog, Icon, type NewToast } from "@dextinity/ui";
import { ComboboxField, DateTimeField } from "@dextinity/ui-react-final-form";
import { useId, useState } from "react";
import { useField } from "react-final-form";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";

import { FormSection } from "../../common/form/FormSection";
import type { GQLEmailCampaignEditorFragment } from "./EmailCampaignEditor.gql.generated";
import { sendEmailCampaignNowMutation, targetGroupOptionsQuery } from "./EmailCampaignSendingTab.gql";
import type {
    GQLEmailCampaignTargetGroupOptionFragment,
    GQLEmailCampaignTargetGroupOptionsQuery,
    GQLEmailCampaignTargetGroupOptionsQueryVariables,
    GQLSendEmailCampaignNowMutation,
    GQLSendEmailCampaignNowMutationVariables,
} from "./EmailCampaignSendingTab.gql.generated";
import { ActionRow, Hint, TabBody } from "./EmailCampaignSendingTab.sc";
import { TestEmailCampaignForm } from "./TestEmailCampaignForm";
import { useSendBlockedReason } from "./useSendBlockedReason";

interface EmailCampaignSendingTabProps {
    baseUrl: string;
    scope: ContentScope;
    savedCampaign?: GQLEmailCampaignEditorFragment;
    hasUnsavedChanges: boolean;
    addToast: (toast: NewToast) => void;
}

function toIsoDate(date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

export function EmailCampaignSendingTab({ baseUrl, scope, savedCampaign, hasUnsavedChanges, addToast }: EmailCampaignSendingTabProps) {
    const intl = useIntl();
    const dateTimePickerLabels = useDateTimePickerLabels();
    const client = useApolloClient();
    const history = useHistory();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const sendBlockedReasonId = useId();
    const {
        input: { value: targetGroups },
    } = useField<GQLEmailCampaignTargetGroupOptionFragment[]>("targetGroups", { subscription: { value: true } });
    const sendBlockedReason = useSendBlockedReason({ savedCampaign, hasUnsavedChanges });
    const [sendNow, { loading: sending }] = useMutation<GQLSendEmailCampaignNowMutation, GQLSendEmailCampaignNowMutationVariables>(
        sendEmailCampaignNowMutation,
        { context: LocalErrorScopeApolloContext },
    );

    const loadTargetGroups = async (search: string) => {
        const { data } = await client.query<GQLEmailCampaignTargetGroupOptionsQuery, GQLEmailCampaignTargetGroupOptionsQueryVariables>({
            query: targetGroupOptionsQuery,
            variables: { scope, search: search || undefined },
            fetchPolicy: "network-only",
            context: LocalErrorScopeApolloContext,
        });
        return data.brevoTargetGroups.nodes;
    };

    const sendCampaignNow = async () => {
        if (savedCampaign == null) {
            return;
        }
        try {
            await sendNow({ variables: { id: savedCampaign.id } });
            setConfirmOpen(false);
            addToast({
                tone: "success",
                message: intl.formatMessage(
                    { id: "dextinity.emailCampaigns.sendNow.sent", defaultMessage: "“{title}” is being sent" },
                    { title: savedCampaign.title },
                ),
            });
            history.push(baseUrl);
        } catch (error) {
            setConfirmOpen(false);
            addToast({
                tone: "error",
                message: intl.formatMessage(
                    { id: "dextinity.emailCampaigns.sendNow.failed", defaultMessage: "The campaign wasn't sent: {reason}" },
                    { reason: error instanceof Error ? error.message : String(error) },
                ),
            });
        }
    };

    const hasTargetGroups = targetGroups.length > 0;
    const sendNowButton = (
        <Button
            aria-describedby={sendBlockedReason != null ? sendBlockedReasonId : undefined}
            variant="outlined"
            startIcon={<Icon name="mail-out" />}
            disabled={sendBlockedReason != null}
            loading={sending}
            onClick={() => setConfirmOpen(true)}
        >
            {intl.formatMessage({ id: "dextinity.emailCampaigns.sendNow", defaultMessage: "Send now" })}
        </Button>
    );

    return (
        <TabBody>
            <FormSection
                title={intl.formatMessage({ id: "dextinity.emailCampaigns.recipients", defaultMessage: "Recipients" })}
                description={intl.formatMessage({
                    id: "dextinity.emailCampaigns.recipientsDescription",
                    defaultMessage: "The campaign is sent to all contacts of the chosen target groups.",
                })}
            >
                <ComboboxField<GQLEmailCampaignTargetGroupOptionFragment, true>
                    name="targetGroups"
                    multiple
                    label={intl.formatMessage({ id: "dextinity.emailCampaigns.targetGroups", defaultMessage: "Target groups" })}
                    placeholder={intl.formatMessage({
                        id: "dextinity.emailCampaigns.targetGroupsPlaceholder",
                        defaultMessage: "Search target groups",
                    })}
                    loadOptions={loadTargetGroups}
                    getOptionLabel={(targetGroup) => targetGroup.title}
                    getOptionKey={(targetGroup) => targetGroup.id}
                    labels={{
                        loading: intl.formatMessage({ id: "dextinity.emailCampaigns.combobox.loading", defaultMessage: "Loading …" }),
                        noResults: intl.formatMessage({ id: "dextinity.emailCampaigns.combobox.noResults", defaultMessage: "No results" }),
                        error: intl.formatMessage({
                            id: "dextinity.emailCampaigns.targetGroups.loadFailed",
                            defaultMessage: "The target groups couldn't be loaded.",
                        }),
                        retry: intl.formatMessage({ id: "dextinity.emailCampaigns.combobox.retry", defaultMessage: "Retry" }),
                        clear: intl.formatMessage({ id: "dextinity.emailCampaigns.combobox.clear", defaultMessage: "Clear" }),
                        remove: (title) =>
                            intl.formatMessage({ id: "dextinity.emailCampaigns.combobox.remove", defaultMessage: "Remove {title}" }, { title }),
                    }}
                />
            </FormSection>
            <FormSection
                title={intl.formatMessage({ id: "dextinity.emailCampaigns.schedule", defaultMessage: "Schedule" })}
                description={intl.formatMessage({
                    id: "dextinity.emailCampaigns.scheduleDescription",
                    defaultMessage: "Saving with a date hands the campaign over to Brevo, which sends it then. Remove the date to keep it a draft.",
                })}
            >
                <DateTimeField
                    name="scheduledAt"
                    label={intl.formatMessage({ id: "dextinity.emailCampaigns.scheduledFor", defaultMessage: "Scheduled for" })}
                    clearable
                    min={toIsoDate(new Date())}
                    locale={intl.locale}
                    labels={dateTimePickerLabels}
                    disabled={!hasTargetGroups}
                    helperText={
                        hasTargetGroups
                            ? undefined
                            : intl.formatMessage({
                                  id: "dextinity.emailCampaigns.scheduledAt.needsTargetGroups",
                                  defaultMessage: "Choose target groups first",
                              })
                    }
                />
            </FormSection>
            <FormSection
                title={intl.formatMessage({ id: "dextinity.emailCampaigns.sendNow.title", defaultMessage: "Send now" })}
                description={intl.formatMessage({
                    id: "dextinity.emailCampaigns.sendNow.description",
                    defaultMessage: "Sends the saved campaign to its target groups right away.",
                })}
            >
                <ActionRow>
                    {sendNowButton}
                    {sendBlockedReason != null && <Hint id={sendBlockedReasonId}>{sendBlockedReason}</Hint>}
                </ActionRow>
            </FormSection>
            <TestEmailCampaignForm scope={scope} campaignId={savedCampaign?.id} sendBlockedReason={sendBlockedReason} addToast={addToast} />
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={(open) => {
                    if (!sending) {
                        setConfirmOpen(open);
                    }
                }}
                title={intl.formatMessage({ id: "dextinity.emailCampaigns.sendNow.dialog.title", defaultMessage: "Send email campaign now?" })}
                description={intl.formatMessage(
                    {
                        id: "dextinity.emailCampaigns.sendNow.dialog.description",
                        defaultMessage: "“{title}” is sent to {targetGroups}. This can't be undone.",
                    },
                    {
                        title: savedCampaign?.title,
                        targetGroups: intl.formatList(savedCampaign?.brevoTargetGroups.map((targetGroup) => targetGroup.title) ?? []),
                    },
                )}
                confirmLabel={intl.formatMessage({ id: "dextinity.emailCampaigns.sendNow.dialog.confirm", defaultMessage: "Send now" })}
                confirmIcon={<Icon name="mail-out" />}
                onConfirm={() => void sendCampaignNow()}
                loading={sending}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.emailCampaigns.cancel", defaultMessage: "Cancel" }) }}
            />
        </TabBody>
    );
}
