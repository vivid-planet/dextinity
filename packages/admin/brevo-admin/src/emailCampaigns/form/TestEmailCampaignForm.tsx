import { gql, useApolloClient, useQuery } from "@apollo/client";
import { Field, FinalForm, FinalFormSelect, SaveButton, Tooltip } from "@dextinity/admin";
import { Info, Newsletter } from "@dextinity/admin-icons";
import { BlockAdminComponentPaper, BlockAdminComponentSectionGroup, useContentScope } from "@dextinity/cms-admin";
import { Card } from "@mui/material";
import { FormattedMessage } from "react-intl";

import { useBrevoConfig } from "../../common/BrevoConfigProvider";
import type { GQLEmailCampaignContentScopeInput } from "../../graphql.generated";
import type { GQLBrevoTestContactsSelectListFragment } from "./TestEmailCampaignForm.generated";
import { SendEmailCampaignToTestEmailsMutation } from "./TestEmailCampaignForm.gql";
import type {
    GQLSendEmailCampaignToTestEmailsMutation,
    GQLSendEmailCampaignToTestEmailsMutationVariables,
} from "./TestEmailCampaignForm.gql.generated";

interface FormProps {
    testEmails: string[];
}

interface TestEmailCampaignFormProps {
    id?: string;
    isSendable?: boolean;
    scope: GQLEmailCampaignContentScopeInput;
    isCampaignCreated: boolean;
}

const brevoTestContactsSelectFragment = gql`
    fragment BrevoTestContactsSelectList on BrevoContact {
        id
        email
    }
`;

const brevoTestContactsSelectQuery = gql`
    query BrevoTestContactsGridSelect($offset: Int, $limit: Int, $email: String, $scope: EmailCampaignContentScopeInput!) {
        brevoTestContacts(offset: $offset, limit: $limit, email: $email, scope: $scope) {
            nodes {
                ...BrevoTestContactsSelectList
            }
            totalCount
        }
    }
    ${brevoTestContactsSelectFragment}
`;

export const TestEmailCampaignForm = ({ id, isSendable = false, isCampaignCreated }: TestEmailCampaignFormProps) => {
    const client = useApolloClient();

    const { scopeParts } = useBrevoConfig();
    const { scope: completeScope } = useContentScope();

    const scope = scopeParts.reduce(
        (acc, scopePart) => {
            acc[scopePart] = completeScope[scopePart];
            return acc;
        },
        {} as { [key: string]: unknown },
    );

    // Contact creation is limited to 100 at a time. Therefore, 100 contacts are queried without using pagination.
    const { data, loading, error } = useQuery(brevoTestContactsSelectQuery, {
        variables: { offset: 0, limit: 100, scope },
    });

    async function submitTestEmails({ testEmails }: FormProps) {
        if (id) {
            const { data } = await client.mutate<GQLSendEmailCampaignToTestEmailsMutation, GQLSendEmailCampaignToTestEmailsMutationVariables>({
                mutation: SendEmailCampaignToTestEmailsMutation,
                variables: { id, data: { emails: testEmails } },
            });
            return data?.sendBrevoEmailCampaignToTestEmails;
        }
    }

    const emailOptions: string[] = data?.brevoTestContacts?.nodes?.map((contact: GQLBrevoTestContactsSelectListFragment) => contact.email) || [];

    return (
        <Card sx={{ mt: 4 }}>
            <BlockAdminComponentPaper>
                <BlockAdminComponentSectionGroup
                    title={<FormattedMessage id="dextinity.emailCampaigns.testEmailCampaign.title" defaultMessage="Send test email campaign" />}
                >
                    <FinalForm<FormProps> mode="edit" onSubmit={submitTestEmails} initialValues={{ testEmails: [] }}>
                        {({ handleSubmit, submitting, values }) => {
                            return (
                                <>
                                    <Field
                                        component={FinalFormSelect}
                                        name="testEmails"
                                        label={
                                            <>
                                                <FormattedMessage
                                                    id="dextinity.emailCampaigns.testEmailCampaign.testEmails"
                                                    defaultMessage="Email addresses"
                                                />{" "}
                                                {isCampaignCreated && (
                                                    <Tooltip
                                                        title={
                                                            <FormattedMessage
                                                                id="dextinity.emailCampaigns.testEmails.info"
                                                                defaultMessage="Please select a target group and save the campaign before you can send test emails."
                                                            />
                                                        }
                                                    >
                                                        <Info />
                                                    </Tooltip>
                                                )}
                                            </>
                                        }
                                        fullWidth
                                        options={emailOptions}
                                        isLoading={loading}
                                        error={!!error}
                                        value={values.testEmails || []}
                                        getOptionLabel={(option: string) => option}
                                        disabled={isCampaignCreated}
                                    />
                                    <SaveButton
                                        disabled={!values.testEmails || !isSendable || !id || isCampaignCreated}
                                        startIcon={<Newsletter />}
                                        loading={submitting}
                                        onClick={() => {
                                            handleSubmit();
                                        }}
                                    >
                                        <FormattedMessage
                                            id="dextinity.emailCampaigns.testEmailCampaign.sendText"
                                            defaultMessage="Send test email campaign"
                                        />
                                    </SaveButton>
                                </>
                            );
                        }}
                    </FinalForm>
                </BlockAdminComponentSectionGroup>
            </BlockAdminComponentPaper>
        </Card>
    );
};
