import { useApolloClient, useMutation } from "@apollo/client";
import { Field, FinalFormSelect, SaveButton, Tooltip, useAsyncOptionsProps, useStackSwitchApi } from "@dextinity/admin";
import { FinalFormDateTimePicker } from "@dextinity/admin-date-time";
import { Info, Newsletter } from "@dextinity/admin-icons";
import { BlockAdminComponentPaper, BlockAdminComponentSectionGroup, type ContentScope } from "@dextinity/cms-admin";
import { Card } from "@mui/material";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { SendEmailCampaignNowDialog } from "./SendEmailCampaignNowDialog";
import { sendEmailCampaignNowMutation, targetGroupsSelectQuery } from "./SendManagerFields.gql";
import type {
    GQLSendEmailCampaignNowMutation,
    GQLSendEmailCampaignNowMutationVariables,
    GQLTargetGroupSelectFragment,
    GQLTargetGroupsSelectQuery,
    GQLTargetGroupsSelectQueryVariables,
} from "./SendManagerFields.gql.generated";

interface SendManagerFieldsProps {
    scope: ContentScope;
    id?: string;
    isSendable: boolean;
    isCampaignCreated?: boolean;
}

const validateScheduledAt = (value: Date, now: Date) => {
    if (!value) {
        return;
    }

    if (value < now) {
        return (
            <FormattedMessage
                id="dextinity.emailCampaigns.sendManager.scheduledAt.validationError.pastDate"
                defaultMessage="Date must be in the future"
            />
        );
    }
};

export const SendManagerFields = ({ isCampaignCreated, scope, id, isSendable }: SendManagerFieldsProps) => {
    const stackSwitchApi = useStackSwitchApi();
    const apolloClient = useApolloClient();

    const [isSendEmailCampaignNowDialogOpen, setIsSendEmailCampaignNowDialogOpen] = useState(false);

    const selectAsyncMultipleProps = useAsyncOptionsProps(async () => {
        return (
            await apolloClient.query<GQLTargetGroupsSelectQuery, GQLTargetGroupsSelectQueryVariables>({
                query: targetGroupsSelectQuery,
                variables: { scope },
                fetchPolicy: "network-only",
            })
        ).data.brevoTargetGroups.nodes;
    });

    const [sendEmailCampaignNow, { loading: sendEmailCampaignNowLoading, error: sendEmailCampaignNowError }] = useMutation<
        GQLSendEmailCampaignNowMutation,
        GQLSendEmailCampaignNowMutationVariables
    >(sendEmailCampaignNowMutation);

    const now = new Date();
    return (
        <Card>
            <BlockAdminComponentPaper>
                <BlockAdminComponentSectionGroup
                    title={<FormattedMessage id="dextinity.emailCampaigns.sendManager.title" defaultMessage="Send Manager" />}
                >
                    <Field
                        component={FinalFormSelect}
                        getOptionLabel={(option: GQLTargetGroupSelectFragment) => option.title}
                        getOptionSelected={(option: GQLTargetGroupSelectFragment, value: string) => {
                            return option.id === value;
                        }}
                        {...selectAsyncMultipleProps}
                        name="targetGroups"
                        label={<FormattedMessage id="dextinity.emailCampaigns.targetGroups" defaultMessage="Target groups" />}
                        multiple
                        fullWidth
                    />
                    <Field
                        name="scheduledAt"
                        disabled={isCampaignCreated}
                        fullWidth
                        clearable
                        label={
                            <>
                                <FormattedMessage id="dextinity.emailCampaigns.scheduledAt" defaultMessage="Schedule date and time" />{" "}
                                {isCampaignCreated && (
                                    <Tooltip
                                        title={
                                            <FormattedMessage
                                                id="dextinity.emailCampaigns.scheduledAt.info"
                                                defaultMessage="Please select a target group and save the campaign before scheduling."
                                            />
                                        }
                                    >
                                        <Info />
                                    </Tooltip>
                                )}
                            </>
                        }
                        component={FinalFormDateTimePicker}
                        validate={(value) => (isCampaignCreated ? undefined : validateScheduledAt(value, now))}
                        componentsProps={{
                            datePicker: { placeholder: "DD.MM.YYYY", minDate: now },
                            timePicker: { placeholder: "HH:mm" },
                        }}
                    />

                    <SaveButton
                        variant="primary"
                        disabled={!isSendable || isCampaignCreated}
                        startIcon={<Newsletter />}
                        loading={sendEmailCampaignNowLoading}
                        hasErrors={!!sendEmailCampaignNowError}
                        onClick={() => {
                            setIsSendEmailCampaignNowDialogOpen(true);
                        }}
                    >
                        <FormattedMessage id="dextinity.emailCampaigns.sendNow.sendText" defaultMessage="Send email campaign now" />
                    </SaveButton>
                    <SendEmailCampaignNowDialog
                        dialogOpen={isSendEmailCampaignNowDialogOpen}
                        handleNoClick={() => {
                            setIsSendEmailCampaignNowDialogOpen(false);
                        }}
                        handleYesClick={async () => {
                            if (id) {
                                await sendEmailCampaignNow({ variables: { id } });
                                setIsSendEmailCampaignNowDialogOpen(false);
                                stackSwitchApi.activatePage(`grid`, "");
                            }
                        }}
                    />
                </BlockAdminComponentSectionGroup>
            </BlockAdminComponentPaper>
        </Card>
    );
};
