import { useApolloClient } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import type { ContentScope } from "@dextinity/cms-admin";
import { Button, Icon, type NewToast } from "@dextinity/ui";
import { ComboboxField } from "@dextinity/ui-react-final-form";
import { useId } from "react";
import { Form } from "react-final-form";
import { useIntl } from "react-intl";

import { FormSection } from "../../common/form/FormSection";
import { sendEmailCampaignToTestEmailsMutation, testContactOptionsQuery } from "./TestEmailCampaignForm.gql";
import type {
    GQLEmailCampaignTestContactOptionsQuery,
    GQLEmailCampaignTestContactOptionsQueryVariables,
    GQLSendEmailCampaignToTestEmailsMutation,
    GQLSendEmailCampaignToTestEmailsMutationVariables,
} from "./TestEmailCampaignForm.gql.generated";
import { ActionRow, Hint } from "./TestEmailCampaignForm.sc";

type TestContact = GQLEmailCampaignTestContactOptionsQuery["brevoTestContacts"]["nodes"][number];

interface TestEmailFormValues {
    testContacts: TestContact[];
}

const initialValues: TestEmailFormValues = { testContacts: [] };

interface TestEmailCampaignFormProps {
    scope: ContentScope;
    campaignId?: string;
    /** Why the campaign can't be sent yet. Test emails are blocked for the same reasons. */
    sendBlockedReason?: string;
    addToast: (toast: NewToast) => void;
}

/** Sends the saved campaign to chosen test contacts, a form of its own beside the campaign's form. */
export function TestEmailCampaignForm({ scope, campaignId, sendBlockedReason, addToast }: TestEmailCampaignFormProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const reasonId = useId();

    const loadTestContacts = async (email: string) => {
        // Brevo creates at most 100 contacts at a time, so there are never more test contacts than that
        const { data } = await client.query<GQLEmailCampaignTestContactOptionsQuery, GQLEmailCampaignTestContactOptionsQueryVariables>({
            query: testContactOptionsQuery,
            variables: { scope, email: email || undefined },
            fetchPolicy: "network-only",
            context: LocalErrorScopeApolloContext,
        });
        return data.brevoTestContacts.nodes;
    };

    const sendTestEmails = async ({ testContacts }: TestEmailFormValues) => {
        if (campaignId == null) {
            return;
        }
        try {
            const { data } = await client.mutate<GQLSendEmailCampaignToTestEmailsMutation, GQLSendEmailCampaignToTestEmailsMutationVariables>({
                mutation: sendEmailCampaignToTestEmailsMutation,
                variables: { id: campaignId, data: { emails: testContacts.map((contact) => contact.email) } },
                context: LocalErrorScopeApolloContext,
            });
            if (data?.sendBrevoEmailCampaignToTestEmails) {
                addToast({
                    tone: "success",
                    message: intl.formatMessage(
                        {
                            id: "dextinity.emailCampaigns.testEmail.sent",
                            defaultMessage: "{count, plural, one {Test email sent} other {# test emails sent}}",
                        },
                        { count: testContacts.length },
                    ),
                });
            } else {
                addToast({
                    tone: "error",
                    message: intl.formatMessage({
                        id: "dextinity.emailCampaigns.testEmail.notSent",
                        defaultMessage: "Brevo didn't send the test email",
                    }),
                });
            }
        } catch (error) {
            addToast({
                tone: "error",
                message: intl.formatMessage(
                    { id: "dextinity.emailCampaigns.testEmail.failed", defaultMessage: "The test email wasn't sent: {reason}" },
                    { reason: error instanceof Error ? error.message : String(error) },
                ),
            });
        }
    };

    return (
        <FormSection
            title={intl.formatMessage({ id: "dextinity.emailCampaigns.testEmail.title", defaultMessage: "Test email" })}
            description={intl.formatMessage({
                id: "dextinity.emailCampaigns.testEmail.description",
                defaultMessage: "Sends the saved campaign to test contacts, to check it in real inboxes before sending it.",
            })}
        >
            <Form<TestEmailFormValues> onSubmit={sendTestEmails} initialValues={initialValues}>
                {({ handleSubmit, submitting, values }) => (
                    <>
                        <ComboboxField<TestContact, true>
                            name="testContacts"
                            multiple
                            label={intl.formatMessage({ id: "dextinity.emailCampaigns.testEmail.testContacts", defaultMessage: "Test contacts" })}
                            placeholder={intl.formatMessage({
                                id: "dextinity.emailCampaigns.testEmail.testContactsPlaceholder",
                                defaultMessage: "Search email addresses",
                            })}
                            loadOptions={loadTestContacts}
                            getOptionLabel={(contact) => contact.email}
                            getOptionKey={(contact) => String(contact.id)}
                            disabled={sendBlockedReason != null}
                            labels={{
                                loading: intl.formatMessage({ id: "dextinity.emailCampaigns.combobox.loading", defaultMessage: "Loading …" }),
                                noResults: intl.formatMessage({ id: "dextinity.emailCampaigns.combobox.noResults", defaultMessage: "No results" }),
                                error: intl.formatMessage({
                                    id: "dextinity.emailCampaigns.testEmail.loadFailed",
                                    defaultMessage: "The test contacts couldn't be loaded.",
                                }),
                                retry: intl.formatMessage({ id: "dextinity.emailCampaigns.combobox.retry", defaultMessage: "Retry" }),
                                clear: intl.formatMessage({ id: "dextinity.emailCampaigns.combobox.clear", defaultMessage: "Clear" }),
                                remove: (email) =>
                                    intl.formatMessage(
                                        { id: "dextinity.emailCampaigns.combobox.remove", defaultMessage: "Remove {title}" },
                                        { title: email },
                                    ),
                            }}
                        />
                        <ActionRow>
                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<Icon name="mail" />}
                                disabled={sendBlockedReason != null || values.testContacts.length === 0}
                                loading={submitting}
                                aria-describedby={sendBlockedReason != null ? reasonId : undefined}
                                onClick={() => void handleSubmit()}
                            >
                                {intl.formatMessage({ id: "dextinity.emailCampaigns.testEmail.send", defaultMessage: "Send test email" })}
                            </Button>
                            {sendBlockedReason != null && <Hint id={reasonId}>{sendBlockedReason}</Hint>}
                        </ActionRow>
                    </>
                )}
            </Form>
        </FormSection>
    );
}
